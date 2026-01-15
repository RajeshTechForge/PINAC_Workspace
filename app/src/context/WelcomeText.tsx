import React, { createContext, useState } from "react";

export const WelcomeTextContext = createContext<{
  isWelcomeTextVisible: boolean;
  setIsWelcomeTextVisible: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

interface WelcomeTextProviderProps {
  children: React.ReactNode;
}

export const WelcomeTextProvider: React.FC<WelcomeTextProviderProps> = ({
  children,
}) => {
  const [isWelcomeTextVisible, setIsWelcomeTextVisible] =
    useState<boolean>(true);
  return (
    <WelcomeTextContext.Provider
      value={{ isWelcomeTextVisible, setIsWelcomeTextVisible }}
    >
      {children}
    </WelcomeTextContext.Provider>
  );
};
