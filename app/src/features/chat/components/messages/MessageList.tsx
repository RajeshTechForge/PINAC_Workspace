import React, { memo } from "react";
import { UIMessage } from "@/types";
import { UserMessageBubble } from "./UserMessageBubble";
import { AssistantMessageBubble } from "./AssistantMessageBubble";
import { LoadingIndicator } from "./LoadingIndicator";

interface MessageListProps {
  messages: UIMessage[];
  modelName: string;
}

export const MessageList: React.FC<MessageListProps> = memo(
  ({ messages, modelName }) => {
    return (
      <div className="msgBox scrollbar">
        {messages.map((message) => {
          // Show loading indicator for empty assistant messages that are streaming
          if (
            message.role === "assistant" &&
            !message.content &&
            message.isStreaming
          ) {
            return (
              <LoadingIndicator
                key={message.id}
                modelName={message.modelName || modelName}
              />
            );
          }

          // Render user message
          if (message.role === "user") {
            return (
              <UserMessageBubble
                key={message.id}
                content={message.content}
                attachmentName={message.attachmentName}
              />
            );
          }

          // Render assistant message
          if (message.role === "assistant") {
            return (
              <AssistantMessageBubble
                key={message.id}
                content={message.content}
                modelName={message.modelName || modelName}
                isStreaming={message.isStreaming}
              />
            );
          }

          return null;
        })}
      </div>
    );
  },
);

MessageList.displayName = "MessageList";
