import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, Search, Sparkles } from "lucide-react";
import type { Theme } from "../App";

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
}

export default function Header({ theme, onToggleTheme }: HeaderProps) {
  return (
    <header className="h-16 flex-shrink-0 flex items-center px-5 border-b border-border bg-card shadow-xs">
      <div className="flex items-center gap-2.5 mr-8">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-primary to-[oklch(0.65_0.18_280)] shadow-sm">
          <span className="text-white font-bold text-sm">N</span>
        </div>
        <span className="font-semibold text-base text-foreground">
          Nexus AI
        </span>
      </div>

      <nav className="hidden md:flex items-center gap-6 mr-auto">
        {["Dashboard", "Workflows", "Integrations", "Docs"].map((item) => (
          <button
            type="button"
            key={item}
            data-ocid={`nav.${item.toLowerCase()}.link`}
            className={`text-sm font-medium transition-colors ${
              item === "Dashboard"
                ? "text-primary border-b-2 border-primary pb-0.5"
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
          placeholder="Search"
          data-ocid="header.search_input"
          className="pl-9 pr-4 py-1.5 text-sm bg-muted border border-border rounded-full focus:outline-none focus:ring-1 focus:ring-ring w-48 placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          data-ocid="header.theme.toggle"
          onClick={onToggleTheme}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted border border-border text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <Sparkles className="w-3 h-3" />
          {theme === "dark" ? "Dark" : "Light"}
        </button>
        <button
          type="button"
          className="relative p-2 rounded-full hover:bg-muted transition-colors"
          data-ocid="header.notifications.button"
        >
          <Bell className="w-4 h-4 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-primary rounded-full" />
        </button>
        <Avatar className="w-8 h-8">
          <AvatarFallback className="text-xs font-semibold bg-primary text-primary-foreground">
            AS
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
