import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { supportedLanguages } from "@/lib/languageModules";


export function LanguageSelect({ value, onChange }: { value: string; onChange: (lang: string) => void }) {
    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="mb-2 montserrat-font">
                <SelectValue placeholder="Select a language..." />
            </SelectTrigger>

            <SelectContent>
                {Object.entries(supportedLanguages).map(([code, name]) => (
                    <SelectItem key={code} value={code}>
                        {name} ({code})
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
