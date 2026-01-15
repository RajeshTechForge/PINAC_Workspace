import React from "react";
import { MarkdownRenderer } from "../../components/MarkdownRenderer";
import { FaRegFileLines } from "react-icons/fa6";

interface UserMsgBubbleProps {
  response: string;
  attachment?: string;
}

export const UserMsgBubble: React.FC<UserMsgBubbleProps> = ({
  response,
  attachment,
}) => {
  return (
    <div className="flex flex-col items-end text-gray-900 dark:text-white mt-10">
      {attachment && (
        <div className="mb-2 relative">
          <div className="flex items-center gap-2 bg-gray-300 dark:bg-secondary-dark p-2 pr-3 rounded-2xl w-fit">
            <div className="bg-sky-500 p-2 rounded-lg">
              <FaRegFileLines size={20} className="text-white" />
            </div>
            <div>{attachment}</div>
          </div>
        </div>
      )}
      <div className="max-w-[90%] px-4 py-2 rounded-2xl bg-gray-300 dark:bg-tertiary-dark text-base">
        <MarkdownRenderer text={response} />
      </div>
    </div>
  );
};
