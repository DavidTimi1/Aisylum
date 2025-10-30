import { supportedLanguages } from "@/lib/languageModules";
import {create} from "zustand";
import { persist } from "zustand/middleware";

type LanguageProgress = {
  language: string;
  languageCode: string;
  currentModule: number;
};

type LanguageStore = {
  languages: LanguageProgress[];
  selectedLanguage: string | null;
  setSelectedLanguage: (language: string) => void;
  updateProgress: (languageCode: string, module: number) => void;
  addLanguage: (language: string) => void;
};

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set, get) => ({
      languages: [],
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
    }),
    {
      name: "language-store", // Key for IndexedDB storage
    }
  )
);
