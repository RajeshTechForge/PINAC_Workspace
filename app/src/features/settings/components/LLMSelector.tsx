import React from "react";
import { DropdownMenu } from "./DropdownMenu";
import { useModelSettings } from "@/contexts";
import {
  getProviderDisplayNames,
  getProviderByDisplayName,
} from "@/config/models";

export const LLMSelector: React.FC = () => {
  const modelSettings = useModelSettings();
  const providerOptions = getProviderDisplayNames();
  const currentProvider = getProviderByDisplayName(
    modelSettings.getCurrentProviderName(),
  );
  const modelConfigs = currentProvider
    ? modelSettings.getAvailableModels(currentProvider.id)
    : [];

  const modelOptions = modelConfigs.map((m) => m.displayName);

  // Show loading or error state for Ollama
  const showOllamaStatus =
    modelSettings.selectedProviderId === "ollama" &&
    (modelSettings.isLoadingOllamaModels || modelSettings.ollamaError);

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Dropdown for selecting the provider */}
      <DropdownMenu
        defaultOption={modelSettings.getCurrentProviderName()}
        optionList={providerOptions}
        valueName="provider"
      />

      {/* Dropdown for selecting the model */}
      {modelSettings.selectedProviderId !== "custom" && (
        <DropdownMenu
          defaultOption={modelSettings.getCurrentModelName()}
          optionList={modelOptions}
          valueName="model"
          disabled={
            modelSettings.isLoadingOllamaModels || modelOptions.length === 0
          }
        />
      )}

      {/* Show status for Ollama */}
      {showOllamaStatus && (
        <div className="text-sm">
          {modelSettings.isLoadingOllamaModels && (
            <p className="text-gray-400">Loading Ollama models...</p>
          )}
          {modelSettings.ollamaError && (
            <div className="flex flex-col gap-2">
              <p className="text-red-400">{modelSettings.ollamaError}</p>
              <button
                className="px-3 py-1 text-sm rounded bg-gray-700 hover:bg-gray-600 w-fit"
                onClick={() => modelSettings.refreshOllamaModels()}
              >
                Retry
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
