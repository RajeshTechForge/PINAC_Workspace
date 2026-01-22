import { ipcMain } from "electron";
import { ChatRequest } from "@/types";
import {
  streamChatResponse,
  getDownloadedModels,
  isOllamaAvailable,
} from "../model/ollama";

// TODO: Externalize configuration
const BACKEND_PORT = 8000;
const CLOUD_URL = `http://localhost:${BACKEND_PORT}/api/chat/pinac-cloud/stream`;

let activeAbortController: AbortController | null = null;

export const registerAiHandlers = () => {
  ipcMain.on("start-chat-stream", async (event, request: ChatRequest) => {
    const { provider, model, messages } = request;

    // Cancel previous request if any
    if (activeAbortController) {
      activeAbortController.abort();
    }

    activeAbortController = new AbortController();
    const signal = activeAbortController.signal;

    // Handle Ollama provider using local ollama module
    if (provider === "ollama") {
      if (!model) {
        event.sender.send("chat-stream-error", "Model is required for Ollama");
        activeAbortController = null;
        return;
      }

      // Check if Ollama is available before attempting to stream
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
        // onChunk
        (content: string) => {
          event.sender.send("chat-stream-data", { content });
        },
        // onDone
        () => {
          event.sender.send("chat-stream-done");
          activeAbortController = null;
        },
        // onError
        (error: string) => {
          event.sender.send("chat-stream-error", error);
          activeAbortController = null;
        },
        signal,
      );
      return;
    }

    // Handle Pinac Cloud provider using backend API
    const apiUrl = CLOUD_URL;
    const { provider: _provider, ...body } = request;

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, stream: true }),
        signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        event.sender.send(
          "chat-stream-error",
          `HTTP Error ${response.status}: ${errorText}`,
        );
        return;
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        if (signal.aborted) break;

        const { done, value } = await reader.read();
        if (done) {
          event.sender.send("chat-stream-done");
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              event.sender.send("chat-stream-data", data);
            } catch (e) {
              console.error("Parse error", e);
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        // Request cancelled, usually intentional
      } else {
        console.error("Stream error:", error);
        event.sender.send(
          "chat-stream-error",
          error.message || "Unknown error",
        );
      }
    } finally {
      activeAbortController = null;
    }
  });

  ipcMain.handle("stop-chat-stream", () => {
    if (activeAbortController) {
      activeAbortController.abort();
      activeAbortController = null;
    }
    return true;
  });

  // Get list of downloaded Ollama models
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
      // Return empty array instead of throwing to allow graceful degradation
      return [];
    }
  });
};
