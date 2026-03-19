import { Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface SuggestionChipsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

export default function SuggestionChips({
  suggestions,
  onSelect,
}: SuggestionChipsProps) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
        Suggested Automations
      </p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s, i) => (
          <motion.button
            key={s}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.2 }}
            onClick={() => onSelect(s)}
            data-ocid={`chat.suggestion.button.${i + 1}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
          >
            <Sparkles className="w-3 h-3" />
            {s}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
