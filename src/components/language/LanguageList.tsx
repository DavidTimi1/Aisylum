import { useState } from "react";
import { PlusCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguageStore } from "@/stores/languageStore";
import { LanguageSelect } from "../ui/language-selector";

export default function LanguageList({viewModules}) {
    const [newLanguage, setNewLanguage] = useState("");
    const { languages, addLanguage, setSelectedLanguage } = useLanguageStore();

    return (
        <div>
            {/* Existing languages */}
            <h2 className="text-2xl font-semibold text-foreground montserrat-font mb-4">
                Your Languages
            </h2>
    
            <ul className="space-y-2">
                {languages.map((lang, idx) => (
                    <li
                        key={idx}
                        className="p-3 bg-background/50 border border-foreground/10 rounded-lg cursor-pointer hover:bg-primary/10"
                        onClick={() => handleLanguageClick(lang.languageCode)}
                    >
                        <h3 className="font-semibold text-foreground">{lang.language}</h3>
                        <p className="text-sm text-foreground/60">
                            Current Module: {lang.currentModule + 1}
                        </p>
                    </li>
                ))}
            </ul>
    
            {/* Add new language section */}
            <div className="mt-10 pt-6 border-t border-foreground/10">
                <h3 className="text-xl font-semibold text-foreground mb-3 montserrat-font">
                    Add a New Language?
                </h3>
    
                <div className="space-y-3">
                    <LanguageSelect value={newLanguage} onChange={setNewLanguage} />
    
                    <Button 
                        onClick={handleAddLanguage}
                        className="flex items-center gap-2"
                        disabled={!newLanguage}
                    >
                        <PlusCircleIcon className="w-4 h-4" />
                        Add Language
                    </Button>
                </div>
            </div>
        </div>
    );

    function handleLanguageClick(languageCode){
        setSelectedLanguage(languageCode);
        viewModules(languageCode)
    }

    function handleAddLanguage() {
        if (!newLanguage) return
        addLanguage(newLanguage);
        setNewLanguage('');
    }
}
