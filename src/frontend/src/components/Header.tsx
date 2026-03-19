import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, Moon, Search, Sun, Zap } from "lucide-react";
import { motion } from "motion/react";
import type { Theme } from "../App";

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
}

export default function Header({ theme, onToggleTheme }: HeaderProps) {
  return (
    <header className="h-16 flex-shrink-0 flex items-center px-5 border-b border-border bg-card/80 backdrop-blur-xl shadow-sm relative z-20">
      <div className="flex items-center gap-2.5 mr-8">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-primary to-[oklch(0.65_0.18_280)] shadow-sm glow-primary">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="font-display font-semibold text-base text-foreground tracking-tight">
          Nexus AI
        </span>
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20">
          v2.0
        </span>
      </div>

      <nav className="hidden md:flex items-center gap-6 mr-auto">
        {["Dashboard", "Workflows", "Integrations", "Docs"].map((item) => (
          <button
            type="button"
            key={item}
            className={`text-sm font-medium transition-colors ${
              item === "Dashboard"
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {item}
          </button>
        ))}
      </nav>

      <div className="relative hidden lg:block mr-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search automations..."
          className="pl-9 pr-4 py-1.5 text-sm bg-muted/60 border border-border rounded-full focus:outline-none focus:ring-1 focus:ring-ring w-52 placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex items-center gap-2">
        <motion.button
          type="button"
          onClick={onToggleTheme}
          whileTap={{ scale: 0.9 }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/60 border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
        >
          {theme === "dark" ? (
            <Moon className="w-3.5 h-3.5" />
          ) : (
            <Sun className="w-3.5 h-3.5" />
          )}
          {theme === "dark" ? "Dark" : "Light"}
        </motion.button>
        <button
          type="button"
          className="relative p-2 rounded-full hover:bg-muted transition-colors"
        >
          <Bell className="w-4 h-4 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full border border-background" />
        </button>
        <Avatar className="w-8 h-8">
          <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-primary to-[oklch(0.65_0.18_280)] text-white">
            AI
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
