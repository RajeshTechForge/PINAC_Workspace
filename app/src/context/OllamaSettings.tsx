import React, { createContext, useState, useEffect } from "react";

export const OllamaSettingsContext = createContext<{
  temperature: number;
  setTemperature: React.Dispatch<React.SetStateAction<number>>;
  maxOutputTokens: number;
  setMaxOutputTokens: React.Dispatch<React.SetStateAction<number>>;
  topK: number;
  setTopK: React.Dispatch<React.SetStateAction<number>>;
  topP: number;
  setTopP: React.Dispatch<React.SetStateAction<number>>;
} | null>(null);

interface OllamaSettingsProviderProps {
  children: React.ReactNode;
}

export const OllamaSettingsProvider: React.FC<OllamaSettingsProviderProps> = ({
  children,
}) => {
  const [temperature, setTemperature] = useState(() => {
    const storedValue = localStorage.getItem("ollama-temperature");
    return storedValue ? parseFloat(storedValue) : 0.7; // Default value
  });

  const [maxOutputTokens, setMaxOutputTokens] = useState(() => {
    const storedValue = localStorage.getItem("ollama-max-output-tokens");
    return storedValue ? parseInt(storedValue, 10) : 4000; // Default value
  });

  const [topK, setTopK] = useState(() => {
    const storedValue = localStorage.getItem("ollama-top-k");
    return storedValue ? parseInt(storedValue, 10) : 40; // Default value
  });

  const [topP, setTopP] = useState(() => {
    const storedValue = localStorage.getItem("ollama-top-p");
    return storedValue ? parseFloat(storedValue) : 0.95; // Default value
  });

  // Update localStorage on change
  useEffect(() => {
    localStorage.setItem("ollama-temperature", temperature.toString());
    localStorage.setItem(
      "ollama-max-output-tokens",
      maxOutputTokens.toString()
    );
    localStorage.setItem("ollama-top-k", topK.toString());
    localStorage.setItem("ollama-top-p", topP.toString());
  }, [temperature, maxOutputTokens, topK, topP]);

  return (
    <OllamaSettingsContext.Provider
      value={{
        temperature,
        setTemperature,
        maxOutputTokens,
        setMaxOutputTokens,
        topK,
        setTopK,
        topP,
        setTopP,
      }}
    >
      {children}
    </OllamaSettingsContext.Provider>
  );
};
