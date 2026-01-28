import { IpcMainEvent } from "electron";
import { ChatRequest } from "@/types";
import SecureMasterKeyManager from "../utils/masterKeyManager";
import SecureTokenManager from "../utils/tokenManager";
import {
  streamChatResponse,
  getChatResponse,
  isOllamaAvailable,
} from "../services/ollama";
import { WebSearchService } from "../services/webSearchService";

export class OllamaHandler {
  private static getTavilyApiKey(): string {
    const masterKey = SecureMasterKeyManager.getPersistentMasterKey();
    const tokenManager = new SecureTokenManager(masterKey);
    return tokenManager.retrieveToken("tavily_api_key") || "";
  }

  static async handleStreamingChat(
    event: IpcMainEvent,
    request: ChatRequest,
    signal: AbortSignal,
  ): Promise<void> {
    const { model, messages, prompt, web_search } = request;

    if (!model) {
      throw new Error("Model is required for Ollama");
    }

    // Check if Ollama is running
    const ollamaRunning = await isOllamaAvailable();
    if (!ollamaRunning) {
      throw new Error(
        "Ollama is not running. Please start Ollama and try again.",
      );
    }

    let enhancedPrompt = prompt;
    let enhancedMessages = [...messages];

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
            model,
            messages,
            prompt,
            "ollama",
            tavilyApiKey,
            async (queryPrompt: string) => {
              return await getChatResponse(model, [
                { role: "user", content: queryPrompt },
              ]);
            },
            (status: string) => {
              event.sender.send("chat-stream-data", { content: status });
            },
          );

          // Update the last message with enhanced prompt
          if (enhancedMessages.length > 0) {
            enhancedMessages = [...enhancedMessages];
            enhancedMessages[enhancedMessages.length - 1] = {
              ...enhancedMessages[enhancedMessages.length - 1],
              content: enhancedPrompt,
            };
          }
        } catch (error: any) {
          console.error("Web search error:", error);
          event.sender.send("chat-stream-data", {
            content: `[Web search failed: ${error.message}. Proceeding without search...]\n\n`,
          });
        }
      }
    }

    // Stream response from Ollama
    await streamChatResponse(
      model,
      enhancedMessages,
      (content: string) => {
        event.sender.send("chat-stream-data", { content });
      },
      () => {
        event.sender.send("chat-stream-done");
      },
      (error: string) => {
        event.sender.send("chat-stream-error", error);
      },
      signal,
    );
  }
}
