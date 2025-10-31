
import { checkAIAvailability } from '@/lib/built-in-ai';import { getPrimaryLanguage, rewriteText } from "@/lib/built-in-ai";
import { rewriteClearlyRemote } from '@/services/remoteAI';

type SessionState = {
  sessions: Record<string, any>;
  getSession: (setUp: any) => Promise<any>;
  ensureSession: (setUp: any) => Promise<any>;
  removeSession: (setUp: any) => void;
  clearSessions: () => void;
};

// export const RewriterStore: SessionState = {
//   sessions: {},

//   getSession: function (setUp: any) {
//     return RewriterStore.ensureSession(setUp)
//   },

//   ensureSession: async function (setUp: any) {
//     const sessionKey = JSON.parse(setUp) as string;

//     const existing = RewriterStore.sessions[sessionKey];
//     if (existing) return existing;

//     const newSession = await createRewriter(setUp);

//     RewriterStore.sessions = {
//       ...RewriterStore.sessions,
//       [sessionKey]: newSession
//     }

//     return newSession;
//   },

//   removeSession: function (setUp: any) {
//     const sessionKey = JSON.parse(setUp) as string;
//     const updatedSessions = { ...RewriterStore.sessions }
//     delete updatedSessions[sessionKey]

//     RewriterStore.sessions = updatedSessions
//   },

//   clearSessions: function () { RewriterStore.sessions = {} }
// }


/**
 * Rewrites text more clearly using the local Prompt API if available,
 * otherwise falls back to a remote API endpoint.
 */
export async function rewriteClearly(text: string): Promise<string> {
  const language = await getPrimaryLanguage(text);

  // 🔹 Check if the AI API is available in the browser
  const availability = await checkAIAvailability('AI_APIS'); // or whatever key your local model uses

  if (availability === 'available') {
    try {
      // Try local model first
      const rewrittenText = await rewriteText(text, { language }, console.log);
      return rewrittenText;

    } catch (err) {
      console.warn('Local rewrite failed unexpectedly:', err);
      return await rewriteClearlyRemote(text, language);
    }

  } else {
    console.warn(`Local AI unavailable (${availability}), using remote fallback.`);
    // Fallback path
    return await rewriteClearlyRemote(text, language);
  }
}
