import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, Mic, BookOpen } from "lucide-react";

export function PracticeTab() {
  const [phrase, setPhrase] = useState("");
  const [vocabulary] = useState([
    { word: "pharmacy", definition: "A place where medicines are sold", examples: [] },
    { word: "appointment", definition: "A scheduled meeting", examples: [] }
  ]);

  const handleSpeak = () => {
    // Will integrate Text-to-Speech Web API
    console.log("Speaking:", phrase);
  };

  const handleRecord = () => {
    // Will integrate Web Audio API
    console.log("Recording pronunciation");
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Vocabulary Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Your Vocabulary
        </h3>
        <div className="space-y-2">
          {vocabulary.map((item) => (
            <div
              key={item.word}
              className="border border-border rounded-md p-3 space-y-1"
            >
              <div className="font-medium text-foreground">{item.word}</div>
              <div className="text-sm text-muted-foreground">{item.definition}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pronunciation Practice */}
      <div className="space-y-3 pt-4 border-t border-border">
        <h3 className="text-sm font-semibold text-foreground">
          Pronunciation Practice
        </h3>
        <div className="space-y-3">
          <input
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
            placeholder="Enter a phrase to practice..."
            className="text-base"
          />
          <div className="flex gap-2">
            <Button
              onClick={handleSpeak}
              disabled={!phrase.trim()}
              variant="outline"
              className="flex-1"
            >
              <Volume2 className="h-4 w-4 mr-2" />
              Hear Pronunciation
            </Button>
            <Button
              onClick={handleRecord}
              disabled={!phrase.trim()}
              variant="outline"
              className="flex-1"
            >
              <Mic className="h-4 w-4 mr-2" />
              Record My Voice
            </Button>
          </div>
          {phrase && (
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-accent rounded-full" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
