import React, { useState, useEffect } from "react";
import { useModelSettings } from "@/contexts";
import {
  CUSTOM_PROVIDERS,
  getCustomModelsForProvider,
} from "@/config/customProviders";

export const AdvancedSettings: React.FC = () => {
  const modelSettings = useModelSettings();

  const providerId = modelSettings.selectedProviderId;
  const settings = modelSettings.getCurrentSettings();
  const [customApiKey, setCustomApiKey] = useState("");
  const [saveStatus, setSaveStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Load custom provider settings when "custom" is selected
  useEffect(() => {
    if (providerId === "custom") {
      setIsLoading(true);
      if (window.ipcRenderer) {
        window.ipcRenderer
          .invoke("get-custom-provider-config")
          .then((config: any) => {
            if (config) {
              setCustomApiKey(config.apiKey || "");
              if (config.subProvider) {
                modelSettings.updateProviderSetting(
                  "custom",
                  "subProvider",
                  config.subProvider,
                );
              }
              if (config.modelName) {
                modelSettings.updateProviderSetting(
                  "custom",
                  "modelName",
                  config.modelName,
                );
              }
            }
          })
          .catch((err: any) => console.error(err))
          .finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    }
  }, [providerId]);

  // Handle setting change
  const handleChange = (key: string, value: any) => {
    modelSettings.updateProviderSetting(providerId, key, value);
  };

  const handleCustomSave = async () => {
    setSaveStatus("Saving...");
    try {
      if (window.ipcRenderer) {
        const config = {
          subProvider: settings.subProvider || CUSTOM_PROVIDERS[0].id,
          modelName: settings.modelName || CUSTOM_PROVIDERS[0].models[0],
          apiKey: customApiKey,
        };
        await window.ipcRenderer.invoke("save-custom-provider-config", config);
        setSaveStatus("Saved!");
      }
    } catch (error) {
      setSaveStatus("Error!");
      console.error(error);
    }
    setTimeout(() => setSaveStatus(""), 2000);
  };

  // Render different settings based on provider
  const renderProviderSettings = () => {
    switch (providerId) {
      case "ollama":
        return (
          <>
            {/* Temperature */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-300">
                Temperature: {settings.temperature || 0.7}
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={settings.temperature || 0.7}
                onChange={(e) =>
                  handleChange("temperature", parseFloat(e.target.value))
                }
                className="w-full"
              />
            </div>

            {/* Max Tokens */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-300">
                Max Tokens: {settings.maxTokens || 4000}
              </label>
              <input
                type="number"
                min="100"
                max="32000"
                step="100"
                value={settings.maxTokens || 4000}
                onChange={(e) =>
                  handleChange("maxTokens", parseInt(e.target.value))
                }
                className="w-full px-2 py-1 rounded bg-gray-700 text-gray-200"
              />
            </div>

            {/* Top K */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-300">
                Top K: {settings.topK || 40}
              </label>
              <input
                type="number"
                min="1"
                max="100"
                step="1"
                value={settings.topK || 40}
                onChange={(e) => handleChange("topK", parseInt(e.target.value))}
                className="w-full px-2 py-1 rounded bg-gray-700 text-gray-200"
              />
            </div>

            {/* Top P */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-300">
                Top P: {settings.topP || 0.95}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.topP || 0.95}
                onChange={(e) =>
                  handleChange("topP", parseFloat(e.target.value))
                }
                className="w-full"
              />
            </div>
          </>
        );

      case "custom": {
        const subProvider = settings.subProvider || CUSTOM_PROVIDERS[0].id;
        const models = getCustomModelsForProvider(subProvider);
        const currentModel = settings.modelName || models[0];

        return (
          <div className="flex flex-col gap-4">
            {isLoading && (
              <p className="text-xs text-gray-400">Loading settings...</p>
            )}

            {/* Sub Provider */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-300">Provider</label>
              <select
                className="w-full h-9 px-2 rounded-lg bg-gray-700 dark:bg-tertiary-dark text-gray-200 border-none outline-none cursor-pointer"
                value={subProvider}
                onChange={(e) => {
                  const newProvider = e.target.value;
                  handleChange("subProvider", newProvider);
                  const newModels = getCustomModelsForProvider(newProvider);
                  handleChange("modelName", newModels[0]);
                }}
              >
                {CUSTOM_PROVIDERS.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Model Name */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-300">Model</label>
              <select
                className="w-full h-9 px-2 rounded-lg bg-gray-700 dark:bg-tertiary-dark text-gray-200 border-none outline-none cursor-pointer"
                value={currentModel}
                onChange={(e) => handleChange("modelName", e.target.value)}
              >
                {models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* API Key */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-300">API Key</label>
              <input
                type="password"
                className="w-full h-9 px-2 rounded-lg bg-gray-700 dark:bg-tertiary-dark text-gray-200 outline-none"
                value={customApiKey}
                onChange={(e) => setCustomApiKey(e.target.value)}
                placeholder="Enter API Key"
              />
            </div>

            {/* Save Button */}
            <button
              onClick={handleCustomSave}
              className={`mt-2 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium
                ${saveStatus === "Saved!" ? "bg-green-600 hover:bg-green-700" : ""}
                ${saveStatus === "Error!" ? "bg-red-600 hover:bg-red-700" : ""}
              `}
            >
              {saveStatus || "Save Settings"}
            </button>
          </div>
        );
      }

      default:
        return (
          <p className="text-sm text-gray-400">
            No advanced settings available for this provider.
          </p>
        );
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 p-4 bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-200">Advanced Settings</h3>
      {renderProviderSettings()}
    </div>
  );
};
