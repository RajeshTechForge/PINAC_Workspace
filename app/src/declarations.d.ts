declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.svg";

// Ollama Model Types
interface OllamaModel {
  name: string;
  size: number;
  modified_at: string;
  details: {
    format: string;
    family: string;
    families: string[] | null;
    parameter_size: string;
    quantization_level: string;
  };
}

// IPC Renderer API
interface IpcRenderer {
  on(
    channel: string,
    listener: (event: any, ...args: any[]) => void,
  ): () => void;
  once(...args: any[]): void;
  off(...args: any[]): void;
  send(channel: string, ...args: any[]): void;
  invoke(channel: string, ...args: any[]): Promise<any>;
}

declare global {
  interface Window {
    ipcRenderer: IpcRenderer;
  }
}
