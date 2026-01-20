//  MODEL CONFIGURATION
// ---------------------
// All model providers, their models, and settings are defined here.
// To add a new provider: Just add it to MODEL_PROVIDERS object below.
//

export interface ModelProviderConfig {
  id: string;
  name: string;
  displayName: string;
  models: ModelConfig[];
  defaultSettings?: Record<string, any>;
}

export interface ModelConfig {
  id: string;
  name: string;
  displayName: string;
}

export interface AdvancedSettings {
  temperature: number;
  maxTokens: number;
  topK: number;
  topP: number;
}

//      PROVIDER & MODEL DEFINITIONS
// ----------------------------------------

/**
 * Central configuration for all AI model providers
 *
 * TO ADD A NEW PROVIDER:
 * 1. Add entry here with id, name, and models
 * 2. Update electron/ipc/ai.ts to handle the provider
 * 3. That's it! Everything else updates automatically.
 */
export const MODEL_PROVIDERS: Record<string, ModelProviderConfig> = {
  "pinac-cloud": {
    id: "pinac-cloud",
    name: "pinac-cloud",
    displayName: "Pinac Cloud",
    models: [
      {
        id: "base-model",
        name: "base-model",
        displayName: "Base Model",
      },
    ],
    defaultSettings: {
      webSearch: false,
    },
  },

  ollama: {
    id: "ollama",
    name: "ollama",
    displayName: "Ollama",
    models: [
      // Ollama models are fetched dynamically from the Ollama server
      // This list serves as fallback/examples
      {
        id: "llama2",
        name: "llama2",
        displayName: "Llama 2",
      },
      {
        id: "mistral",
        name: "mistral",
        displayName: "Mistral",
      },
      {
        id: "codellama",
        name: "codellama",
        displayName: "Code Llama",
      },
    ],
    defaultSettings: {
      temperature: 0.7,
      maxTokens: 4000,
      topK: 40,
      topP: 0.95,
    },
  },
};

//           HELPER FUNCTIONS
// ---------------------------------------

/**
 * Get list of all provider IDs
 */
export const getProviderIds = (): string[] => {
  return Object.keys(MODEL_PROVIDERS);
};

/**
 * Get list of all provider display names
 */
export const getProviderDisplayNames = (): string[] => {
  return Object.values(MODEL_PROVIDERS).map((p) => p.displayName);
};

/**
 * Get provider config by ID
 */
export const getProviderById = (
  id: string,
): ModelProviderConfig | undefined => {
  return MODEL_PROVIDERS[id];
};

/**
 * Get provider config by display name
 */
export const getProviderByDisplayName = (
  displayName: string,
): ModelProviderConfig | undefined => {
  return Object.values(MODEL_PROVIDERS).find(
    (p) => p.displayName === displayName,
  );
};

/**
 * Get models for a specific provider
 */
export const getModelsForProvider = (providerId: string): ModelConfig[] => {
  return MODEL_PROVIDERS[providerId]?.models || [];
};

/**
 * Get model display names for a provider
 */
export const getModelDisplayNames = (providerId: string): string[] => {
  return getModelsForProvider(providerId).map((m) => m.displayName);
};

/**
 * Get default settings for a provider
 */
export const getDefaultSettings = (providerId: string): Record<string, any> => {
  return MODEL_PROVIDERS[providerId]?.defaultSettings || {};
};

/**
 * Get model config by provider and model ID
 */
export const getModelConfig = (
  providerId: string,
  modelId: string,
): ModelConfig | undefined => {
  return getModelsForProvider(providerId).find((m) => m.id === modelId);
};

/**
 * Get model by display name within a provider
 */
export const getModelByDisplayName = (
  providerId: string,
  displayName: string,
): ModelConfig | undefined => {
  return getModelsForProvider(providerId).find(
    (m) => m.displayName === displayName,
  );
};

//          DEFAULT VALUES
// ---------------------------------------

export const DEFAULT_PROVIDER_ID = "pinac-cloud";
export const DEFAULT_MODEL_ID = "base-model";

export const getDefaultProvider = (): ModelProviderConfig => {
  return MODEL_PROVIDERS[DEFAULT_PROVIDER_ID];
};

export const getDefaultModel = (): ModelConfig => {
  const provider = getDefaultProvider();
  return provider.models[0];
};
