import { createSummarizer, type AISummarizer } from "@/lib/built-in-ai";
import { checkAIAvailability, AI_APIS } from '@/lib/built-in-ai';
import { callRemoteSummarizeAPI } from "@/services/remoteAI";

type SessionState = {
  sessions: Record<string, AISummarizer>;
  getSession: (setUp: any) => Promise<AISummarizer>;
  ensureSession: (setUp: any) => Promise<AISummarizer>;
  removeSession: (setUp: any) => void;
  clearSessions: () => void;
};

export const SummarizerStore: SessionState = {
  sessions: {},

  getSession: function (setUp: any) {
    return SummarizerStore.ensureSession(setUp)
  },

  ensureSession: async function (setUp: any) {
    const sessionKey = JSON.parse(setUp) as string;

    const existing = SummarizerStore.sessions[sessionKey];
    if (existing) return existing;

    const newSession = await createSummarizer(setUp);

    SummarizerStore.sessions = {
      ...SummarizerStore.sessions,
      [sessionKey]: newSession
    }

    return newSession;
  },

  removeSession: function (setUp: any) {
    const sessionKey = JSON.parse(setUp) as string;
    const updatedSessions = { ...SummarizerStore.sessions }
    delete updatedSessions[sessionKey]

    SummarizerStore.sessions = updatedSessions
  },

  clearSessions: function () { SummarizerStore.sessions = {} }
}


export async function createRegularSummary(text: string | undefined) {
  if (!text) return text;

  const availability = await checkAIAvailability(AI_APIS.SUMMARIZER);

  if (availability === 'available') {
    try {
      const { getSession } = SummarizerStore;

      const regularSummarizer = await getSession({
        type: 'tl;dr',
        length: 'medium',
      });

      return await regularSummarizer.summarize(text, {
        type: 'tl;dr',
        length: 'medium',
      });
    } catch (err) {
      console.warn('Local summarizer failed, falling back to remote:', err);
    }
  } else {
    console.warn(`Local summarizer unavailable (${availability}), using remote fallback.`);
  }

  
  return await callRemoteSummarizeAPI(text, {
    type: 'tl;dr',
    length: 'medium',
  });
}


/**
 * Generate a title from a conversation — uses local AI if available
 */
export async function generateConversationTitle(
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  const conversationText = messages
    .map((m) => `${m.role}: ${m.content}`)
    .join('\n');

  const availability = await checkAIAvailability(AI_APIS.SUMMARIZER);

  if (availability === 'available') {
    try {
      const { getSession } = SummarizerStore;

      const titleSummarizer = await getSession({
        type: 'headline',
        length: 'short',
      });

      return await titleSummarizer.summarize(conversationText, {
        type: 'headline',
        length: 'short',
      });
    } catch (err) {
      console.warn('Local summarizer failed, falling back to remote:', err);
    }
  } else {
    console.warn(`Local summarizer unavailable (${availability}), using remote fallback.`);
  }

  return await callRemoteSummarizeAPI(conversationText, {
    type: 'headline',
    length: 'short',
  });
}
