import { useEffect, useRef, useCallback } from "react";
import { ChatStreamChunk } from "@/types";

interface ChatStreamHandlers {
  onData: (chunk: ChatStreamChunk) => void;
  onError: (error: string) => void;
  onDone: () => void;
}

interface UseChatStreamReturn {
  isListening: boolean;
  registerHandlers: (handlers: ChatStreamHandlers) => void;
}

// Singleton pattern for IPC listener management
const StreamListenerManager = {
  handlers: null as ChatStreamHandlers | null,
  initialized: false,

  setHandlers(handlers: ChatStreamHandlers) {
    this.handlers = handlers;
  },

  init() {
    if (
      this.initialized ||
      typeof window === "undefined" ||
      !window.ipcRenderer
    ) {
      return this.initialized;
    }

    window.ipcRenderer.on(
      "chat-stream-data",
      (_event: unknown, chunk: ChatStreamChunk) => {
        this.handlers?.onData(chunk);
      },
    );

    window.ipcRenderer.on(
      "chat-stream-error",
      (_event: unknown, error: string) => {
        this.handlers?.onError(error);
      },
    );

    window.ipcRenderer.on("chat-stream-done", () => {
      this.handlers?.onDone();
    });

    this.initialized = true;
    return true;
  },
};

export const useChatStream = (): UseChatStreamReturn => {
  const isListeningRef = useRef(false);

  const registerHandlers = useCallback((handlers: ChatStreamHandlers) => {
    StreamListenerManager.setHandlers(handlers);
  }, []);

  useEffect(() => {
    isListeningRef.current = StreamListenerManager.init();
  }, []);

  return {
    isListening: isListeningRef.current,
    registerHandlers,
  };
};

export const startChatStream = (request: any): void => {
  window.ipcRenderer.send("start-chat-stream", request);
};

export const stopChatStream = async (): Promise<void> => {
  await window.ipcRenderer.invoke("stop-chat-stream");
};
