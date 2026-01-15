import React, { createContext, useState, useEffect } from "react";

export const ModelSettingsContext = createContext<{
  modelType: "Pinac Cloud Model" | "Ollama Model";
  setModelType: React.Dispatch<
    React.SetStateAction<"Pinac Cloud Model" | "Ollama Model">
  >;
  pinacCloudModel: "Base Model";
  setPinacCloudModel: React.Dispatch<React.SetStateAction<"Base Model">>;
  ollamaModel: string | null;
  setOllamaModel: React.Dispatch<React.SetStateAction<string | null>>;
  webSearch: boolean;
  setIsWebSearch: React.Dispatch<React.SetStateAction<boolean>>;
  setValue: (valueName: string, value: string) => void;
  getValue: (valueName: string) => string | null;
} | null>(null);

interface ModelSettingsProviderProps {
  children: React.ReactNode;
}

export const ModelSettingsProvider: React.FC<ModelSettingsProviderProps> = ({
  children,
}) => {
  const [modelType, setModelType] = useState(() => {
    const choice = localStorage.getItem("model-type") as
      | "Pinac Cloud Model"
      | "Ollama Model";
    return choice ? choice : "Pinac Cloud Model";
  });

  const [pinacCloudModel, setPinacCloudModel] = useState(() => {
    const choice = localStorage.getItem("pinac-cloud-model") as "Base Model";
    return choice ? choice : "Base Model";
  });

  const [ollamaModel, setOllamaModel] = useState(() => {
    const choice = localStorage.getItem("ollama-model");
    return choice ? choice : null;
  });

  const [webSearch, setIsWebSearch] = useState<boolean>(false);

  const setValue = (valueName: string, value: string) => {
    if (valueName === "model-type") {
      const typedValue = value as "Pinac Cloud Model" | "Ollama Model";
      setModelType(typedValue);
    } else if (valueName === "pinac-cloud-model") {
      const typedValue = value as "Base Model";
      setPinacCloudModel(typedValue);
    } else if (valueName === "ollama-model") {
      setOllamaModel(value);
    }
  };

  const getValue = (valueName: string) => {
    if (valueName === "model-type") {
      return modelType;
    } else if (valueName === "pinac-cloud-model") {
      return pinacCloudModel;
    } else if (valueName === "ollama-model") {
      return ollamaModel;
    } else return null;
  };

  // Update localStorage on change
  useEffect(() => {
    localStorage.setItem("model-type", modelType);
    localStorage.setItem("pinac-cloud-model", pinacCloudModel);
    ollamaModel && localStorage.setItem("ollama-model", ollamaModel);
  }, [modelType, pinacCloudModel, ollamaModel]);

  return (
    <ModelSettingsContext.Provider
      value={{
        modelType,
        setModelType,
        pinacCloudModel,
        setPinacCloudModel,
        ollamaModel,
        setOllamaModel,
        webSearch,
        setIsWebSearch,
        setValue,
        getValue,
      }}
    >
      {children}
    </ModelSettingsContext.Provider>
  );
};
