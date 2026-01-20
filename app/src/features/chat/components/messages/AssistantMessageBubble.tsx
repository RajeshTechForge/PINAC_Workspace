import React, { useState, useCallback, memo } from "react";
import { LiveMarkdownRenderer, MarkdownRenderer } from "@/features/chat/components/markdown/MarkdownRenderer";

// Icons
import pinacLogo from "@/assets/icon/Round App Logo.svg";
import { FiCopy } from "react-icons/fi";
import { FaCheck } from "react-icons/fa6";
import { BiLike, BiSolidLike, BiDislike, BiSolidDislike } from "react-icons/bi";
import { GrPowerCycle } from "react-icons/gr";


interface AssistantMessageBubbleProps {
  content: string;
  modelName: string;
  isStreaming?: boolean;
}


export const AssistantMessageBubble: React.FC<AssistantMessageBubbleProps> = memo(({
  content,
  modelName,
  isStreaming = false,
}) => {
  // Local UI state
  const [isCopied, setIsCopied] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);

  /**
   * Copy message content to clipboard
   */
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  }, [content]);

  /**
   * Toggle like state
   */
  const handleLike = useCallback(() => {
    setIsLiked(prev => !prev);
    setIsDisliked(false);
  }, []);

  /**
   * Toggle dislike state
   */
  const handleDislike = useCallback(() => {
    setIsDisliked(prev => !prev);
    setIsLiked(false);
  }, []);

  /**
   * Regenerate response (TODO: Implement)
   */
  const handleRegenerate = useCallback(() => {
    // TODO: Implement regeneration logic
    console.log("Regenerate clicked");
  }, []);

  return (
    <div className="flex justify-start mt-6">
      {/* Avatar */}
      <div className="size-[35px] mt-1 rounded-full dark:border-[1.5px] dark:border-gray-500 flex justify-center items-center flex-shrink-0">
        <img src={pinacLogo} alt="AI Avatar" />
      </div>

      {/* Message content */}
      <div className="w-full px-4 text-base text-black dark:text-gray-200">
        {/* Model name */}
        <div className="text-sm text-gray-600 dark:text-gray-500 mb-1">
          {modelName}
        </div>

        {/* Rendered markdown */}
        {isStreaming ? (
          <LiveMarkdownRenderer text={content} />
        ) : (
          <MarkdownRenderer text={content} />
        )}

        {/* Action buttons - only show when not streaming */}
        {!isStreaming && (
          <div className="flex gap-1">
            {/* Copy button */}
            <ActionButton
              onClick={handleCopy}
              tooltip={isCopied ? "Copied!" : "Copy"}
              ariaLabel="Copy message"
            >
              {isCopied ? (
                <FaCheck className="size-5" />
              ) : (
                <FiCopy className="size-5" />
              )}
            </ActionButton>

            {/* Like/Dislike buttons */}
            <div className="flex mt-3 rounded-md border border-gray-300 dark:border-zinc-700">
              <ActionButton
                onClick={handleLike}
                tooltip="Like"
                ariaLabel="Like message"
                className="pr-0.5"
              >
                {isLiked ? (
                  <BiSolidLike className="size-5" />
                ) : (
                  <BiLike className="size-5" />
                )}
              </ActionButton>

              <ActionButton
                onClick={handleDislike}
                tooltip="Dislike"
                ariaLabel="Dislike message"
                className="pl-1"
              >
                {isDisliked ? (
                  <BiSolidDislike className="size-5" />
                ) : (
                  <BiDislike className="size-5" />
                )}
              </ActionButton>
            </div>

            {/* Regenerate button */}
            <ActionButton
              onClick={handleRegenerate}
              tooltip="Regenerate"
              ariaLabel="Regenerate response"
            >
              <GrPowerCycle className="size-5" />
            </ActionButton>
          </div>
        )}
      </div>
    </div>
  );
});

AssistantMessageBubble.displayName = "AssistantMessageBubble";

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface ActionButtonProps {
  onClick: () => void;
  tooltip: string;
  ariaLabel: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Reusable action button with tooltip
 */
const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  tooltip,
  ariaLabel,
  children,
  className = "",
}) => {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className={`relative mt-3 p-1.5 flex items-center justify-center group rounded-md border border-gray-300 dark:border-zinc-700 ${className}`}
    >
      {/* Tooltip */}
      <span
        className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs text-gray-900 bg-gray-300 dark:text-gray-200 dark:bg-tertiary-dark rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none"
        aria-hidden="true"
      >
        {tooltip}
      </span>
      
      {/* Icon */}
      <span className="flex items-center justify-center text-gray-600 dark:text-gray-400">
        {children}
      </span>
    </button>
  );
};
