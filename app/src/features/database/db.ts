import Dexie from "dexie";

interface ChatMessage {
  id: number;
  role: string;
  text: string;
  modelName: string;
  attachment?: string;
}

interface ChatSession {
  id: string;
  timestamp: Date;
  title: string;
  messages: ChatMessage[];
}

// Define database
class ChatDatabase extends Dexie {
  chatSessions: Dexie.Table<ChatSession, string>;

  constructor() {
    super("ChatDatabase");
    this.version(1).stores({
      chatSessions: "id, timestamp, title",
    });
    this.chatSessions = this.table("chatSessions");
  }
}

export const db = new ChatDatabase();

// Database operations
export const startNewSession = async (id: string, title: string) => {
  await db.chatSessions.add({
    id: id,
    timestamp: new Date(),
    title,
    messages: [],
  });
};

export const addMsgToSession = async (
  sessionId: string,
  msgId: number,
  role: string,
  text: string,
  modelName: string,
  attachment?: string
): Promise<void> => {
  const session = await db.chatSessions.get(sessionId);
  if (session) {
    const newMessage: ChatMessage = {
      id: msgId,
      role,
      text,
      modelName,
    };
    if (attachment) {
      newMessage.attachment = attachment; // Assign attachment if provided
    }
    session.messages.push(newMessage);
    await db.chatSessions.put(session);
  }
};

export const getSession = async (
  sessionId: string
): Promise<ChatSession | undefined> => {
  return await db.chatSessions.get(sessionId);
};

export const getAllSessions = async (): Promise<ChatSession[]> => {
  return await db.chatSessions.toArray();
};

export const updateSessionTitle = async (
  sessionId: string,
  newTitle: string
): Promise<void> => {
  await db.chatSessions.update(sessionId, { title: newTitle });
};

export const deleteSession = async (sessionId: string): Promise<void> => {
  try {
    await db.chatSessions.delete(sessionId);
  } catch (error) {
    console.error("Error deleting session:", error);
    throw error;
  }
};

// to delete all sessions
export const deleteAllSessions = async (): Promise<void> => {
  try {
    await db.chatSessions.clear();
  } catch (error) {
    console.error("Error deleting all sessions:", error);
    throw error;
  }
};
