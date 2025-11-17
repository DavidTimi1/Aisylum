import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { languageModules } from "@/lib/languageModules";
import { generateModuleLessons, useLanguageStore } from "@/stores/languageStore";
import { AlertTriangleIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import useActivityStore from "@/stores/activityStore";
import { errorToast } from "@/hooks/use-toast";
import { LessonSkeleton } from "./LessonsSkeleton";

export default function LessonView() {
    const [lesson, setLesson] = useState<{ question: string; type: "speech" | "written"; answer: string }[]>([]);
    const [showAnswer, setShowAnswer] = useState(false);
    const { selectedLanguage, languages, updateProgress } = useLanguageStore();
    const currentModule = languages.find((l) => l.languageCode === selectedLanguage)?.currentModule;
    const [showAllModules, setShowAllModules] = useState(false);
    const { addLanguageActivity } = useActivityStore();
    const [isLoading, setIsLoading] = useState(false);
    const [reload, setReload] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (currentModule) {
            generateLesson();
        }
    }, [currentModule, reload]);

    if (showAllModules || !currentModule) {
        return <AllLessons goToLesson={(moduleIndex: number) => {
            setShowAllModules(false);
            saveProgress(moduleIndex);
        }} />
    }

    return (
        <div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Current Lesson ({currentModule})</h2>

            {
                isLoading ? (
                    <LessonSkeleton />
                ) : error ? (
                    <LessonErrorView message={error} onRetry={triggerReload} />

                ) : lesson.length === 0 ? (
                    <p className="text-sm text-foreground/60">
                        No lesson available. Select a language to start learning.
                    </p>

                ) : (
                    <div className="space-y-4">
                        {
                            lesson.map((item, idx) => (
                                <div key={idx} className="p-3 bg-background/50 border border-foreground/10 rounded-lg">
                                    <p className="text-foreground">{idx + 1}. {item.question}</p>

                                    {item.type === "speech" && (
                                        <p className="text-sm text-primary mt-2">[Speech Practice Required]</p>
                                    )}
                                    {showAnswer && <p className="text-sm text-primary mt-2">{item.answer}</p>}
                                </div>
                            ))
                        }
                        <Button onClick={() => setShowAnswer((prev) => !prev)}>
                            {showAnswer ? "Hide Answer" : "Show Answer"}
                        </Button>
                        <div className="flex w-full justify-between items-center gap-3 mt-20">
                            <Button variant="outline" onClick={checkPreviousLesson}>
                                <ChevronLeftIcon className="w-4 h-4" />
                                Previous Lesson
                            </Button>
                            <Button variant="outline" onClick={goToNextLesson}>
                                Next Lesson
                                <ChevronRightIcon className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )
            }
        </div>
    );

    async function generateLesson() {
        if (!selectedLanguage || !currentModule) return;
        setIsLoading(true)

        try {
            const tutLessons = await generateModuleLessons(selectedLanguage, currentModule);
            setLesson(tutLessons);

        } catch (err: any) {
            errorToast("Error Generating Lesson", err.message);
            setError(err.message || 'An unexpected error occurred while loading the lesson.');

        } finally {
            setIsLoading(false)
        }
    }

    function triggerReload(){
        setReload((prev) => !prev);
    }

    function saveProgress(moduleIndex: number) {
        handleUpdateProgress(selectedLanguage!, moduleIndex);
    }

    function checkPreviousLesson() {
        if (!currentModule || currentModule <= 1) return;

        handleUpdateProgress(selectedLanguage!, currentModule - 1);
    }

    function goToNextLesson() {
        if (!currentModule || currentModule >= 20) return;

        handleUpdateProgress(selectedLanguage!, currentModule + 1);
    }

    function handleUpdateProgress(language: string, newModule: number) { // middleman
        updateProgress(language, newModule);
        addLanguageActivity(language, newModule);
    }
}


const AllLessons = ({ goToLesson }: { goToLesson: (moduleIndex: number) => void }) => {
    const { selectedLanguage } = useLanguageStore();

    return (
        <div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
                All Lessons
            </h2>
            {
                !selectedLanguage ? (
                    <p className="text-sm text-foreground/60">
                        No lesson available. Select a language to start learning.
                    </p>

                ) : (
                    <ul className="space-y-2">
                        {
                            languageModules.map((module) => (
                                <li
                                    key={module.id}
                                    className="p-3 bg-background/50 border border-foreground/10 rounded-lg cursor-pointer hover:bg-primary/10"
                                    onClick={() => goToLesson(module.id)}
                                >
                                    <h3 className="font-semibold montserrat-font-normal text-foreground">{module.title}</h3>
                                    <p className="text-sm text-foreground/60">{module.description}</p>
                                </li>
                            ))
                        }
                    </ul>
                )}
        </div>
    )
}


function LessonErrorView({ message, onRetry }: { message: string; onRetry: () => void }) {
    return (
      <div className="p-4 border border-destructive/40 bg-destructive/10 rounded-lg text-destructive space-y-3">
        <p className="font-medium flex gap-2 items-center">
            <AlertTriangleIcon className="w-5 h-5" />
             Error Loading Lesson
        </p>
        <p className="text-sm opacity-80">{message}</p>

        <Button onClick={onRetry} className="mt-2">
          Reload Lesson
        </Button>
      </div>
    );
  }
  