import React, { createContext, useState, useRef } from "react";
import { generateUUID } from "../features/database/UUID";

export const ChatMsgContext = createContext<{
  chatMsg: ChatMessage[];
  setChatMsg: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  getCurrentSessionId: () => string | null;
  setCurrentSessionId: (sessionId: string | null | "newSession") => void;
} | null>(null);

interface ChatMsgProviderProps {
  children: React.ReactNode;
}

interface ChatMessage {
  key: number;
  element: [number, string, string, React.ReactElement]; // [ id, role, text, jsx ]
}

export const ChatMsgProvider: React.FC<ChatMsgProviderProps> = ({
  children,
}) => {
  const [chatMsg, setChatMsg] = useState<ChatMessage[]>([]);
  const currentSessionIdRef = useRef<string | null>(null);

  const getCurrentSessionId = () => {
    return currentSessionIdRef.current;
  };

  const setCurrentSessionId = (sessionId: string | null | "newSession") => {
    currentSessionIdRef.current =
      sessionId == "newSession" ? generateUUID() : sessionId;
  };

  return (
    <ChatMsgContext.Provider
      value={{ chatMsg, setChatMsg, getCurrentSessionId, setCurrentSessionId }}
    >
      {children}
    </ChatMsgContext.Provider>
  );
};
