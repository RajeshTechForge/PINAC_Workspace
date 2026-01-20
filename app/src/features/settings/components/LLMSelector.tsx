import React from "react";
import { DropdownMenu } from "./DropdownMenu";
import { useModelSettings } from "@/contexts";
import {
  getProviderDisplayNames,
  getProviderByDisplayName,
  getModelDisplayNames,
} from "@/config/models";

export const LLMSelector: React.FC = () => {
  const modelSettings = useModelSettings();

  // Get all provider display names from config
  const providerOptions = getProviderDisplayNames();

  // Get current provider config
  const currentProvider = getProviderByDisplayName(
    modelSettings.getCurrentProviderName(),
  );

  // Get models for current provider
  const modelOptions = currentProvider
    ? getModelDisplayNames(currentProvider.id)
    : [];

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Dropdown for selecting the provider */}
      <DropdownMenu
        defaultOption={modelSettings.getCurrentProviderName()}
        optionList={providerOptions}
        valueName="provider"
      />

      {/* Dropdown for selecting the model */}
      <DropdownMenu
        defaultOption={modelSettings.getCurrentModelName()}
        optionList={modelOptions}
        valueName="model"
      />
    </div>
  );
};
