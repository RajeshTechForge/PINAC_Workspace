export interface CustomProviderOption {
  id: string;
  name: string;
  models: string[];
}

export const CUSTOM_PROVIDERS: CustomProviderOption[] = [
  // {
  //   id: "openai",
  //   name: "OpenAI",
  //   models: ["gpt-5", "gpt-5-mini", "gpt-4o", "gpt-4o-mini"],
  // },
  {
    id: "gemini",
    name: "Gemini Gen AI",
    models: [
      "gemini-3-pro-preview",
      "gemini-3-flash-preview",
      "gemini-2.5-pro",
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite"
    ],
  },
  // {
  //   id: "claude",
  //   name: "Claude",
  //   models: ["claude-4.5-opus", "claude-4.5-sonnet", "claude-4.5-haiku"],
  // },
];

export const getCustomProviderOptions = () => CUSTOM_PROVIDERS;

export const getCustomModelsForProvider = (providerId: string): string[] => {
  const provider = CUSTOM_PROVIDERS.find((p) => p.id === providerId);
  return provider ? provider.models : [];
};
