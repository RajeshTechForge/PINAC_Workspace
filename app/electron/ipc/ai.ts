import { ipcMain } from "electron";
import { ChatRequest } from "@/types";
import { getDownloadedModels } from "../services/ollama";
import { OllamaHandler } from "../handlers/ollamaHandler";
import { CustomProviderHandler } from "../handlers/customProviderHandler";

let activeAbortController: AbortController | null = null;

export const registerAiHandlers = () => {
  // Handle streaming chat requests
  ipcMain.on("start-chat-stream", async (event, request: ChatRequest) => {
    const { provider } = request;

    if (activeAbortController) {
      activeAbortController.abort();
    }

    activeAbortController = new AbortController();
    const signal = activeAbortController.signal;

    try {
      // Ollama provider
      if (provider === "ollama") {
        await OllamaHandler.handleStreamingChat(event, request, signal);
        activeAbortController = null;
      } // Custom provider
      else if (provider === "custom") {
        await CustomProviderHandler.handleStreamingChat(event, request, signal);
        if (!signal.aborted) {
          event.sender.send("chat-stream-done");
        }
        activeAbortController = null;
      } else {
        event.sender.send(
          "chat-stream-error",
          `Unsupported provider: ${provider}`,
        );
        activeAbortController = null;
      }
    } catch (error: any) {
      if (error.name === "AbortError") return;
      console.error("Chat stream error:", error);
      event.sender.send("chat-stream-error", error.message);
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
