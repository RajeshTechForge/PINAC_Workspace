//          MESSAGE & CHAT TYPES
// ----------------------------------------

/** Supported message roles in a conversation */
export type MessageRole = "user" | "assistant" | "system";

/** Single message in a chat conversation */
export interface Message {
  role: MessageRole;
  content: string;
}

/** Message stored in UI state with metadata */
export interface UIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  modelName?: string;
  attachmentName?: string;
  isStreaming?: boolean;
}

/** Message stored in database */
export interface DatabaseMessage {
  id: number;
  role: string;
  text: string;
  modelName: string;
  attachment?: string;
}

//        MODEL & SETTINGS TYPES
// ----------------------------------------

/** Supported AI model providers */
export type ModelProvider = "pinac-cloud" | "ollama";

/** Model type configuration */
export type ModelType = "Pinac Cloud Model" | "Ollama Model";

/** Available Pinac Cloud models */
export type PinacCloudModel = "Base Model";

/** Model configuration settings */
export interface ModelSettings {
  modelType: ModelType;
  pinacCloudModel: PinacCloudModel;
  ollamaModel: string | null;
  webSearch: boolean;
}

//        ATTACHMENT TYPES
// ------------------------------------

/** File attachment metadata */
export interface FileAttachment {
  name: string;
  path: string;
  extension: string;
  nameWithoutExtension: string;
}

//      API REQUEST/RESPONSE TYPES
// -------------------------------------

/** Unified chat request payload */
export interface ChatRequest {
  prompt: string;
  messages: Message[];
  provider: ModelProvider;
  model?: string; // Required for Ollama, ignored for Pinac Cloud
  web_search?: boolean;
  rag?: boolean;
  documents_path?: string;
}

/** Streaming chunk response */
export interface ChatStreamChunk {
  content?: string;
  done?: boolean;
  error?: string;
}

/** IPC Channel names for chat streaming */
export type ChatStreamChannel =
  | "chat-stream-data"
  | "chat-stream-error"
  | "chat-stream-done";

//          DATABASE TYPES
// --------------------------------------

/** Chat session stored in IndexedDB */
export interface ChatSession {
  id: string;
  timestamp: Date;
  title: string;
  messages: DatabaseMessage[];
}

//        UI STATE TYPES
// --------------------------------------

/** Chat UI state */
export interface ChatState {
  messages: UIMessage[];
  sessionId: string | null;
  isStreaming: boolean;
  inputText: string;
}

/** Loading state for async operations */
export type LoadingState = "idle" | "loading" | "success" | "error";

//    IPC TYPES (Renderer ↔ Main Process)
// -------------------------------------------

/** IPC events for renderer process */
export interface IpcRendererEvents {
  "start-chat-stream": ChatRequest;
  "stop-chat-stream": void;
}

/** IPC event handlers from main process */
export interface IpcMainEvents {
  "chat-stream-data": (chunk: ChatStreamChunk) => void;
  "chat-stream-error": (error: string) => void;
  "chat-stream-done": () => void;
}
