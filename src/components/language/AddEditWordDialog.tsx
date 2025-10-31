import { useState, useEffect } from "react";
import type { VocabItem, Translation } from "@/types/vocab";
import { PlusCircleIcon, XIcon, Trash2Icon } from "lucide-react";
import * as service from "@/lib/vocab-service";
import { Button } from '@/components/ui/button';
import { Input } from "../ui/input";

type Props = {
  open: boolean;
  editItem?: VocabItem | null;
  onClose: () => void;
  onSaved?: () => void;
};

export default function AddEditWordDialog({ open, editItem, onClose, onSaved }: Props) {
  const [word, setWord] = useState("");
  const [baseLang, setBaseLang] = useState("en");
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (editItem) {
      setWord(editItem.word);
      setBaseLang(editItem.baseLang);
      setTranslations(editItem.translations || []);
      setNotes(editItem.notes || "");
    } else if (open) {
      setWord("");
      setBaseLang("en");
      setTranslations([]);
      setNotes("");
    }
  }, [open, editItem]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <div className="bg-background/90 border border-foreground/10 rounded-2xl shadow-lg p-6 w-full max-w-lg transition-all">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-foreground montserrat-font">
            {editItem ? 'Edit Word' : 'Add Word'}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-foreground/60 hover:text-destructive"
          >
            <XIcon className="w-5 h-5" />
          </Button>
        </div>

        {/* Word Input */}
        <label className="block mb-4">
          <span className="text-sm text-foreground/70 font-semibold">Word</span>
          <Input
            value={word}
            onChange={(e) => setWord(e.target.value)}
            className="input w-full mt-1 border border-foreground/20 rounded-md focus:ring-2 focus:ring-primary"
            placeholder="Enter the word..."
          />
        </label>

        {/* Base Language */}
        <label className="block mb-4">
          <span className="text-sm text-foreground/70 font-semibold">Base language (code)</span>
          <Input
            value={baseLang}
            onChange={(e) => setBaseLang(e.target.value)}
            className="input w-full mt-1 border border-foreground/20 rounded-md focus:ring-2 focus:ring-primary"
            placeholder="e.g. en, es, fr"
          />
        </label>

        {/* Translations */}
        <div className="mb-4">
          <span className="text-sm text-foreground/70 font-semibold">Translations</span>
          {translations.map((t, idx) => (
            <div key={idx} className="flex gap-2 mt-2">
              <Input
                className="input flex-1 border border-foreground/20 rounded-md focus:ring-2 focus:ring-primary"
                placeholder="Translation text"
                value={t.text}
                onChange={(e) => updateTranslation(idx, { ...t, text: e.target.value })}
              />
              <Input
                className="input w-24 border border-foreground/20 rounded-md focus:ring-2 focus:ring-primary"
                placeholder="Lang"
                value={t.lang}
                onChange={(e) => updateTranslation(idx, { ...t, lang: e.target.value })}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeTranslation(idx)}
                className="text-foreground/40 hover:text-destructive"
              >
                <Trash2Icon className="w-4 h-4" />
              </Button>
            </div>
          ))}

          <Button
            variant="secondary"
            size="sm"
            onClick={addTranslation}
            className="mt-3 flex items-center gap-2"
          >
            <PlusCircleIcon className="w-4 h-4" />
            Add translation
          </Button>
        </div>

        {/* Notes */}
        <label className="block mb-6">
          <span className="text-sm text-foreground/70 font-semibold">Notes</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="textarea w-full mt-1 border border-foreground/20 rounded-md focus:ring-2 focus:ring-primary"
            rows={3}
            placeholder="Optional notes or usage examples..."
          />
        </label>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-foreground/10">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {editItem ? 'Save' : 'Add'}
          </Button>
        </div>
      </div>
    </div>

  );

  // helpers after return
  function addTranslation() {
    setTranslations([...translations, { lang: "en", text: "" }]);
  }
  function removeTranslation(i: number) {
    setTranslations(translations.filter((_, idx) => idx !== i));
  }
  function updateTranslation(i: number, t: Translation) {
    setTranslations(translations.map((old, idx) => (idx === i ? t : old)));
  }

  async function handleSave() {
    const payload: Omit<VocabItem, "id" | "createdAt" | "reviewCount" | "ease" | "intervalDays"> = {
      word,
      baseLang,
      translations,
      notes,
      tags: [],
      source: { area: "manual" },
    };
    if (editItem?.id) {
      await service.updateVocab(editItem.id, payload as any);
    } else {
      await service.addVocab(payload as any);
    }
    onSaved?.();
  }
}
