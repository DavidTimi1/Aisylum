import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle } from "lucide-react";

export function VettingTab() {
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState<{ simplified: string; keywords: string[] } | null>(null);

  const handleVet = async () => {
    // Will integrate with local knowledge base + Rewriter API
    // Mock result for now
    setResult({
      simplified: "This is a simplified version of the official text.",
      keywords: ["official", "verified", "document"]
    });
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">
          Paste Official Text Here
        </label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste official documents, legal notices, or government forms here..."
          className="min-h-[200px] text-base"
        />
        <Button
          onClick={handleVet}
          disabled={!inputText.trim()}
          className="w-full"
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          VET & SIMPLIFY
        </Button>
      </div>

      {result && (
        <div className="space-y-4 border border-border rounded-md p-4">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-accent" />
              Simplified Version
            </h3>
            <p className="text-sm text-foreground leading-relaxed">
              {result.simplified}
            </p>
          </div>

          <div className="space-y-2 pt-4 border-t border-border">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-secondary" />
              Official Keywords Matched
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="px-2 py-1 bg-secondary/20 text-secondary-foreground rounded-md text-xs font-medium"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
