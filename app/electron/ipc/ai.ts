import { ipcMain } from "electron";
import { ChatRequest } from "@/types";
import {
  streamChatResponse,
  getDownloadedModels,
  isOllamaAvailable,
} from "../model/ollama";

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
