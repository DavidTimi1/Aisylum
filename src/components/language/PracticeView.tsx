import { useEffect, useState } from "react";
import { useVocabulary } from "@/hooks/use-vocabulary";
import { listenOnce, speakText } from "@/lib/speech";
import { CheckCircleIcon, Volume2Icon, EyeIcon, EyeOffIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';


export default function PracticeView() {
    const { items, loading, applyReviewResult } = useVocabulary();
    const [queue, setQueue] = useState<number[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [showTranslation, setShowTranslation] = useState(false);
    const [typeAnswer, setTypeAnswer] = useState("");
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!loading) {
            // basic due items first (or random)
            const shuffled = items.slice().sort((a, b) => (a.dueAt ?? 0) - (b.dueAt ?? 0));
            setQueue(shuffled.map(i => i.id!));
            setCurrentIdx(0);
        }
    }, [items, loading]);

    if (loading) return <div>Loading...</div>;
    if (!queue.length) return <div className="p-4">No words to practice. Add some words and come back — keep learning!</div>;

    const item = items.find(i => i.id === queue[currentIdx])!;

    return (

        <div className="bg-background/50 rounded-xl border border-foreground/10 p-6 hover:border-primary/40 transition-colors">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-xl font-semibold text-foreground">{item.word}</h3>
                    <p className="text-sm text-foreground/60">{item.baseLang}</p>
                </div>
                <p className="text-sm text-foreground/50">
                    {currentIdx + 1} / {queue.length}
                </p>
            </div>

            {/* Content */}
            <div className="space-y-4">
                {/* Actions: Play / Show Translation */}
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => speakText(item.word, item.baseLang)}
                        aria-label="Play word"
                        className="text-foreground/60 hover:text-primary"
                    >
                        <Volume2Icon className="w-4 h-4 mr-1" /> Play
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowTranslation((s) => !s)}
                        className="text-foreground/60 hover:text-primary"
                    >
                        {showTranslation ? (
                            <>
                                <EyeOffIcon className="w-4 h-4 mr-1" /> Hide translation
                            </>
                        ) : (
                            <>
                                <EyeIcon className="w-4 h-4 mr-1" /> Show translation
                            </>
                        )}
                    </Button>
                </div>

                {/* Translation */}
                {showTranslation && (
                    <div className="p-3 bg-primary/5 border border-primary/10 rounded-lg text-sm text-foreground/80">
                        {item.translations.map((t) => `${t.lang}: ${t.text}`).join(' • ')}
                    </div>
                )}

                {/* Typing Practice */}
                <div>
                    <label className="block text-sm text-foreground/70 mb-1">
                        Type the meaning (any):
                    </label>
                    <input
                        className="input w-full"
                        value={typeAnswer}
                        onChange={(e) => setTypeAnswer(e.target.value)}
                    />

                    <div className="mt-3 flex flex-wrap gap-2">
                        <Button size="sm" onClick={handleCheckTyped}>
                            Check
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handlePronunciationPractice}
                            className="text-foreground/60 hover:text-primary"
                        >
                            Say the word
                        </Button>
                    </div>
                </div>

                {/* Feedback message */}
                {message && (
                    <div className="text-sm text-foreground/60 bg-background/80 border border-foreground/10 rounded-md p-2">
                        {message}
                    </div>
                )}

                {/* Bottom Controls */}
                <div className="flex justify-between items-center pt-2 border-t border-foreground/5 mt-4">
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => gradeAndNext(2)}>
                            Again
                        </Button>
                        <Button size="sm" onClick={() => gradeAndNext(4)}>
                            Good
                        </Button>
                        <Button size="sm" onClick={() => gradeAndNext(5)}>
                            Easy
                        </Button>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={prev}>
                            Prev
                        </Button>
                        <Button size="sm" onClick={next}>
                            Skip
                        </Button>
                    </div>
                </div>
            </div>
        </div>

    );

    // helpers after return
    async function handleCheckTyped() {
        const normalizedGot = typeAnswer.trim().toLowerCase();
        const matches = item.translations.some(t => t.text.toLowerCase() === normalizedGot || t.text.toLowerCase().includes(normalizedGot));
        if (matches) {
            setMessage("Nice! That matches one translation. 🎉");
            await applyReviewResult(item.id!, 5);
        } else {
            setMessage("Not quite — keep trying! Tip: press 'Show translation' to reveal it.");
            await applyReviewResult(item.id!, 2);
        }
    }

    async function handlePronunciationPractice() {
        setMessage("Listening... please say the word clearly.");
        try {
            const res = await listenOnce(item.baseLang || "en-US", 5000);
            const recognised = res.transcript.toLowerCase().trim();
            const target = item.word.toLowerCase().trim();
            // naive similarity: exact or token overlap -> score
            let score = 0;
            if (recognised === target) score = 95;
            else if (recognised.split(" ").some(p => target.includes(p))) score = 70;
            else score = 40; // rough
            setMessage(`Heard: "${recognised}" — Score: ${score}%`);
            await applyReviewResult(item.id!, score >= 70 ? 5 : 2);
        } catch (e) {
            setMessage("Couldn't hear you — try again.");
        }
    }

    async function gradeAndNext(grade: number) {
        await applyReviewResult(item.id!, grade);
        next();
        setTypeAnswer("");
        setShowTranslation(false);
    }

    function next() {
        setCurrentIdx((i) => (i + 1) % queue.length);
        setMessage(null);
    }

    function prev() {
        setCurrentIdx((i) => (i - 1 + queue.length) % queue.length);
        setMessage(null);
    }
}
