import React, { useState, useEffect, useContext, useRef } from "react";
import { WelcomeTextContext } from "../../../context/WelcomeText";
import { ChatMsgContext } from "../../../context/ChatMsg";
import { getSession, deleteSession } from "../../database/db";
import { SetChatBubble } from "../../messageBubble/SetMsgBubble";

// icons
import { IoIosMore } from "react-icons/io";
import { AiOutlineDelete } from "react-icons/ai";
import { LuSquarePen } from "react-icons/lu";
import { GrPin } from "react-icons/gr";

interface SessionCardProps {
  sessionId: string;
  date: string;
  title: string;
}

export const SessionCard: React.FC<SessionCardProps> = ({
  sessionId,
  date,
  title,
}) => {
  const welcomeTextContext = useContext(WelcomeTextContext);
  const chatContext = useContext(ChatMsgContext);
  const [isOptionsOpen, setIsOptionsOpen] = useState<boolean>(false);
  const optionMenuRef = useRef<HTMLDivElement>(null);

  const fetchChat = () => {
    getSession(sessionId).then((session) => {
      welcomeTextContext?.setIsWelcomeTextVisible(false);
      chatContext?.setCurrentSessionId(sessionId);
      chatContext?.setChatMsg(
        session
          ? session.messages.map((msg) => {
              return {
                key: msg.id,
                element: [
                  msg.id,
                  msg.role,
                  msg.text,
                  <SetChatBubble
                    role={msg.role}
                    msg={msg.text}
                    modelName={msg.modelName}
                    attachment={msg.attachment}
                  />,
                ],
              };
            })
          : []
      );
    });
  };

  const handleDelete = () => {
    deleteSession(sessionId).catch((error) => {
      console.error("Error deleting session:", error);
    });
  };

  // Creating an event handler to close the option menu by click elsewhere
  useEffect(() => {
    const handleOutsideClicks = (e: MouseEvent) => {
      if (
        isOptionsOpen &&
        optionMenuRef.current &&
        !optionMenuRef.current.contains(e.target as Node)
      ) {
        setIsOptionsOpen(false);
      }
    };
    window.addEventListener("mousedown", handleOutsideClicks);
    return () => window.removeEventListener("mousedown", handleOutsideClicks);
  }, [isOptionsOpen]);

  return (
    <div
      className="w-full px-3 pt-1 pb-2 flex flex-col rounded-2xl border
      bg-transparent dark:bg-transparent border-gray-700 dark:border-primary-dark hover:bg-gray-700/20 dark:hover:bg-primary-dark/25"
    >
      <div className="relative w-full flex items-center justify-between text-xs text-gray-400 dark:text-zinc-500">
        {date}
        <button
          className="cursor-pointer hover:bg-gray-600 dark:hover:bg-zinc-700 p-1 rounded-full"
          onClick={() => setIsOptionsOpen(!isOptionsOpen)}
        >
          <IoIosMore size={20} />
        </button>
        {isOptionsOpen && (
          <div className="w-full absolute top-7 left-3.5 flex justify-end">
            <div
              className="py-1 px-1 flex flex-col bg-gray-900 dark:bg-zinc-800 text-gray-300 rounded-lg text-sm z-10"
              ref={optionMenuRef}
            >
              <button
                className="py-1.5 px-2 flex items-center rounded-md hover:bg-gray-800"
                onClick={handleDelete}
              >
                <AiOutlineDelete size={23} className="pr-1.5" />
                Delete
              </button>
              <button className="py-1.5 px-2 flex items-center rounded-md hover:bg-gray-800">
                <LuSquarePen size={23} className="pr-1.5" />
                Rename
              </button>
              <button className="py-1.5 px-2 flex items-center rounded-md hover:bg-gray-800">
                <GrPin size={23} className="pr-1.5" />
                Pin
              </button>
            </div>
          </div>
        )}
      </div>
      <div
        className="w-full flex items-center justify-start text-md mt-0.5 cursor-pointer"
        onClick={fetchChat}
      >
        <p
          className="text-foreground max-w-full overflow-hidden whitespace-nowrap text-ellipsis
          dark:text-gray-200"
        >
          {title}
        </p>
      </div>
    </div>
  );
};
