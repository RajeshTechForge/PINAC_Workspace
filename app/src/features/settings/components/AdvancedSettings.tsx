import React from "react";
import { useModelSettings } from "@/contexts";

export const AdvancedSettings: React.FC = () => {
  const modelSettings = useModelSettings();

  const providerId = modelSettings.selectedProviderId;
  const settings = modelSettings.getCurrentSettings();

  // Handle setting change
  const handleChange = (key: string, value: any) => {
    modelSettings.updateProviderSetting(providerId, key, value);
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

      case "pinac-cloud":
        return (
          <>
            {/* Web Search Toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.webSearch || false}
                onChange={(e) => handleChange("webSearch", e.target.checked)}
                className="w-4 h-4"
              />
              <label className="text-sm text-gray-300">Enable Web Search</label>
            </div>
          </>
        );

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
