import { create } from "zustand";
import { createChatSession, type AISession } from "@/lib/built-in-ai";
import { getMessagesForChat } from "@/hooks/use-chat";

type SessionState = {
  sessions: Record<number, AISession>;
  getSession: (chatId: number) => Promise<AISession | undefined>;
  ensureSession: (chatId: number) => Promise<AISession>;
  removeSession: (chatId: number) => void;
  clearSessions: () => void;
};

export const useChatSessionStore = create<SessionState>((set, get) => ({
  sessions: {},

  getSession: (chatId: number) => get().ensureSession(chatId),

  ensureSession: async (chatId: number) => {
    const existing = get().sessions[chatId];
    if (existing) return existing;

    const history = await getMessagesForChat(chatId) || [];
    const systemPrompt = "You are Aisylum, a helpful assistant.";
    const newSession = await createChatSession({ systemPrompt, history });

    set((state) => ({
      sessions: { ...state.sessions, [chatId]: newSession },
    }));

    return newSession;
  },

  removeSession: (chatId: number) =>
    set((state) => {
      const { [chatId]: _, ...rest } = state.sessions;
      return { sessions: rest };
    }),

  clearSessions: () => set({ sessions: {} }),
}));
