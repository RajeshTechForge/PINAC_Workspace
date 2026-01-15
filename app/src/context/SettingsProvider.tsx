import React from "react";
import { ModelSettingsProvider } from "./ModelSettings";
import { EmbeddingSettingsProvider } from "./EmbeddingSettings";

const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <ModelSettingsProvider>
      <EmbeddingSettingsProvider>
        {children}
      </EmbeddingSettingsProvider>
    </ModelSettingsProvider>
  );
};

export default SettingsProvider;
