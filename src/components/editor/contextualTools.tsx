import { Button } from "@/components/ui/button";
import { Check, Sparkles, Type } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ContextualToolsProps {
  selectedText: string;
  onClear: () => void;
}

export function ContextualTools({ selectedText, onClear }: ContextualToolsProps) {
  const handleProofread = async () => {
    // Will integrate Chrome Built-in Proofreader API
    console.log("Proofreading:", selectedText);
  };

  const handleSimplify = async () => {
    // Will integrate Chrome Built-in Rewriter API
    console.log("Simplifying:", selectedText);
  };

  const handleChangeTone = async (tone: string) => {
    // Will integrate Chrome Built-in Rewriter API with tone
    console.log("Changing tone to:", tone, "for text:", selectedText);
  };

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 lg:bottom-8 z-50 animate-in fade-in slide-in-from-bottom-2">
      <div className="bg-card border border-border rounded-md shadow-lg p-2 flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleProofread}
          className="gap-2"
        >
          <Check className="h-4 w-4" />
          Proofread
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={handleSimplify}
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Simplify
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className="gap-2">
              <Type className="h-4 w-4" />
              Tone
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleChangeTone("formal")}>
              Formal
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleChangeTone("urgent")}>
              Urgent
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleChangeTone("professional")}>
              Professional
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
