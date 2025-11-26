import AIEnvDetection from "@/components/AIEnvDetection";
import LanguageLearningShell from "@/components/language/LanguageLearningShell";
import { AI_APIS } from "@/lib/built-in-ai";


export default function Language() {
  return (
    <AIEnvDetection required={[AI_APIS.PROMPT, AI_APIS.LANGUAGE_DETECTOR, AI_APIS.TRANSLATOR]}>

      <div className="p-6 max-w-6xl mx-auto">
        <LanguageLearningShell />
      </div>
      
    </AIEnvDetection>
  );
}