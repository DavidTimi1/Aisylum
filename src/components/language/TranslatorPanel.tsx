import { useState } from "react";
import { Button } from "@/components/ui/button";
import { errorToast } from "@/hooks/use-toast";
import { autoTranslate, useLanguageStore } from "@/stores/languageStore";
import { ChevronDownIcon, ChevronUpIcon, Loader2Icon } from "lucide-react";

export default function TranslatorPanel() {
  const [input, setInput] = useState("");
  const [translation, setTranslation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { dictionary, storeInDictionary } = useLanguageStore();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleOpen = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-foreground mb-4">Translator</h2>
      <div className="mb-4">
        <textarea
          className="textarea w-full mb-2 border rounded-lg p-4"
          placeholder="Enter text to translate..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button onClick={handleTranslate} disabled={isLoading}>
          {
            isLoading ? (
              <Loader2Icon className="w-5 h-5 animate-spin" />
            ) : (
              "Translate"
            )
          }
        </Button>
      </div>
      {translation && (
        <div className="p-3 bg-background/50 border border-foreground/10 rounded-lg">
          <p className="text-foreground">{translation}</p>
        </div>
      )}

      <h3 className="text-xl font-semibold text-foreground mt-6 mb-4">Dictionary</h3>
      <ul className="space-y-2">
        {dictionary.map((entry, idx) => (
        <li
          key={idx}
          className="p-3 bg-background/50 border border-foreground/10 rounded-lg"
        >
          <button
            onClick={() => toggleOpen(idx)}
            className="flex justify-between items-center w-full text-left"
          >
            <div>
              <span className="font-medium">{entry.original}</span>
              <span className="ml-2 text-sm text-muted-foreground">
                [{entry.languageCode}]
              </span>
            </div>
            {openIndex === idx ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )}
          </button>

          {openIndex === idx && (
            <div className="mt-2 text-sm text-muted-foreground border-t border-foreground/10 pt-2">
              {entry.translation}
            </div>
          )}
        </li>
        ))}
      </ul>
    </div>
  );

  async function handleTranslate() {
    if (!input) return 
    setIsLoading(true);

    try {
      const translationPair = await autoTranslate(input, 'en')
      setTranslation( translationPair.translation );
      storeInDictionary({ original: input, ...translationPair });
      setInput("");

    } catch (error) {
      errorToast("Error Translating", error.message)

    } finally {
      setIsLoading(false);
    }
  }
}
