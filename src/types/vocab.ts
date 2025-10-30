export type LanguageCode = string; // "en", "es", "fr" etc.

export interface Translation {
  lang: LanguageCode;
  text: string;
}

export interface VocabItem {
  id?: number; // IDB auto-incremented
  createdAt: number; // epoch ms
  updatedAt?: number;
  word: string;
  baseLang: LanguageCode; // language of `word`
  translations: Translation[]; // multiple target languages
  notes?: string;
  tags?: string[]; // e.g., ["immigration", "medical"]
  source?: { // optional backlink
    area: "document" | "manual" | "import";
    refId?: string;
  };

  // Spaced repetition / progress
  reviewCount: number; // how many times seen
  dueAt?: number; // epoch ms for next review
  ease?: number; // e.g., 2.5 initial (lower = harder)
  intervalDays?: number; // current interval in days

  // Pronunciation practice stats
  lastPronunciationScore?: number; // 0..100
  streak?: number;
}
