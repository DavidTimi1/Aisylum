import { useEffect, useState } from "react";
import { useLanguageStore } from "@/stores/languageStore";
import LanguageList from "./LanguageList";
import TranslatorPanel from "./TranslatorPanel";
import LessonView from "./LessonView";
import { BookOpenIcon, ChevronsUpDown, ChevronsUpDownIcon, GraduationCapIcon, LanguagesIcon } from "lucide-react";
import { supportedLanguages } from "@/lib/languageModules";

export default function LanguageLearningShell() {
    const [tab, setTab] = useState<"languages" | "lessons" | "translator">("languages");
    const selectedLanguageCode = useLanguageStore((state) => state.selectedLanguage);
    const selectedLanguage = supportedLanguages[selectedLanguageCode || ""] || null;

    useEffect(() => {
        if (selectedLanguage) {
            setTab("lessons");
        }
    }, [selectedLanguage]);

    return (
        <section>
            <header className="mb-8">
                <h1 className="text-2xl text-foreground montserrat-font mb-2">
                    Language Learning
                </h1>
                <p className="text-foreground/60 mb-6 max-w-2xl">
                    Learn new languages, practice lessons, and explore translations with ease.
                </p>
            </header>

            <div className="flex gap-2 mb-6 montserrat-font">
                <button
                    className={`px-4 py-2 rounded-md ${tab === "languages" ? "bg-foreground/10" : "bg-background/30"}`}
                    onClick={() => setTab("languages")}
                >
                    {
                        selectedLanguage ? (
                            <>
                                <ChevronsUpDownIcon className="w-4 h-4 inline mr-2" /> {selectedLanguage}
                            </>
                        ) : (
                            <>
                                <BookOpenIcon className="w-4 h-4 inline mr-2" /> Languages
                            </>
                        )
                    }
                </button>
                <button
                    className={`px-4 py-2 rounded-md ${tab === "lessons" ? "bg-foreground/10" : "bg-background/30"}`}
                    onClick={() => setTab("lessons")}
                >
                    <GraduationCapIcon className="w-4 h-4 inline mr-2" /> Lessons
                </button>
                <button
                    className={`px-4 py-2 rounded-md ${tab === "translator" ? "bg-foreground/10" : "bg-background/30"}`}
                    onClick={() => setTab("translator")}
                >
                    <LanguagesIcon className="w-4 h-4 inline mr-2" /> Translator
                </button>
            </div>

            <div>
                {tab === "languages" && <LanguageList />}
                {tab === "lessons" && <LessonView />}
                {tab === "translator" && <TranslatorPanel />}
            </div>
        </section>
    );

    function noop() { /* placeholder for unused functions */ }
}
