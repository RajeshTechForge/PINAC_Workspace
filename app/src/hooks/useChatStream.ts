import { useEffect, useRef } from "react";
import { ChatStreamChunk } from "@/types";

interface ChatStreamHandlers {
  onData: (chunk: ChatStreamChunk) => void;
  onError: (error: string) => void;
  onDone: () => void;
}

interface UseChatStreamReturn {
  isListening: boolean;
}

export const useChatStream = (
  handlers: ChatStreamHandlers,
): UseChatStreamReturn => {
  const { onData, onError, onDone } = handlers;
  const isListeningRef = useRef(false);

  const onDataRef = useRef(onData);
  const onErrorRef = useRef(onError);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDataRef.current = onData;
    onErrorRef.current = onError;
    onDoneRef.current = onDone;
  }, [onData, onError, onDone]);

  useEffect(() => {
    const handleData = (_event: any, chunk: ChatStreamChunk) => {
      onDataRef.current(chunk);
    };

    const handleError = (_event: any, error: string) => {
      onErrorRef.current(error);
    };

    const handleDone = () => {
      onDoneRef.current();
    };

    // Register IPC listeners
    const removeDataListener = window.ipcRenderer.on(
      "chat-stream-data",
      handleData,
    );
    const removeErrorListener = window.ipcRenderer.on(
      "chat-stream-error",
      handleError,
    );
    const removeDoneListener = window.ipcRenderer.on(
      "chat-stream-done",
      handleDone,
    );

    isListeningRef.current = true;

    return () => {
      removeDataListener();
      removeErrorListener();
      removeDoneListener();
      isListeningRef.current = false;
    };
  }, []);

  return {
    isListening: isListeningRef.current,
  };
};

export const startChatStream = (request: any): void => {
  window.ipcRenderer.send("start-chat-stream", request);
};

export const stopChatStream = async (): Promise<void> => {
  await window.ipcRenderer.invoke("stop-chat-stream");
};
