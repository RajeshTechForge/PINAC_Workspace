import React, { createContext, useState } from "react";

type File = {
  name: string;
  path: string;
  extension: string;
  nameWithoutExtension: string;
};

const AttachmentContext = createContext<{
  attachment: File | null;
  setAttachment: React.Dispatch<React.SetStateAction<File | null>>;
  setAttachmentFile: (filePath: string) => void;
  usingAttachment?: boolean;
  setUsingAttachment?: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

interface AttachmentProviderProps {
  children: React.ReactNode;
}

const AttachmentProvider: React.FC<AttachmentProviderProps> = ({
  children,
}) => {
  const [attachment, setAttachment] = useState<File | null>(null);
  const [usingAttachment, setUsingAttachment] = useState<boolean>(false);

  function getFileDetails(filePath: string) {
    const parts = filePath.split(/[\/\\]/);
    const fileNameWithExtension = parts.pop() || "";
    const [fileName, extension] = fileNameWithExtension.split(".");
    return [fileName, extension];
  }

  const setAttachmentFile = (filePath: string) => {
    const [nameWithoutExtension, extension] = getFileDetails(filePath);
    const file: File = {
      name: `${nameWithoutExtension}.${extension}`,
      path: filePath,
      extension: extension,
      nameWithoutExtension: nameWithoutExtension,
    };
    setAttachment(file);
    setUsingAttachment(false);
  };

  return (
    <AttachmentContext.Provider
      value={{
        attachment,
        setAttachment,
        setAttachmentFile,
        usingAttachment,
        setUsingAttachment,
      }}
    >
      {children}
    </AttachmentContext.Provider>
  );
};

export { AttachmentContext, AttachmentProvider };
