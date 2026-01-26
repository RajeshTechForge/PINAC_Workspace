//          MESSAGE & CHAT TYPES
// ----------------------------------------

export type MessageRole = "user" | "assistant" | "system";

export interface Message {
  role: MessageRole;
  content: string;
}

export interface UIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  modelName: string;
  attachmentName?: string;
  isStreaming?: boolean;
}

export interface DatabaseMessage {
  id: number;
  role: string;
  text: string;
  modelName: string;
  attachment?: string;
}

//        MODEL & SETTINGS TYPES
// ----------------------------------------
export type ModelProvider = string;

export interface SelectedModel {
  providerId: string;
  providerName: string;
  modelId: string;
  modelName: string;
}

export interface ProviderSettings {
  [providerId: string]: {
    temperature?: number;
    maxTokens?: number;
    topK?: number;
    topP?: number;
    [key: string]: any; // Allow custom settings for provider
  };
}

//        ATTACHMENT TYPES
// ------------------------------------

export interface FileAttachment {
  name: string;
  path: string;
  extension: string;
  nameWithoutExtension: string;
}

//      API REQUEST/RESPONSE TYPES
// -------------------------------------

export interface ChatRequest {
  prompt: string;
  messages: Message[];
  provider: ModelProvider;
  model: string;
  web_search: boolean;
  rag?: boolean;
  documents_path?: string;
}

export interface ChatStreamChunk {
  content?: string;
  done?: boolean;
  error?: string;
}

// IPC Channel names for chat streaming
export type ChatStreamChannel =
  | "chat-stream-data"
  | "chat-stream-error"
  | "chat-stream-done";

//          DATABASE TYPES
// --------------------------------------

export interface ChatSession {
  id: string;
  timestamp: Date;
  title: string;
  messages: DatabaseMessage[];
}

//        UI STATE TYPES
// --------------------------------------

export interface ChatState {
  messages: UIMessage[];
  sessionId: string | null;
  isStreaming: boolean;
  inputText: string;
}

export type LoadingState = "idle" | "loading" | "success" | "error";

//    IPC TYPES (Renderer ↔ Main Process)
// -------------------------------------------

export interface IpcRendererEvents {
  "start-chat-stream": ChatRequest;
  "stop-chat-stream": void;
}

export interface IpcMainEvents {
  "chat-stream-data": (chunk: ChatStreamChunk) => void;
  "chat-stream-error": (error: string) => void;
  "chat-stream-done": () => void;
}
