import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { ProviderSettings } from "@/types";
import {
  MODEL_PROVIDERS,
  DEFAULT_PROVIDER_ID,
  DEFAULT_MODEL_ID,
  getDefaultSettings,
  updateProviderModels,
  ModelConfig,
} from "@/config/models";

// ============================================================================
// CONTEXT DEFINITION
// ============================================================================

interface ModelSettingsContextValue {
  // Current selection
  selectedProviderId: string;
  selectedModelId: string;

  // Provider settings (temperature, topK, etc.)
  providerSettings: ProviderSettings;

  // Dynamic models state
  ollamaModels: ModelConfig[];
  isLoadingOllamaModels: boolean;
  ollamaError: string | null;

  // Actions
  setSelectedProvider: (providerId: string) => void;
  setSelectedModel: (modelId: string) => void;
  updateProviderSetting: (providerId: string, key: string, value: any) => void;
  getProviderSetting: (providerId: string, key: string) => any;
  refreshOllamaModels: () => Promise<void>;

  // Computed values
  getCurrentProviderName: () => string;
  getCurrentModelName: () => string;
  getCurrentSettings: () => Record<string, any>;
  getAvailableModels: (providerId: string) => ModelConfig[];
}

const ModelSettingsContext = createContext<ModelSettingsContextValue | null>(
  null,
);

// ============================================================================
// STORAGE KEYS
// ============================================================================

const STORAGE_KEYS = {
  SELECTED_PROVIDER: "selected-provider-id",
  SELECTED_MODEL: "selected-model-id",
  PROVIDER_SETTINGS_PREFIX: "provider-settings-",
} as const;

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

interface ModelSettingsProviderProps {
  children: React.ReactNode;
}

