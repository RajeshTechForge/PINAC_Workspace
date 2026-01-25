/*

All model providers, their models, and settings are defined here.
To add a new provider: Just add it to MODEL_PROVIDERS object below.

*/

import { CUSTOM_PROVIDERS } from "./customProviders";

export interface ModelProviderConfig {
  id: string;
  name: string;
  displayName: string;
  models: ModelConfig[];
  defaultSettings?: Record<string, any>;
  isDynamic?: boolean;
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

export const MODEL_PROVIDERS: Record<string, ModelProviderConfig> = {
  ollama: {
    id: "ollama",
    name: "ollama",
    displayName: "Ollama",
    isDynamic: true,
    models: [],
    defaultSettings: {
      temperature: 0.7,
      maxTokens: 4000,
      topK: 40,
      topP: 0.95,
    },
  },

  custom: {
    id: "custom",
    name: "custom",
    displayName: "Custom",
    models: [
      {
        id: "custom-model",
        name: "custom-model",
        displayName: "Default Model",
      },
    ],
    defaultSettings: {
      subProvider: CUSTOM_PROVIDERS[0].id,
      modelName: CUSTOM_PROVIDERS[0].models[0],
    },
  },
};

//           HELPER FUNCTIONS
// ---------------------------------------

export const getProviderIds = (): string[] => {
  return Object.keys(MODEL_PROVIDERS);
};

export const getProviderDisplayNames = (): string[] => {
  return Object.values(MODEL_PROVIDERS).map((p) => p.displayName);
};

export const getProviderById = (
  id: string,
): ModelProviderConfig | undefined => {
  return MODEL_PROVIDERS[id];
};

export const getProviderByDisplayName = (
  displayName: string,
): ModelProviderConfig | undefined => {
  return Object.values(MODEL_PROVIDERS).find(
    (p) => p.displayName === displayName,
  );
};

export const getModelsForProvider = (providerId: string): ModelConfig[] => {
  return MODEL_PROVIDERS[providerId]?.models || [];
};

export const updateProviderModels = (
  providerId: string,
  models: ModelConfig[],
): void => {
  if (MODEL_PROVIDERS[providerId]) {
    MODEL_PROVIDERS[providerId].models = models;
  }
};

export const getModelDisplayNames = (providerId: string): string[] => {
  return getModelsForProvider(providerId).map((m) => m.displayName);
};

export const getDefaultSettings = (providerId: string): Record<string, any> => {
  return MODEL_PROVIDERS[providerId]?.defaultSettings || {};
};

export const getModelConfig = (
  providerId: string,
  modelId: string,
): ModelConfig | undefined => {
  return getModelsForProvider(providerId).find((m) => m.id === modelId);
};

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

export const DEFAULT_PROVIDER_ID = "custom";
export const DEFAULT_MODEL_ID = "customom-model";

export const getDefaultProvider = (): ModelProviderConfig => {
  return MODEL_PROVIDERS[DEFAULT_PROVIDER_ID];
};

export const getDefaultModel = (): ModelConfig => {
  const provider = getDefaultProvider();
  return provider.models[0];
};
