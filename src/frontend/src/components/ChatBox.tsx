import { Button } from "@/components/ui/button";
import { Bot, Send, User } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { ChatMessage, WorkflowStep } from "../App";
import SuggestionChips from "./SuggestionChips";
import WorkflowSteps from "./WorkflowSteps";

interface ChatBoxProps {
  messages: ChatMessage[];
  isProcessing: boolean;
  workflowSteps: WorkflowStep[];
  suggestions: string[];
  onSendCommand: (command: string) => void;
  onSuggestionClick: (suggestion: string) => void;
}

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatBox({
  messages,
  isProcessing,
  workflowSteps,
  suggestions,
  onSendCommand,
  onSuggestionClick,
}: ChatBoxProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on message/state changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isProcessing]);

  const handleSubmit = () => {
    const cmd = input.trim();
    if (!cmd || isProcessing) return;
    setInput("");
    onSendCommand(cmd);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="nexus-card h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-[oklch(0.65_0.18_280)] flex items-center justify-center">
            <Bot className="w-3.5 h-3.5 text-white" />
          </div>
          <h2 className="font-semibold text-base text-foreground">
            AI Automation Chat
          </h2>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0"
        style={{ background: "oklch(var(--nexus-inner))" }}
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-semibold ${
                  msg.role === "ai"
                    ? "bg-gradient-to-br from-primary to-[oklch(0.65_0.18_280)] text-white"
                    : "bg-accent text-accent-foreground"
                }`}
              >
                {msg.role === "ai" ? (
                  <Bot className="w-3.5 h-3.5" />
                ) : (
                  <User className="w-3.5 h-3.5" />
                )}
              </div>
              <div
                className={`max-w-[75%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}
              >
                <span className="text-[11px] text-muted-foreground font-medium">
                  {msg.role === "ai" ? "Nexus AI" : "You"} ·{" "}
                  {formatTime(msg.timestamp)}
                </span>
                <div
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-card border border-border text-foreground rounded-tl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isProcessing && workflowSteps.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-[oklch(0.65_0.18_280)] flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="bg-card border border-border px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </motion.div>
        )}

        {workflowSteps.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <WorkflowSteps steps={workflowSteps} />
          </motion.div>
        )}

        {suggestions.length > 0 && !isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <SuggestionChips
              suggestions={suggestions}
              onSelect={onSuggestionClick}
            />
          </motion.div>
        )}
      </div>

      <div className="flex-shrink-0 px-4 py-4 border-t border-border">
        <p className="text-[11px] font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
          Command Input
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isProcessing}
            placeholder="Ask AI Agent to automate a task… (e.g., 'Run standard email flow')"
            data-ocid="chat.input"
            className="flex-1 px-4 py-3 rounded-xl bg-muted border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 transition"
          />
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isProcessing || !input.trim()}
            data-ocid="chat.submit_button"
            className="rounded-xl px-4 bg-primary hover:bg-primary/90"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
