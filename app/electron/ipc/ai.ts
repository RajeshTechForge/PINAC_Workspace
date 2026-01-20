import { ipcMain } from "electron";
import { ChatRequest } from "@/types";

// TODO: Externalize configuration
const BACKEND_PORT = 8000;
const CLOUD_URL = `http://localhost:${BACKEND_PORT}/api/chat/pinac-cloud/stream`;
const OLLAMA_URL = `http://localhost:${BACKEND_PORT}/api/chat/ollama/stream`;

let activeAbortController: AbortController | null = null;

export const registerAiHandlers = () => {
    
  ipcMain.on("start-chat-stream", async (event, request: ChatRequest) => {
    const { provider, ...body } = request;
    const apiUrl = provider === "pinac-cloud" ? CLOUD_URL : OLLAMA_URL;

    // Cancel previous request if any (though usually frontend handles this logic too)
    if (activeAbortController) {
      activeAbortController.abort();
    }
    
    activeAbortController = new AbortController();
    const signal = activeAbortController.signal;

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, stream: true }),
        signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        event.sender.send("chat-stream-error", `HTTP Error ${response.status}: ${errorText}`);
        return;
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      // Node.js fetch response body is a ReadableStream (or similar in Electron depending on version/context)
      // Since Electron uses Node.js, we might need to handle it as Node stream or standard Web stream depending on 'fetch' implementation used.
      // Electron 18+ uses native fetch which returns standard Web Streams.
      
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
        if (error.name === 'AbortError') {
             // Request cancelled, usually intentional
        } else {
             console.error("Stream error:", error);
             event.sender.send("chat-stream-error", error.message || "Unknown error");
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
};
