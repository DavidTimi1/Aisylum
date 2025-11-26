import { AlertTriangle, ShieldCheck } from "lucide-react";
import { Button } from "./ui/button";

const AIWarningModal = ({ missing = [], onContinue, onCancel }: {
    missing: string[];
    onContinue: () => void;
    onCancel: () => void;
}) => {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[2000] animate-fadeIn" onClick={onContinue}>
            <div className="bg-background border border-foreground/10 w-[95%] max-w-md rounded-2xl p-4 md:p-8 shadow-xl animate-scaleIn" onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className="flex items-center gap-3 text-foreground mb-5">
                    <AlertTriangle className="w-6 h-6 text-yellow-400" />
                    <h2 className="text-xl font-bold montserrat-font">AI Environment Warning</h2>
                </div>

                <p className="text-foreground-light text-sm leading-relaxed mb-4">
                    Some required offline AI models are not available on this device.
                    Aisylum will temporarily fall back to <span className="font-semibold text-primary">Remote AI</span>, still
                    <span className="font-semibold text-primary"> your data remains private and is never saved outside your device</span>.
                </p>

                {/* Missing Models List */}
                <ul className="space-y-2 text-sm text-foreground-light mb-4">
                    {missing.map((m) => (
                        <li key={m} className="flex items-center gap-2 bg-background p-2 rounded-lg border border-yellow-400/40 text-yellow-300">
                            <AlertTriangle className="w-4 h-4" /> {m} unavailable
                        </li>
                    ))}
                </ul>

                {/* Privacy reassurance */}
                <div className="bg-primary/10 border border-primary/30 rounded-xl p-3 text-sm text-foreground mb-6 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    Secure fallback enabled — still private & stateless
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3">
                    <Button
                        variant="outline"
                        className="px-4 font-medium"
                        onClick={onCancel}
                    >
                        Go Back
                    </Button>

                    <Button
                        className="px-4 font-medium"
                        onClick={onContinue}
                    >
                        Continue Anyway
                    </Button>
                </div>

                {/* Learn More */}
                <a
                    href="https://www.oxfordreference.com/display/10.1093/oi/authority.20110803100529185"
                    target="_blank" rel="noopener noreferrer"
                    className="block text-xs text-primary underline text-center mt-6"
                >
                    Learn how stateless remote inference still keeps you private »
                </a>
            </div>
        </div>
    );
};

export default AIWarningModal;
