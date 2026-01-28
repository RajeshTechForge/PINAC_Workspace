import { IpcMainEvent } from "electron";
import { ChatRequest, Message } from "@/types";
import SecureMasterKeyManager from "../utils/masterKeyManager";
import SecureTokenManager from "../utils/tokenManager";
import { WebSearchService } from "../services/webSearchService";

const BACKEND_URL = process.env.VITE_BACKEND_URL || "http://localhost:8000";

export class CustomProviderHandler {
  private static getProviderConfig() {
    const masterKey = SecureMasterKeyManager.getPersistentMasterKey();
    const tokenManager = new SecureTokenManager(masterKey);
    const configStr = tokenManager.retrieveToken("custom_provider_config");

    if (!configStr) {
      throw new Error(
        "Custom provider configuration not found. Please check your settings.",
      );
    }

    return JSON.parse(configStr);
  }

  private static getTavilyApiKey(): string {
    const masterKey = SecureMasterKeyManager.getPersistentMasterKey();
    const tokenManager = new SecureTokenManager(masterKey);
    return tokenManager.retrieveToken("tavily_api_key") || "";
  }

  // Call backend LLM for query generation or chat
  private static async callBackendLLM(
    provider: string,
    model: string,
    apiKey: string,
    query: string,
    history: Message[] = [],
    stream: boolean = false,
  ): Promise<string> {
    const response = await fetch(`${BACKEND_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider,
        model,
        api_key: apiKey,
        history,
        query,
        stream,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `Backend error: ${response.statusText}`,
      );
    }

    const data = await response.json();

    // Extract response content
    let responseContent = "";

    if (typeof data === "string") {
      responseContent = data;
    } else if (data.response !== undefined && data.response !== null) {
      responseContent = String(data.response);
    } else if (data.content !== undefined && data.content !== null) {
      responseContent = String(data.content);
    } else if (data.message !== undefined && data.message !== null) {
      responseContent = String(data.message);
    } else {
      throw new Error("Invalid response format from backend");
    }

    // Clean up the response
    responseContent = responseContent
      .trim()
      .replace(/^["']|["']$/g, "")
      .replace(/^Search query:\s*/i, "")
      .trim();

    if (!responseContent) {
      throw new Error("Backend returned empty response");
    }

    return responseContent;
  }

  static async handleStreamingChat(
    event: IpcMainEvent,
    request: ChatRequest,
    signal: AbortSignal,
  ): Promise<void> {
    const { messages, prompt, web_search } = request;

    const config = this.getProviderConfig();
    const { subProvider, modelName, apiKey } = config;

    if (!apiKey) {
      throw new Error("API Key is missing for custom provider.");
    }

    let enhancedPrompt = prompt;

    // Handle web search if enabled
    if (web_search) {
      const tavilyApiKey = this.getTavilyApiKey();

      if (!tavilyApiKey) {
        event.sender.send("chat-stream-data", {
          content:
            "[Warning: Tavily API key not configured. Skipping web search...]\n\n",
        });
      } else {
        try {
          enhancedPrompt = await WebSearchService.executeWebSearch(
            modelName,
            messages,
            prompt,
            "custom",
            tavilyApiKey,
            async (queryPrompt: string) => {
              return await this.callBackendLLM(
                subProvider,
                modelName,
                apiKey,
                queryPrompt,
                [],
                false,
              );
            },
            (status: string) => {
              event.sender.send("chat-stream-data", { content: status });
            },
          );
        } catch (error: any) {
          event.sender.send("chat-stream-data", {
            content: `[Web search failed: ${error.message}. Proceeding without search...]\n\n`,
          });
        }
      }
    }

    // Update messages with enhanced prompt
    const history = messages.slice(0, -1);

    // Stream response from backend
    const response = await fetch(`${BACKEND_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider: subProvider,
        model: modelName,
        api_key: apiKey,
        history,
        query: enhancedPrompt,
        stream: true,
      }),
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `Backend error: ${response.statusText}`,
      );
    }

    if (!response.body) {
      throw new Error("Response body is empty");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    try {
      let done = false;
      while (!done && !signal.aborted) {
        const result = await reader.read();
        done = result.done;

        if (result.value) {
          const chunk = decoder.decode(result.value, { stream: !done });
          if (chunk) {
            event.sender.send("chat-stream-data", { content: chunk });
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}
