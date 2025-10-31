import { create } from "zustand";
import { AI_APIS, createChatSession, type AISession } from "@/lib/built-in-ai";
import { getMessagesForChat } from "@/hooks/use-chat";
import { callRemotePromptAPI } from "@/services/remoteAI";
import { checkAIAvailability } from '@/lib/built-in-ai';

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
    const newSession = await safeCreateChatSession({ systemPrompt, history });

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



/**
 * Creates a chat session using the local AI API if available,
 * otherwise falls back to a remote API implementation that mimics the same interface.
 */
export async function safeCreateChatSession(options: PromptOptions): Promise<AISession> {
  const availability = await checkAIAvailability(AI_APIS.PROMPT);

  if (availability === 'available') {
    try {
      const localSession = await createChatSession(options);
      return localSession;

    } catch (err) {
      console.warn('Local session creation failed unexpectedly:', err);
      // fall through to fallback
    }
  } else {
    console.warn(`Local AI unavailable (${availability}), using remote fallback.`);
  }

  
  const fakeSession: AISession = {
    isLocal: false,

    async prompt(input: string) {
      const response = await callRemotePromptAPI({
        prompt: input,
        history: options.history,
        systemPrompt: options.systemPrompt,
      });

      return response;
    },

    async destroy() {
      // optional cleanup, maybe call /api/end-session
    },
  };

  return fakeSession;
}


