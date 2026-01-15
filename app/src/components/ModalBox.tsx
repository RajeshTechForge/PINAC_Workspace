import React, { useContext } from "react";
import { ModalBoxContext } from "../context/ModalBox";
import { Settings } from "../features/appSettings";
import { EmbModelDownloader } from "../features/chatInput/embModelDownloader";

const Modal: React.FC = () => {
  const modalBoxContext = useContext(ModalBoxContext);

  if (!modalBoxContext?.isOpen) return null;

  const handleModalClose = () => {
    if (modalBoxContext) {
      modalBoxContext.setIsOpen(false);
      modalBoxContext.setModalContent(null);
    }
  };

  const renderModalContent = () => {
    switch (modalBoxContext?.modalContent) {
      case "settings":
        return <Settings />;
      case "embedding-model-downloader":
        return <EmbModelDownloader />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/70 dark:bg-zinc-900/5 backdrop-blur-sm"
        onClick={handleModalClose}
      />
      <div className=" rounded-lg shadow-lg z-50">{renderModalContent()}</div>
    </div>
  );
};

export default Modal;
