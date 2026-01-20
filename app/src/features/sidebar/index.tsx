import React, { useContext } from "react";
import { ThemeToggle } from "./components/ThemeToggle";
import { ChatHistory } from "@/features/history";
import { ModalBoxContext } from "@/contexts/ModalBox";
import { Tooltip } from "./components/Tooltip";
import { cn } from "@/lib/utils";

// Icons
import { LuHistory } from "react-icons/lu";
import { IoAddCircleOutline, IoSettingsOutline } from "react-icons/io5";
import { BsChatLeftHeart } from "react-icons/bs";
import appLogo from "@/assets/icon/Round App Logo.svg";

interface SidebarProps {
  isExpanded: boolean;
  setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  clearChat?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isExpanded,
  setIsExpanded,
  clearChat,
}) => {
  const modalBoxContext = useContext(ModalBoxContext);

  const openSettingsModal = () => {
    modalBoxContext?.setModalContent("settings");
    modalBoxContext?.setIsOpen(true);
    setIsExpanded(false);
  };

  const navItemClass =
    "w-full flex justify-center py-2 cursor-pointer transition-colors hover:bg-gray-700/70 dark:hover:bg-zinc-700/60 rounded-md";

  return (
    <div
      className={cn(
        "h-full pt-1 text-gray-200 dark:text-gray-300 flex items-center justify-between overflow-hidden transition-all duration-300 border-r border-transparent z-50 bg-gray-900 dark:bg-zinc-900", // Added bg for better separation
        {
          "w-80 lg:w-96 border-gray-700 dark:border-zinc-700 shadow-xl":
            isExpanded,
          "w-18": !isExpanded,
        },
      )}
    >
      <div
        className={cn(
          "w-18 h-full flex flex-col items-center justify-between shrink-0",
          isExpanded && "border-r border-gray-700 dark:border-zinc-700",
        )}
      >
        {/* upper part */}
        <div className="w-18">
          <nav className="w-full flex flex-col items-center gap-4">
            <div className="w-full flex justify-center py-4">
              <img src={appLogo} className="size-9" alt="App Logo" />
            </div>

            <Tooltip content="New Chat" position="right">
              <div className={navItemClass} onClick={clearChat}>
                <IoAddCircleOutline size={35} />
              </div>
            </Tooltip>
          </nav>
        </div>

        {/* lower part */}
        <div className="w-full pb-4">
          <nav className="w-full flex flex-col items-center gap-2">
            <Tooltip content="Chat History" position="right">
              <div
                className={navItemClass}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <LuHistory size={27} />
              </div>
            </Tooltip>

            <Tooltip content="Prompts" position="right">
              <div className={navItemClass}>
                <BsChatLeftHeart size={25} />
              </div>
            </Tooltip>

            <Tooltip content="Settings" position="right">
              <div className={navItemClass} onClick={openSettingsModal}>
                <IoSettingsOutline size={28} />
              </div>
            </Tooltip>

            <div className="py-2">
              <ThemeToggle />
            </div>
          </nav>
        </div>
      </div>

      {/* Hidden Part of Sidebar */}
      <div
        className={cn(
          "h-full flex-1 overflow-hidden transition-opacity duration-300",
          isExpanded ? "opacity-100" : "opacity-0 w-0 hidden",
        )}
      >
        <ChatHistory />
      </div>
    </div>
  );
};
