import React, { useContext } from "react";
import { ThemeToggle } from "./components/ThemeToggle";
import { ChatHistory } from "../chatHistory";
import { ModalBoxContext } from "../../context/ModalBox";
import { Tooltip } from "./components/Tooltip";

// Icons
import { LuHistory } from "react-icons/lu";
import { IoAddCircleOutline, IoSettingsOutline } from "react-icons/io5";
import { BsChatLeftHeart } from "react-icons/bs";
import appLogo from "/icon/Round App Logo.svg";

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

  // --------------------------------------------------- //
  return (
    <div
      className={`h-full pt-1
      ${isExpanded ? "w-80 lg:w-96" : "w-18"}
      text-gray-200 dark:text-gray-300
      flex items-center justify-between overflow-hidden
      transition-all duration-300
      `}
    >
      <div
        className={`w-18 h-full flex flex-col items-center justify-between
        ${isExpanded && "border-r border-gray-700 dark:border-zinc-700"}`}
      >
        {/* upper part */}
        <div className="w-18">
          <nav className="style-none w-full">
            <ul>
              <li className="w-full sidebar-li ">
                <img src={appLogo} className="size-9" />
              </li>
              <Tooltip content="New Chat">
                <li className="sidebar-li hover:bg-gray-700/70 dark:hover:bg-zinc-700/60" onClick={clearChat}>
                  <IoAddCircleOutline size={35} />
                </li>
              </Tooltip>
            </ul>
          </nav>
        </div>
        {/* lower part */}
        <div className="w-full">
          <nav className="style-none mb-2">
            <ul>
              <Tooltip content="Chat History">
                <li
                  className="sidebar-li hover:bg-gray-700/70 dark:hover:bg-zinc-700/60"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  <LuHistory size={27} />
                </li>
              </Tooltip>
              <Tooltip content="Prompts">
                <li className="sidebar-li hover:bg-gray-700/70 dark:hover:bg-zinc-700/60">
                  <BsChatLeftHeart size={25} />
                </li>
              </Tooltip>
              <Tooltip content="Settings">
                <li
                  className="sidebar-li hover:bg-gray-700/70 dark:hover:bg-zinc-700/60"
                  onClick={openSettingsModal}
                >
                  <IoSettingsOutline size={28} />
                </li>
              </Tooltip>
              <li className="sidebar-li">
                <ThemeToggle />
              </li>
            </ul>
          </nav>
        </div>
      </div>
      {/* Hidden Part of Sidebar */}
      <div
        className={`w-[248px] lg:w-[312px] h-full
        ${isExpanded ? "flex" : "hidden"}`}
      >
        <ChatHistory />
      </div>
    </div>
  );
};
