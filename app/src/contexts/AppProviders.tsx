import React from "react";
import { ChatProvider } from "./ChatContext";
import { ModelProvider } from "./ModelContext";
import { AttachmentProvider } from "./AttachmentContext";
import { UIProvider } from "./UIContext";
import { AuthProvider } from "./Authentication";
import { ModalBoxProvider } from "./ModalBox";
import { EmbeddingSettingsProvider } from "./EmbeddingSettings";
import { OllamaSettingsProvider } from "./OllamaSettings";

interface AppProvidersProps {
  children: React.ReactNode;
}

// Unified provider component that wraps with all necessary contexts
export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <AuthProvider>
      <OllamaSettingsProvider>
        <EmbeddingSettingsProvider>
          <ModalBoxProvider>
            <ModelProvider>
              <UIProvider>
                <AttachmentProvider>
                  <ChatProvider>{children}</ChatProvider>
                </AttachmentProvider>
              </UIProvider>
            </ModelProvider>
          </ModalBoxProvider>
        </EmbeddingSettingsProvider>
      </OllamaSettingsProvider>
    </AuthProvider>
  );
};
