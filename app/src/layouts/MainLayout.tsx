import { useState, useCallback } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/features/sidebar";
import { FrameHeader } from "@/components/FrameHeader";
import { useChatContext, useUIContext, useAttachmentContext } from "@/contexts";

export const MainLayout = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  const chat = useChatContext();
  const ui = useUIContext();
  const attachment = useAttachmentContext();

  // Simple startNewChat without stream handling
  const startNewChat = useCallback(() => {
    chat.clearMessages();
    chat.setSessionId(null);
    chat.setIsStreaming(false);
    ui.setWelcomeVisible(true);
    ui.setInputDisabled(false);
    ui.resetInput();
    attachment.clearAttachment();
  }, [chat, ui, attachment]);

  return (
    <FrameHeader>
      <div className="w-full h-full flex overflow-hidden">
        <Sidebar
          isExpanded={isSidebarExpanded}
          setIsExpanded={setIsSidebarExpanded}
          clearChat={startNewChat}
        />
        <div className="flex-1 h-full overflow-hidden relative transition-all duration-300 bg-primary dark:bg-primary-dark">
          <Outlet context={{ isSidebarExpanded }} />
        </div>
      </div>
    </FrameHeader>
  );
};
