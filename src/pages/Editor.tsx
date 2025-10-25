import { useState } from "react";
import { Save, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDocument } from "@/hooks/use-document";
import { ContextualTools } from "@/components/editor/contextualTools";

export default function Editor() {
  const { document, updateTitle, updateContent, saveDocument, isSaved } = useDocument();
  const [selectedText, setSelectedText] = useState("");

  const handleTextSelect = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString());
    } else {
      setSelectedText("");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="border-b border-border bg-card px-4 lg:px-6 py-3 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <input
            value={document.title}
            onChange={(e) => updateTitle(e.target.value)}
            placeholder="Document Title"
            className="flex-1 text-lg font-medium"
          />
          <Button
            onClick={saveDocument}
            size="sm"
            className="shrink-0"
          >
            {isSaved ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Saved
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-4 relative">
        <textarea
          value={document.content}
          onChange={(e) => updateContent(e.target.value)}
          onSelect={handleTextSelect}
          placeholder="Start typing your document..."
          className="min-h-full resize-none border-0 focus-visible:ring-0 text-base leading-relaxed"
        />

        {selectedText && (
          <ContextualTools
            selectedText={selectedText}
            onClear={() => setSelectedText("")}
          />
        )}
      </div>
    </div>
  );
}
