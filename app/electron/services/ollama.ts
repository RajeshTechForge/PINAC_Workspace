import { Ollama } from "ollama";
import { Message } from "@/types";

const ollama = new Ollama({ host: "http://localhost:11434" });

export async function streamChatResponse(
  model: string,
  messages: Message[],
  onChunk: (content: string) => void,
  onDone: () => void,
  onError: (error: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  try {
    const response = await ollama.chat({
      model,
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      stream: true,
    });

    for await (const chunk of response) {
      if (signal?.aborted) {
        break;
      }

      if (chunk.message?.content) {
        onChunk(chunk.message.content);
      }

      if (chunk.done) {
        onDone();
        break;
      }
    }
  } catch (error: any) {
    if (signal?.aborted) {
      return;
    }
    console.error("Ollama stream error:", error);
    onError(error.message || "Failed to stream response from Ollama");
  }
}

export async function getChatResponse(
  model: string,
  messages: Message[],
): Promise<string> {
  try {
    const response = await ollama.chat({
      model,
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      stream: false,
    });

    return response.message.content;
  } catch (error: any) {
    console.error("Ollama chat error:", error);
    throw new Error(error.message || "Failed to get response from Ollama");
  }
}

export async function getDownloadedModels(): Promise<
  Array<{
    name: string;
    modified_at: string;
    size: number;
    digest: string;
    details: {
      format: string;
      family: string;
      families: string[] | null;
      parameter_size: string;
      quantization_level: string;
    };
  }>
> {
  try {
    const response = await ollama.list();
    // Map to match our expected interface
    return response.models.map((model: any) => ({
      name: model.name,
      modified_at: model.modified_at,
      size: model.size,
      digest: model.digest,
      details: {
        format: model.details?.format || "",
        family: model.details?.family || "",
        families: model.details?.families || null,
        parameter_size: model.details?.parameter_size || "",
        quantization_level: model.details?.quantization_level || "",
      },
    }));
  } catch (error: any) {
    console.error("Failed to fetch Ollama models:", error);
    throw new Error(error.message || "Failed to fetch Ollama models");
  }
}

export async function isOllamaAvailable(): Promise<boolean> {
  try {
    await ollama.list();
    return true;
  } catch (error) {
    return false;
  }
}
