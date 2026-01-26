import { ipcMain } from "electron";
import { ChatRequest } from "@/types";
import SecureMasterKeyManager from "../utils/masterKeyManager";
import SecureTokenManager from "../utils/tokenManager";
import {
  streamChatResponse,
  getDownloadedModels,
  isOllamaAvailable,
} from "../model/ollama";

let activeAbortController: AbortController | null = null;
const BACKEND_URL = process.env.VITE_BACKEND_URL || "http://localhost:8000";

export const registerAiHandlers = () => {
  ipcMain.on("start-chat-stream", async (event, request: ChatRequest) => {
    const { provider, model, messages, prompt } = request;

    if (activeAbortController) {
      activeAbortController.abort();
    }

    activeAbortController = new AbortController();
    const signal = activeAbortController.signal;

    // Ollama Provider
    if (provider === "ollama") {
      if (!model) {
        event.sender.send("chat-stream-error", "Model is required for Ollama");
        activeAbortController = null;
        return;
      }

      const ollamaRunning = await isOllamaAvailable();
      if (!ollamaRunning) {
        event.sender.send(
          "chat-stream-error",
          "Ollama is not running. Please start Ollama and try again.",
        );
        activeAbortController = null;
        return;
      }

      await streamChatResponse(
        model,
        messages,
        (content: string) => {
          event.sender.send("chat-stream-data", { content });
        },
        () => {
          event.sender.send("chat-stream-done");
          activeAbortController = null;
        },
        (error: string) => {
          event.sender.send("chat-stream-error", error);
          activeAbortController = null;
        },
        signal,
      );
      return;
    }

    // Custom Provider (Python Backend)
    if (provider === "custom") {
      try {
        // Retrieve custom provider config
        const masterKey = SecureMasterKeyManager.getPersistentMasterKey();
        const tokenManager = new SecureTokenManager(masterKey);
        const configStr = tokenManager.retrieveToken("custom_provider_config");

        if (!configStr) {
          throw new Error(
            "Custom provider configuration not found. Please check your settings.",
          );
        }

        const config = JSON.parse(configStr);
        const { subProvider, modelName, apiKey } = config;

        if (!apiKey) {
          throw new Error("API Key is missing for custom provider.");
        }

        const history = messages.slice(0, -1);

        const payload = {
          provider: subProvider,
          model: modelName,
          api_key: apiKey,
          history: history,
          query: prompt,
          stream: true,
        };

        const response = await fetch(`${BACKEND_URL}/api/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
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

        if (!signal.aborted) {
          event.sender.send("chat-stream-done");
        }
      } catch (error: any) {
        if (error.name === "AbortError") return;
        console.error("Custom provider error:", error);
        event.sender.send("chat-stream-error", error.message);
      } finally {
        activeAbortController = null;
      }
      return;
    }
  });

  ipcMain.handle("stop-chat-stream", () => {
    if (activeAbortController) {
      activeAbortController.abort();
      activeAbortController = null;
    }
    return true;
  });

  ipcMain.handle("get-ollama-models", async () => {
    try {
      const models = await getDownloadedModels();
      return models.map((model) => ({
        name: model.name,
        size: model.size,
        modified_at: model.modified_at,
        details: model.details,
      }));
    } catch (error: any) {
      console.error("Failed to get Ollama models:", error);
      return [];
    }
  });
};
