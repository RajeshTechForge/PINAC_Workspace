import { Message } from "@/types";

const BACKEND_URL = process.env.VITE_BACKEND_URL || "http://localhost:8000";

export class WebSearchService {
  static async generateSearchQuery(
    _model: string,
    messages: Message[],
    prompt: string,
    _provider: string,
    llmCaller: (queryPrompt: string) => Promise<string>,
  ): Promise<string> {
    // Get last3 exchanges max
    const historyMessages = messages.slice(0, -1);
    const recentMessages = historyMessages.slice(-6);
    const hasContext = recentMessages.length > 0;
    console.log(hasContext);
    const queryGenPrompt = hasContext
      ? `Generate a web search query for: "${prompt}"

Recent conversation context:
${recentMessages.map((msg) => `${msg.role}: ${msg.content}`).join("\n")}

Return only the search query text (3-8 words), nothing else:`
      : `Generate a web search query for: "${prompt}"

Return only the search query text (3-8 words), nothing else:`;

    try {
      const searchQuery = await llmCaller(queryGenPrompt);
      const trimmedQuery = searchQuery.trim();

      if (!trimmedQuery || trimmedQuery.length === 0) {
        return prompt;
      }

      return trimmedQuery;
    } catch (error: any) {
      // fallback
      return prompt;
    }
  }

  static async performWebSearch(
    searchQuery: string,
    tavilyApiKey: string,
  ): Promise<string> {
    const response = await fetch(`${BACKEND_URL}/api/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: searchQuery,
        api_key: tavilyApiKey,
        search_depth: "basic",
        include_answer: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg =
        errorData.detail || errorData.message || JSON.stringify(errorData);
      throw new Error(`Search failed (${response.status}): ${errorMsg}`);
    }

    const data = await response.json();
    return data.context;
  }

  static enhanceQueryWithSearch(
    originalQuery: string,
    searchContext: string,
  ): string {
    return `Answer the following question using the provided web search context. If the context is relevant, use it to provide accurate and up-to-date information.

Web Search Context:
${searchContext}

User Question: ${originalQuery}

Provide a comprehensive answer based on the search results above.`;
  }

  static async executeWebSearch(
    model: string,
    messages: Message[],
    prompt: string,
    provider: string,
    tavilyApiKey: string,
    llmCaller: (queryPrompt: string) => Promise<string>,
    onStatus?: (status: string) => void,
  ): Promise<string> {
    try {
      onStatus?.("[Searching the web...]\n\n");

      const searchQuery = await this.generateSearchQuery(
        model,
        messages,
        prompt,
        provider,
        llmCaller,
      );

      const searchContext = await this.performWebSearch(
        searchQuery,
        tavilyApiKey,
      );

      onStatus?.("[Search complete. Generating answer...]\n\n");

      return this.enhanceQueryWithSearch(prompt, searchContext);
    } catch (error: any) {
      onStatus?.(
        `[Web search failed: ${error.message}. Proceeding without search results...]\n\n`,
      );
      // fallback
      return prompt;
    }
  }
}
