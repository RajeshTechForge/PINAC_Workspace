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

  // Actions
  setSelectedProvider: (providerId: string) => void;
  setSelectedModel: (modelId: string) => void;
  updateProviderSetting: (providerId: string, key: string, value: any) => void;
  getProviderSetting: (providerId: string, key: string) => any;

  // Computed values
  getCurrentProviderName: () => string;
  getCurrentModelName: () => string;
  getCurrentSettings: () => Record<string, any>;
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
  // ACTIONS
  // ========================================

  /**
   * Set the selected provider
   */
  const setSelectedProvider = useCallback((providerId: string) => {
    if (!MODEL_PROVIDERS[providerId]) {
      console.warn(`Provider ${providerId} not found in configuration`);
      return;
    }
    setSelectedProviderIdState(providerId);

    // Reset to first model of the new provider
    const firstModel = MODEL_PROVIDERS[providerId].models[0];
    if (firstModel) {
      setSelectedModelIdState(firstModel.id);
    }
  }, []);

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
    const provider = MODEL_PROVIDERS[selectedProviderId];
    if (!provider) return "Unknown";

    const model = provider.models.find((m) => m.id === selectedModelId);
    return model?.displayName || selectedModelId;
  }, [selectedProviderId, selectedModelId]);

  /**
   * Get current provider settings
   */
  const getCurrentSettings = useCallback((): Record<string, any> => {
    return providerSettings[selectedProviderId] || {};
  }, [selectedProviderId, providerSettings]);

  // ========================================
  // CONTEXT VALUE
  // ========================================

  const value: ModelSettingsContextValue = {
    selectedProviderId,
    selectedModelId,
    providerSettings,
    setSelectedProvider,
    setSelectedModel,
    updateProviderSetting,
    getProviderSetting,
    getCurrentProviderName,
    getCurrentModelName,
    getCurrentSettings,
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
