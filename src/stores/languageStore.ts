import { languageModules, supportedLanguages } from "@/lib/languageModules";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { extractJsonString } from "@/lib/cleanJSON.js";

type LanguageProgress = {
  language: string;
  languageCode: string;
  currentModule: number;
};

type dictionaryEntry = {
  original: string;
  translation: string;
  languageCode: string;
}

type LanguageStore = {
  languages: LanguageProgress[];
  selectedLanguage: string | null;
  setSelectedLanguage: (language: string) => void;
  updateProgress: (languageCode: string, module: number) => void;
  addLanguage: (language: string) => void;

  dictionary: dictionaryEntry[];
  storeInDictionary: (entry: dictionaryEntry) => void;
};

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set, get) => ({
      languages: [],
      dictionary: [],
      selectedLanguage: null,

      setSelectedLanguage: (language) => {
        set({ selectedLanguage: language });
      },

      updateProgress: (languageCode, module) => {
        set((state) => ({
          languages: state.languages.map((l) =>
            l.languageCode === languageCode ? { ...l, currentModule: module } : l
          ),
        }))
      },

      addLanguage: (languageCode) => {
        const exists = get().languages.some((l) => l.languageCode === languageCode);
        if (!exists) {
          set((state) => ({
            languages: [...state.languages, { languageCode, language: supportedLanguages[languageCode], currentModule: 0 }],
          }));
        }
      },

      storeInDictionary: (entry) => {
        set((state) => ({
          dictionary: [...state.dictionary, entry],
        }));
      }
    }),
    {
      name: "language-store", // Key for IndexedDB storage
    }
  )
);


import { type AISession } from "@/lib/built-in-ai";

type SessionState = {
  sessions: Record<number, AISession>;
  getSession: (lang: string) => Promise<AISession | undefined>;
  ensureSession: (lang: string) => Promise<AISession>;
  removeSession: (lang: string) => void;
  clearSessions: () => void;
};


export const LessonGenerator: SessionState = {
  sessions: {},

  getSession: async function (languageCode: any) {
    return await LessonGenerator.ensureSession(languageCode)
  },

  ensureSession: async function (languageCode: any) {
    const existing = LessonGenerator.sessions[languageCode];
    if (existing) return existing;

    const language = supportedLanguages[languageCode];

    const modulesString = languageModules.map(mod => `Lesson ${mod.id} is about ${mod.title}`)
      .join(', ');

    const systemPrompt = `
      You are an expert ${language} instructor, 
      generate 20 questions for each module the user request for, the topics for each module are 
      ${modulesString}
      `
    const newSession = await safeCreateChatSession({ systemPrompt, history: [] });

    LessonGenerator.sessions = {
      ...LessonGenerator.sessions,
      [languageCode]: newSession
    }

    return newSession;
  },

  removeSession: function (languageCode: any) {
    const updatedSessions = { ...LessonGenerator.sessions }
    delete updatedSessions[languageCode]

    LessonGenerator.sessions = updatedSessions
  },

  clearSessions: function () { LessonGenerator.sessions = {} }
}



import { checkAIAvailability, AI_APIS, getPrimaryLanguage, translateText } from '@/lib/built-in-ai';
import { callRemotePromptAPI, callRemoteTranslateAPI } from "@/services/remoteAI";
import { safeCreateChatSession } from "./useChatSessionStore";

export async function generateModuleLessons(language?: string, module?: number) {
  if (!language) return;

  // Define schema for structured responses
  const schema = {
    type: "array",
    items: {
      type: "object",
      properties: {
        question: { type: "string" },
        type: { type: "string", enum: ["speech", "written"] },
        answer: { type: "string" }
      },
      required: ["question", "type", "answer"],
      additionalProperties: false
    }
  };

  // Check if local AI is available
  const availability = await checkAIAvailability(AI_APIS.PROMPT);

  // Try local LLM first (structured response)
  if (availability === 'available') {
    try {
      const { getSession } = LessonGenerator;
      const tutor = await getSession(language);

      const result = await tutor?.prompt(
        `Create lessons for module ${module}`,
        {
          responseConstraint: schema
        }
      );
      const jsonResponse = extractJsonString(result);
      return JSON.parse(jsonResponse);

    } catch (err) {
      console.warn('Local LLM failed, switching to remote fallback:', err);
    }

  } else {
    console.warn(`Local AI unavailable (${availability}), using remote fallback.`);
  }

  // Remote fallback — no schema support, so we describe it textually
  const systemPrompt = `
You are an AI lesson creator. 
Generate a JSON array of lessons for module ${module} in ${language}. 
Each item should follow this structure:
[
  {
    "question": "string",
    "type": "speech" | "written",
    "answer": "string"
  }
]
Return *only* valid JSON — no explanations, markdown, or text outside the array.
  `.trim();

  const response = await callRemotePromptAPI({
    prompt: `Generate lessons for module ${module}`,
    systemPrompt,
  });

  const jsonResponse = extractJsonString(response);
  return JSON.parse(jsonResponse);

}



export async function autoTranslate(
  text: string,
  targetLanguage: string
) {
  let result;
  let sourceLanguage;
  try {
    sourceLanguage = await getPrimaryLanguage(text);

    result = await translateText(text, { sourceLanguage, targetLanguage });

  } catch (err: any) {
    throw err.message
  }
  // Remote fallback

  if (!result) {
    result = await callRemoteTranslateAPI(text, targetLanguage);
  }

  return {
    translation: result,
    languageCode: sourceLanguage ? ` from ${supportedLanguages[sourceLanguage]}` : ''
  }
}

