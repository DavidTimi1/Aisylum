
import { useState, useEffect } from "react";
import { useVocabulary } from "@/hooks/use-vocabulary";
import type { VocabItem } from "@/types/vocab";
import { PlusCircleIcon, Trash2Icon, SpeakerIcon, Edit3Icon } from "lucide-react";
import { speakText } from "@/lib/speech";
import AddEditWordDialog from "./AddEditWordDialog";
import { Button } from '@/components/ui/button';

export default function VocabularyList() {
  const { items, loading, refresh, add, delete: deleteItem } = useVocabulary();
  const [query, setQuery] = useState("");
  const [openAdd, setOpenAdd] = useState(false);
  const [editItem, setEditItem] = useState<VocabItem | null>(null);
  const [filtered, setFiltered] = useState<VocabItem[]>([]);

  useEffect(() => {
    setFiltered(
      items.filter((i) =>
        i.word.toLowerCase().includes(query.toLowerCase()) ||
        i.translations.some(t => t.text.toLowerCase().includes(query.toLowerCase())) ||
        (i.notes || "").toLowerCase().includes(query.toLowerCase())
      )
    );
  }, [items, query]);

  return (
    <div className="space-y-3">
      {/* Search + Add */}
      <div className="flex items-center gap-3">
        <input
          aria-label="Search vocabulary"
          className="flex-1 input"
          placeholder="Search words, translations, notes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button onClick={() => setOpenAdd(true)} className="flex items-center gap-2">
          <PlusCircleIcon className="w-4 h-4" />
          Add
        </Button>
      </div>
    
      {/* Vocabulary List */}
      {loading ? (
        <p className="text-sm text-foreground/60 py-4 text-center">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-foreground/60 py-4 text-center">
          No words found. Add your first one!
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-background/50 rounded-xl border border-foreground/10 p-4 hover:border-primary/40 transition-colors cursor-pointer"
              onClick={() => setEditItem(item)}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="p-3 bg-primary/10 rounded-lg flex items-center justify-center">
                  <SpeakerIcon className="h-5 w-5 text-primary" />
                </div>
    
                {/* Word Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground mb-1 truncate">
                    {item.word}{' '}
                    <span className="text-xs text-foreground/50 font-normal">
                      ({item.baseLang})
                    </span>
                  </h3>
    
                  <p className="text-sm text-foreground/60 line-clamp-2 mb-2">
                    {item.translations
                      .map((t) => `${t.lang}: ${t.text}`)
                      .join(' • ')}
                  </p>
    
                  {item.notes && (
                    <p className="text-xs text-foreground/50 line-clamp-1">
                      {item.notes}
                    </p>
                  )}
                </div>
    
                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      playPronunciation(item.word, item.baseLang);
                    }}
                    className="text-foreground/40 hover:text-primary"
                  >
                    <SpeakerIcon className="h-4 w-4" />
                  </Button>
    
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditItem(item);
                    }}
                    className="text-foreground/40 hover:text-foreground"
                  >
                    <Edit3Icon className="h-4 w-4" />
                  </Button>
    
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id!);
                    }}
                    className="text-foreground/40 hover:text-destructive"
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    
      {/* Dialog */}
      <AddEditWordDialog
        open={openAdd || !!editItem}
        onClose={() => {
          setOpenAdd(false);
          setEditItem(null);
        }}
        onSaved={() => {
          refresh();
          setOpenAdd(false);
          setEditItem(null);
        }}
        editItem={editItem}
      />
    </div>
  );

  // helpers (declared after return as requested)
  function playPronunciation(text: string, lang = "en-US") {
    // small lang mapping: "en" -> "en-US", "es" -> "es-ES"
    const mapLang = (l: string) => (l.length === 2 ? (l === "en" ? "en-US" : `${l}-${l.toUpperCase()}`) : l);
    speakText(text, mapLang(lang)).catch(() => { /* ignore failure */ });
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this word?")) return;
    await deleteItem(id);
    await refresh();
  }
}
