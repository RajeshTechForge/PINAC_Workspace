import { useState, useContext } from "react";
import { ModalBoxContext } from "../../context/ModalBox";
import { EmbeddingSettingsContext } from "../../context/EmbeddingSettings";
import { getBackendPort } from "../../utils/backendPort";

// icon
import { IoDocumentAttachOutline } from "react-icons/io5";
import { FiDownloadCloud } from "react-icons/fi";

export const EmbModelDownloader = () => {
  const backendPort = getBackendPort();
  const modalBoxContext = useContext(ModalBoxContext);
  const embeddingContext = useContext(EmbeddingSettingsContext);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsError(false);
    setIsDownloading(true);
    try {
      const response = await fetch(
        `http://localhost:${backendPort}/api/rag/default-embedder/download`
      );
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const res = await response.json();
      if (res.status == "success") {
        embeddingContext?.setIsDefaultModel(true);
        modalBoxContext?.setIsOpen(false);
      } else {
        setIsDownloading(false);
        setIsError(true);
        setErrorMessage(res.message);
      }
    } catch (error) {
      setIsDownloading(false);
      setIsError(true);
      setErrorMessage("Failed to download model." + error);
    }
  };

  return (
    <div
      className="w-[710px] h-[500px] flex flex-col justify-start items-center bg-gray-800 dark:bg-primary-dark text-gray-100 border-[0.1px] border-gray-500 dark:border-zinc-600
                p-6 rounded-2xl"
    >
      <IoDocumentAttachOutline size={120} className="mt-8" />
      <div className="mt-20 flex flex-col  justify-start items-center text-center">
        To enable attachment functionality, you need to download the Base
        Embedding Model (approx. 90MB). This model performs well across most use
        cases.
        {isError && (
          <div className="mt-4 px-3 py-1 bg-red-500/10 text-red-500 border-[0.1px] border-red-500 rounded-lg">
            {errorMessage}
          </div>
        )}
        {isDownloading ? (
          <div className="px-3 py-1.5 mt-8 bg-green-500/10 text-green-500 border-[0.1px] border-green-500 rounded-lg">
            Downloading...
          </div>
        ) : (
          <button
            className="flex px-5 py-3 mt-8 bg-violet-600 hover:bg-violet-700 rounded-lg cursor-pointer"
            onClick={handleDownload}
          >
            <FiDownloadCloud size={20} className="mr-2" />
            Download Now
          </button>
        )}
      </div>
    </div>
  );
};