export const ModelSettingsProvider: React.FC<ModelSettingsProviderProps> = ({
  children,
}) => {
  // ========================================
  // STATE
  // ========================================

  // Selected provider & model
  const [selectedProviderId, setSelectedProviderIdState] = useState<string>(
    () => {
      const stored = localStorage.getItem(STORAGE_KEYS.SELECTED_PROVIDER);
      return stored && MODEL_PROVIDERS[stored] ? stored : DEFAULT_PROVIDER_ID;
    },
  );

  const [selectedModelId, setSelectedModelIdState] = useState<string>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.SELECTED_MODEL);
    // Will be validated after models are loaded
    return stored || DEFAULT_MODEL_ID;
  });

  // Provider-specific settings
  const [providerSettings, setProviderSettings] = useState<ProviderSettings>(
    () => {
      const settings: ProviderSettings = {};

      // Load settings for each provider from localStorage
      Object.keys(MODEL_PROVIDERS).forEach((providerId) => {
        const storageKey = `${STORAGE_KEYS.PROVIDER_SETTINGS_PREFIX}${providerId}`;
        const stored = localStorage.getItem(storageKey);

        if (stored) {
          try {
            settings[providerId] = JSON.parse(stored);
          } catch {
            settings[providerId] = getDefaultSettings(providerId);
          }
        } else {
          settings[providerId] = getDefaultSettings(providerId);
        }
      });

      return settings;
    },
  );

  // Dynamic Ollama models state
  const [ollamaModels, setOllamaModels] = useState<ModelConfig[]>([]);
  const [isLoadingOllamaModels, setIsLoadingOllamaModels] = useState(false);
  const [ollamaError, setOllamaError] = useState<string | null>(null);

  // ========================================
  // PERSISTENCE
  // ========================================

  // Persist selected provider
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SELECTED_PROVIDER, selectedProviderId);
  }, [selectedProviderId]);

  // Persist selected model
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SELECTED_MODEL, selectedModelId);
  }, [selectedModelId]);

  // Persist provider settings
  useEffect(() => {
    Object.entries(providerSettings).forEach(([providerId, settings]) => {
      const storageKey = `${STORAGE_KEYS.PROVIDER_SETTINGS_PREFIX}${providerId}`;
      localStorage.setItem(storageKey, JSON.stringify(settings));
    });
  }, [providerSettings]);

  // ========================================
  // OLLAMA MODELS FETCHING
  // ========================================

  /**
   * Fetch available Ollama models from the backend
   */
  const fetchOllamaModels = useCallback(async (): Promise<void> => {
    setIsLoadingOllamaModels(true);
    setOllamaError(null);

    try {
      const models: OllamaModel[] =
        await window.ipcRenderer.invoke("get-ollama-models");

      if (!models || models.length === 0) {
        setOllamaError(
          "No Ollama models found. Please download models using: ollama pull <model>",
        );
        setOllamaModels([]);
        updateProviderModels("ollama", []);
        setIsLoadingOllamaModels(false);
        return;
      }

      // Convert Ollama models to ModelConfig format
      const modelConfigs: ModelConfig[] = models.map((model) => ({
        id: model.name,
        name: model.name,
        displayName: model.name,
      }));

      setOllamaModels(modelConfigs);

      // Update the global MODEL_PROVIDERS configuration
      updateProviderModels("ollama", modelConfigs);

      // If currently on Ollama provider, validate the selected model
      if (selectedProviderId === "ollama") {
        const modelExists = modelConfigs.find((m) => m.id === selectedModelId);
        if (!modelExists && modelConfigs.length > 0) {
          // Selected model doesn't exist, select the first available model
          setSelectedModelIdState(modelConfigs[0].id);
        }
      }
    } catch (error: any) {
      console.error("Failed to fetch Ollama models:", error);
      setOllamaError("Failed to connect to Ollama. Is Ollama running?");
      setOllamaModels([]);
      updateProviderModels("ollama", []);
    } finally {
      setIsLoadingOllamaModels(false);
    }
  }, [selectedProviderId, selectedModelId]);

  /**
   * Refresh Ollama models (public API)
   */
  const refreshOllamaModels = useCallback(async (): Promise<void> => {
    await fetchOllamaModels();
  }, [fetchOllamaModels]);

  // Fetch Ollama models on mount
  useEffect(() => {
    fetchOllamaModels();
  }, [fetchOllamaModels]);

  // ========================================
  // ACTIONS
  // ========================================

  /**
   * Set the selected provider
   */
  const setSelectedProvider = useCallback(
    (providerId: string) => {
      if (!MODEL_PROVIDERS[providerId]) {
        console.warn(`Provider ${providerId} not found in configuration`);
        return;
      }
      setSelectedProviderIdState(providerId);

      // For dynamic providers like Ollama, use the fetched models
      if (providerId === "ollama") {
        const firstModel = ollamaModels[0];
        if (firstModel) {
          setSelectedModelIdState(firstModel.id);
        } else {
          setSelectedModelIdState("");
        }
      } else {
        // For static providers, use models from config
        const firstModel = MODEL_PROVIDERS[providerId].models[0];
        if (firstModel) {
          setSelectedModelIdState(firstModel.id);
        } else {
          setSelectedModelIdState("");
        }
      }
    },
    [ollamaModels],
  );

  /**
   * Set the selected model (within current provider)
   */
  const setSelectedModel = useCallback((modelId: string) => {
    setSelectedModelIdState(modelId);
  }, []);

  /**
   * Update a specific setting for a provider
   */
  const updateProviderSetting = useCallback(
    (providerId: string, key: string, value: any) => {
      setProviderSettings((prev) => ({
        ...prev,
        [providerId]: {
          ...prev[providerId],
          [key]: value,
        },
      }));
    },
    [],
  );

  /**
   * Get a specific setting for a provider
   */
  const getProviderSetting = useCallback(
    (providerId: string, key: string): any => {
      return providerSettings[providerId]?.[key];
    },
    [providerSettings],
  );

  // ========================================
  // COMPUTED VALUES
  // ========================================

  /**
   * Get current provider display name
   */
  const getCurrentProviderName = useCallback((): string => {
    return MODEL_PROVIDERS[selectedProviderId]?.displayName || "Unknown";
  }, [selectedProviderId]);

  /**
   * Get current model display name
   */
  const getCurrentModelName = useCallback((): string => {
    // For dynamic providers like Ollama, use the dynamic models
    if (selectedProviderId === "ollama") {
      if (isLoadingOllamaModels) return "Loading...";
      if (ollamaError) return "Error loading models";
      if (ollamaModels.length === 0) return "No models found";

      const model = ollamaModels.find((m) => m.id === selectedModelId);
      return model?.displayName || "Select a model";
    }

    // For static providers, use config
    const provider = MODEL_PROVIDERS[selectedProviderId];
    if (!provider) return "Unknown";

    const model = provider.models.find((m) => m.id === selectedModelId);
    return model?.displayName || "Select a model";
  }, [
    selectedProviderId,
    selectedModelId,
    ollamaModels,
    isLoadingOllamaModels,
    ollamaError,
  ]);

  /**
   * Get current provider settings
   */
  const getCurrentSettings = useCallback((): Record<string, any> => {
    return providerSettings[selectedProviderId] || {};
  }, [selectedProviderId, providerSettings]);

  /**
   * Get available models for a provider (handles dynamic providers)
   */
  const getAvailableModels = useCallback(
    (providerId: string): ModelConfig[] => {
      if (providerId === "ollama") {
        return ollamaModels;
      }
      return MODEL_PROVIDERS[providerId]?.models || [];
    },
    [ollamaModels],
  );

  // ========================================
  // CONTEXT VALUE
  // ========================================

  const value: ModelSettingsContextValue = {
    selectedProviderId,
    selectedModelId,
    providerSettings,
    ollamaModels,
    isLoadingOllamaModels,
    ollamaError,
    setSelectedProvider,
    setSelectedModel,
    updateProviderSetting,
    getProviderSetting,
    refreshOllamaModels,
    getCurrentProviderName,
    getCurrentModelName,
    getCurrentSettings,
    getAvailableModels,
  };

  return (
    <ModelSettingsContext.Provider value={value}>
      {children}
    </ModelSettingsContext.Provider>
  );
};

// ============================================================================
// CUSTOM HOOK
// ============================================================================

/**
 * Hook to access model settings context
 * @throws Error if used outside ModelSettingsProvider
 */
export const useModelSettings = (): ModelSettingsContextValue => {
  const context = useContext(ModelSettingsContext);

  if (!context) {
    throw new Error(
      "useModelSettings must be used within ModelSettingsProvider",
    );
  }

  return context;
};
