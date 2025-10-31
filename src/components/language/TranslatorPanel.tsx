import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function TranslatorPanel() {
  const [input, setInput] = useState("");
  const [translation, setTranslation] = useState("");
  const [dictionary, setDictionary] = useState<string[]>([]);

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
        <Button onClick={handleTranslate}>Translate</Button>
      </div>
      {translation && (
        <div className="p-3 bg-background/50 border border-foreground/10 rounded-lg">
          <p className="text-foreground">{translation}</p>
        </div>
      )}

      <h3 className="text-xl font-semibold text-foreground mt-6 mb-4">Dictionary</h3>
      <ul className="space-y-2">
        {dictionary.map((entry, idx) => (
          <li key={idx} className="p-3 bg-background/50 border border-foreground/10 rounded-lg">
            {entry}
          </li>
        ))}
      </ul>
    </div>
  );

  function handleTranslate() {
    // TODO: Implement translation logic
    setTranslation("[Translated Text]");
    setDictionary((prev) => [...prev, input]);
  }
}
