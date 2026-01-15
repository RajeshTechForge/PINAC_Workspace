import React, { createContext, useState } from "react";

export const EmbeddingSettingsContext = createContext<{
  isDefaultModel: boolean;
  setIsDefaultModel: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

interface EmbeddingSettingsProviderProps {
  children: React.ReactNode;
}

export const EmbeddingSettingsProvider: React.FC<
  EmbeddingSettingsProviderProps
> = ({ children }) => {
  const [isDefaultModel, setIsDefaultModel] = useState(false);

  return (
    <EmbeddingSettingsContext.Provider
      value={{
        isDefaultModel,
        setIsDefaultModel,
      }}
    >
      {children}
    </EmbeddingSettingsContext.Provider>
  );
};
