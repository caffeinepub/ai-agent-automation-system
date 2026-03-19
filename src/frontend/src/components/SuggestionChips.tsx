import { Lightbulb, Sparkles } from "lucide-react";
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
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Sparkles className="w-3 h-3 text-primary" />
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
          Smart Suggestions
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {suggestions.map((s, i) => (
          <motion.button
            key={s}
            type="button"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.07 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(s)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/25 text-[11px] font-medium text-primary hover:bg-primary/20 hover:border-primary/40 transition-all"
          >
            <Lightbulb className="w-2.5 h-2.5" />
            {s}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
