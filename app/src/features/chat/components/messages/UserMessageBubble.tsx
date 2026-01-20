import React, { memo } from "react";
import { MarkdownRenderer } from "@/features/chat/components/markdown/MarkdownRenderer";
import { FaRegFileLines } from "react-icons/fa6";

interface UserMessageBubbleProps {
  content: string;
  attachmentName?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * User message bubble component
 * 
 * Displays user messages with optional file attachment indicator
 */
export const UserMessageBubble: React.FC<UserMessageBubbleProps> = memo(({
  content,
  attachmentName,
}) => {
  return (
    <div className="flex flex-col items-end text-gray-900 dark:text-white mt-10">
      {/* Attachment indicator */}
      {attachmentName && (
        <div className="mb-2">
          <div className="flex items-center gap-2 bg-gray-300 dark:bg-secondary-dark p-2 pr-3 rounded-2xl w-fit">
            <div className="bg-sky-500 p-2 rounded-lg">
              <FaRegFileLines size={20} className="text-white" aria-hidden="true" />
            </div>
            <span className="text-sm font-medium">{attachmentName}</span>
          </div>
        </div>
      )}
      
      {/* Message content */}
      <div className="max-w-[90%] px-4 py-2 rounded-2xl bg-gray-300 dark:bg-tertiary-dark text-base">
        <MarkdownRenderer text={content} />
      </div>
    </div>
  );
});

UserMessageBubble.displayName = "UserMessageBubble";
