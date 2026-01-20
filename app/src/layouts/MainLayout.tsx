import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/features/sidebar";
import { FrameHeader } from "../components/FrameHeader";
import { useChatActions } from "../hooks";

export const MainLayout = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const { startNewChat } = useChatActions();

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
