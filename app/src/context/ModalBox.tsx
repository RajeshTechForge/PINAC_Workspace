import React, { createContext, useState, ReactNode } from "react";

// types of content the modal can display
export type ModalContentType = "settings" | "embedding-model-downloader" | null;

export const ModalBoxContext = createContext<{
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  modalContent: ModalContentType;
  setModalContent: React.Dispatch<React.SetStateAction<ModalContentType>>;
} | null>(null);

interface ModalBoxProviderProps {
  children: ReactNode;
}

export const ModalBoxProvider: React.FC<ModalBoxProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<ModalContentType>(null);

  return (
    <ModalBoxContext.Provider
      value={{ isOpen, setIsOpen, modalContent, setModalContent }}
    >
      {children}
    </ModalBoxContext.Provider>
  );
};
