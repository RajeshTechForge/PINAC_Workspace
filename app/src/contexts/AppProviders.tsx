import React from "react";
import { ChatProvider } from "./ChatContext";
import { ModelSettingsProvider } from "./ModelSettingsContext";
import { AttachmentProvider } from "./AttachmentContext";
import { UIProvider } from "./UIContext";
import { AuthProvider } from "./Authentication";
import { ModalBoxProvider } from "./ModalBox";
import { EmbeddingSettingsProvider } from "./EmbeddingSettings";

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <AuthProvider>
      <EmbeddingSettingsProvider>
        <ModalBoxProvider>
          <ModelSettingsProvider>
            <UIProvider>
              <AttachmentProvider>
                <ChatProvider>{children}</ChatProvider>
              </AttachmentProvider>
            </UIProvider>
          </ModelSettingsProvider>
        </ModalBoxProvider>
      </EmbeddingSettingsProvider>
    </AuthProvider>
  );
};
