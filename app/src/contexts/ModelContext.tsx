import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ModelType, PinacCloudModel, ModelSettings } from "@/types";

interface ModelContextValue extends ModelSettings {
  // Actions
  setModelType: (type: ModelType) => void;
  setPinacCloudModel: (model: PinacCloudModel) => void;
  setOllamaModel: (model: string | null) => void;
  setWebSearch: (enabled: boolean) => void;
  
  // Helper to get current model name
  getCurrentModelName: () => string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEYS = {
  MODEL_TYPE: "model-type",
  PINAC_CLOUD_MODEL: "pinac-cloud-model",
  OLLAMA_MODEL: "ollama-model",
} as const;

const DEFAULT_SETTINGS: ModelSettings = {
  modelType: "Pinac Cloud Model",
  pinacCloudModel: "Base Model",
  ollamaModel: null,
  webSearch: false,
};

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const ModelContext = createContext<ModelContextValue | null>(null);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

interface ModelProviderProps {
  children: React.ReactNode;
}

export const ModelProvider: React.FC<ModelProviderProps> = ({ children }) => {
  // Initialize from localStorage with fallbacks
  const [modelType, setModelTypeState] = useState<ModelType>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.MODEL_TYPE);
    return (stored as ModelType) || DEFAULT_SETTINGS.modelType;
  });

  const [pinacCloudModel, setPinacCloudModelState] = useState<PinacCloudModel>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.PINAC_CLOUD_MODEL);
    return (stored as PinacCloudModel) || DEFAULT_SETTINGS.pinacCloudModel;
  });

  const [ollamaModel, setOllamaModelState] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.OLLAMA_MODEL) || DEFAULT_SETTINGS.ollamaModel;
  });

  const [webSearch, setWebSearch] = useState<boolean>(DEFAULT_SETTINGS.webSearch);

  // Persist model type to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MODEL_TYPE, modelType);
  }, [modelType]);

  // Persist Pinac Cloud model to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PINAC_CLOUD_MODEL, pinacCloudModel);
  }, [pinacCloudModel]);

  // Persist Ollama model to localStorage
  useEffect(() => {
    if (ollamaModel) {
      localStorage.setItem(STORAGE_KEYS.OLLAMA_MODEL, ollamaModel);
    }
  }, [ollamaModel]);

  /**
   * Set the model type (Pinac Cloud or Ollama)
   */
  const setModelType = useCallback((type: ModelType) => {
    setModelTypeState(type);
  }, []);

  /**
   * Set the Pinac Cloud model variant
   */
  const setPinacCloudModel = useCallback((model: PinacCloudModel) => {
    setPinacCloudModelState(model);
  }, []);

  /**
   * Set the Ollama model name
   */
  const setOllamaModel = useCallback((model: string | null) => {
    setOllamaModelState(model);
  }, []);

  /**
   * Get the currently active model name
   */
  const getCurrentModelName = useCallback((): string => {
    if (modelType === "Pinac Cloud Model") {
      return pinacCloudModel;
    }
    return ollamaModel || "No Model Selected";
  }, [modelType, pinacCloudModel, ollamaModel]);

  const value: ModelContextValue = {
    modelType,
    pinacCloudModel,
    ollamaModel,
    webSearch,
    setModelType,
    setPinacCloudModel,
    setOllamaModel,
    setWebSearch,
    getCurrentModelName,
  };

  return (
    <ModelContext.Provider value={value}>
      {children}
    </ModelContext.Provider>
  );
};

// ============================================================================
// CUSTOM HOOK
// ============================================================================

/**
 * Hook to access model settings context
 * @throws Error if used outside ModelProvider
 */
export const useModelContext = (): ModelContextValue => {
  const context = useContext(ModelContext);
  
  if (!context) {
    throw new Error("useModelContext must be used within ModelProvider");
  }
  
  return context;
};
