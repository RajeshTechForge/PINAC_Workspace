import React, { useRef, useEffect, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { GreetingText, MessageList, InputArea } from "@/features/chat";
import { useChatContext, useModelContext, useUIContext } from "@/contexts";
import { useChatActions } from "@/hooks";

interface MainLayoutContext {
  isSidebarExpanded: boolean;
}

const HomePage: React.FC = () => {
  const { isSidebarExpanded } = useOutletContext<MainLayoutContext>();
  const chat = useChatContext();
  const model = useModelContext();
  const ui = useUIContext();
  const { sendMessage, stopGeneration } = useChatActions();
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (!scrollRef.current) return;

    requestAnimationFrame(() => {
      scrollRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    });
  }, [chat.messages]);

  // Computed Values

  const modelName = model.getCurrentModelName();

  const containerClasses = useMemo(() => {
    return ui.isWelcomeVisible
      ? "@container w-full"
      : "@container w-full h-full flex flex-col justify-start items-center";
  }, [ui.isWelcomeVisible]);

  const mainContainerClasses = useMemo(() => {
    return ui.isWelcomeVisible ? "h-full" : "h-body-with-margin-b";
  }, [ui.isWelcomeVisible]);

  const sidebarWidthClasses = useMemo(() => {
    return isSidebarExpanded
      ? "w-min-main-body lg:w-max-main-body"
      : "w-main-body";
  }, [isSidebarExpanded]);

  // Event Handlers

  const handleSubmit = () => {
    sendMessage(ui.inputText);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "50px";
    }
  };

  const handleStop = (value: boolean) => {
    if (value) {
      stopGeneration();
    }
  };

  // -----------------------------------------------------
  return (
    <div className="w-full h-full flex">
      <div
        className={`${sidebarWidthClasses}
          w-full h-full flex justify-start items-center
          bg-primary dark:bg-primary-dark rounded-xl transition-all duration-300`}
      >
        <div
          className={`${mainContainerClasses}
            w-full flex flex-col justify-center items-center`}
        >
          <div className={containerClasses}>
            {ui.isWelcomeVisible ? (
              <GreetingText />
            ) : (
              <MessageList messages={chat.messages} modelName={modelName} />
            )}

            <div ref={scrollRef} />

            <InputArea
              userInput={ui.inputText}
              setUserInput={ui.setInputText}
              buttonsDisabled={ui.isInputDisabled}
              setButtonsDisabled={ui.setInputDisabled}
              textareaRef={textareaRef}
              submit={handleSubmit}
              setStop={handleStop}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
