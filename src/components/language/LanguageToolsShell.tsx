import { useState } from "react";
import VocabularyList from "./VocabularyList";
import PracticeView from "./PracticeView";
import { BookOpenIcon, CheckCircle2Icon, RefreshCwIcon } from "lucide-react";

export default function LanguageToolsShell() {
    const [tab, setTab] = useState<"vocab" | "practice">("vocab");
    
    return (
        <section>
            <div className="mb-8">
                <h1 className="text-2xl text-foreground montserrat-font mb-2">
                    Language Tools
                </h1>
                <p className="text-foreground/60 mb-6 max-w-2xl">
                    Built-in
                    translation and learning tools to help you communicate across borders
                </p>

                <div className="w-max mx-auto max-w-full">
                    <div className="bg-primary/20 border border-primary/40 rounded-xl p-4 flex items-center gap-3">
                        <CheckCircle2Icon className="h-4 w-4 text-primary" />
                        <p className="text-sm text-foreground">
                            <span className="font-semibold">100% Private & Offline.</span> All
                            language processing happens on your device. Nothing is sent to a
                            server.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex gap-2 mb-6 montserrat-font">
                <button
                    className={`px-4 py-2 rounded-md ${tab === "vocab" ? "bg-foreground/10" : "bg-background/30"}`}
                    onClick={() => setTab("vocab")}
                    aria-pressed={tab === "vocab"}
                >
                    <BookOpenIcon className="w-4 h-4 inline mr-2" /> Vocabulary
                </button>
                <button
                    className={`px-4 py-2 rounded-md ${tab === "practice" ? "bg-foreground/10" : "bg-background/30"}`}
                    onClick={() => setTab("practice")}
                >
                    <RefreshCwIcon className="w-4 h-4 inline mr-2" /> Practice
                </button>
            </div>

            <div>
                {tab === "vocab" ? <VocabularyList /> : <PracticeView />}
            </div>
        </section>
    );

    function noop() { /* kept to follow your rule of declaration after return */ }
}
