import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Bot, Mic, MicOff, Paperclip, Send, User, X, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessage, WorkflowStep } from "../App";
import SuggestionChips from "./SuggestionChips";
import WorkflowSteps from "./WorkflowSteps";

interface ChatBoxProps {
  messages: ChatMessage[];
  isProcessing: boolean;
  workflowSteps: WorkflowStep[];
  suggestions: string[];
  onSendCommand: (command: string, attachedFile?: string) => void;
  onSuggestionClick: (suggestion: string) => void;
}

const INTENT_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  slack: {
    label: "Slack",
    color: "text-yellow-400",
    bg: "bg-yellow-400/15 border-yellow-400/30",
  },
  sheets: {
    label: "Sheets",
    color: "text-green-400",
    bg: "bg-green-400/15 border-green-400/30",
  },
  email: {
    label: "Email",
    color: "text-blue-400",
    bg: "bg-blue-400/15 border-blue-400/30",
  },
  crm: {
    label: "CRM",
    color: "text-orange-400",
    bg: "bg-orange-400/15 border-orange-400/30",
  },
  schedule: {
    label: "Scheduler",
    color: "text-purple-400",
    bg: "bg-purple-400/15 border-purple-400/30",
  },
};

function detectIntents(text: string): string[] {
  const lower = text.toLowerCase();
  const intents: string[] = [];
  if (
    lower.includes("slack") ||
    lower.includes("channel") ||
    lower.includes("notify")
  )
    intents.push("slack");
  if (
    lower.includes("sheet") ||
    lower.includes("spreadsheet") ||
    lower.includes("google")
  )
    intents.push("sheets");
  if (
    lower.includes("email") ||
    lower.includes("mail") ||
    lower.includes("send to")
  )
    intents.push("email");
  if (
    lower.includes("crm") ||
    lower.includes("lead") ||
    lower.includes("contact")
  )
    intents.push("crm");
  if (
    lower.includes("schedul") ||
    lower.includes("daily") ||
    lower.includes("weekly")
  )
    intents.push("schedule");
  return intents;
}

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function renderContent(content: string) {
  const lines = content.split("\n");
  return lines.map((line, i) => {
    const segments = line.split(/\*\*(.*?)\*\*/g);
    return (
      // biome-ignore lint/suspicious/noArrayIndexKey: static line content, stable
      <span key={`line-${i}`}>
        {segments.map((seg, j) =>
          j % 2 === 1 ? (
            // biome-ignore lint/suspicious/noArrayIndexKey: static bold segment
            <strong key={`b${i}${j}`}>{seg}</strong>
          ) : (
            seg
          ),
        )}
        {i < lines.length - 1 && <br />}
      </span>
    );
  });
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

type SpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionEvent = {
  results: { [index: number]: { [index: number]: { transcript: string } } };
  resultIndex: number;
};

export default function ChatBox({
  messages,
  isProcessing,
  workflowSteps,
  suggestions,
  onSendCommand,
  onSuggestionClick,
}: ChatBoxProps) {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [attachedFile, setAttachedFile] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [pendingCommand, setPendingCommand] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    setVoiceSupported(!!SR);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isProcessing, workflowSteps]);

  const detectedIntents = detectIntents(input);

  const handleSubmit = useCallback(() => {
    const cmd = input.trim();
    if (!cmd || isProcessing) return;
    const hasIntents = detectIntents(cmd).length > 0;
    if (hasIntents && !attachedFile) {
      setPendingCommand(cmd);
      setPreviewOpen(true);
    } else {
      setInput("");
      onSendCommand(cmd, attachedFile ?? undefined);
      setAttachedFile(null);
    }
  }, [input, isProcessing, attachedFile, onSendCommand]);

  const confirmAndRun = () => {
    setPreviewOpen(false);
    setInput("");
    onSendCommand(pendingCommand, attachedFile ?? undefined);
    setAttachedFile(null);
    setPendingCommand("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleVoice = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[event.resultIndex][0].transcript;
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAttachedFile(file.name);
    e.target.value = "";
  };

  const previewIntents = detectIntents(pendingCommand);
  const previewSteps = [
    "Parse natural language command",
    "Detect automation intents",
    ...previewIntents.map(
      (i) => `Execute ${INTENT_CONFIG[i]?.label || i} integration`,
    ),
    "Log execution results",
  ];

  return (
    <>
      <div className="glass-card h-full flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-[oklch(0.65_0.18_280)] flex items-center justify-center glow-primary">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-sm text-foreground">
                AI Automation Chat
              </h2>
              <p className="text-[10px] text-muted-foreground">
                Universal agent • Ollama-powered
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-[11px] text-success font-medium">Online</span>
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${
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
                  className={`max-w-[78%] flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}
                >
                  <span className="text-[10px] text-muted-foreground">
                    {msg.role === "ai" ? "Nexus AI" : "You"} ·{" "}
                    {formatTime(msg.timestamp)}
                  </span>
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-card border border-border/60 text-foreground rounded-tl-sm"
                    }`}
                  >
                    {msg.attachedFile && (
                      <div className="flex items-center gap-1.5 mb-1.5 px-2 py-1 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary">
                        <Paperclip className="w-3 h-3" />
                        {msg.attachedFile}
                      </div>
                    )}
                    {renderContent(msg.content)}
                  </div>
                  {msg.detectedIntents && msg.detectedIntents.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {msg.detectedIntents.map((intent) => (
                        <span
                          key={intent}
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${INTENT_CONFIG[intent]?.bg || "bg-muted"} ${INTENT_CONFIG[intent]?.color || "text-muted-foreground"}`}
                        >
                          {INTENT_CONFIG[intent]?.label || intent}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isProcessing && workflowSteps.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-2.5"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-[oklch(0.65_0.18_280)] flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="bg-card border border-border/60 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
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

        <div className="flex-shrink-0 px-4 py-3.5 border-t border-border/50">
          {detectedIntents.length > 0 && input.length > 3 && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-1.5 mb-2"
            >
              <Zap className="w-3 h-3 text-primary" />
              <span className="text-[10px] text-muted-foreground font-medium">
                Detected:
              </span>
              {detectedIntents.map((intent) => (
                <span
                  key={intent}
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${INTENT_CONFIG[intent]?.bg} ${INTENT_CONFIG[intent]?.color}`}
                >
                  {INTENT_CONFIG[intent]?.label}
                </span>
              ))}
            </motion.div>
          )}

          {attachedFile && (
            <div className="flex items-center gap-1.5 mb-2">
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary">
                <Paperclip className="w-3 h-3" />
                <span>{attachedFile}</span>
                <button
                  type="button"
                  onClick={() => setAttachedFile(null)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="file"
              ref={fileRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".txt,.csv,.pdf,.json,.xlsx"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="p-2.5 rounded-xl bg-muted/60 border border-border hover:bg-muted hover:border-primary/40 text-muted-foreground hover:text-primary transition-all flex-shrink-0"
              title="Attach file"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isProcessing}
              placeholder='Type a command… e.g., "Send report to Slack and update Sheets"'
              className="flex-1 px-4 py-2.5 rounded-xl bg-muted/60 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-primary/40 disabled:opacity-50 transition-all"
            />
            {voiceSupported && (
              <button
                type="button"
                onClick={toggleVoice}
                className={`relative p-2.5 rounded-xl border flex-shrink-0 transition-all ${
                  isListening
                    ? "bg-destructive/15 border-destructive/40 text-destructive mic-pulse"
                    : "bg-muted/60 border-border text-muted-foreground hover:text-primary hover:border-primary/40"
                }`}
                title={isListening ? "Stop recording" : "Voice input"}
              >
                {isListening ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>
            )}
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isProcessing || !input.trim()}
              className="rounded-xl px-4 bg-primary hover:bg-primary/90 glow-primary flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="glass-card border-border/50 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> Action Preview
            </DialogTitle>
            <DialogDescription>
              Review the automation steps before execution.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 my-2">
            <div className="px-3 py-2 rounded-lg bg-muted/50 border border-border text-xs text-foreground italic">
              &ldquo;{pendingCommand}&rdquo;
            </div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Steps to execute:
            </p>
            {previewSteps.map((step) => (
              <div
                key={step}
                className="flex items-center gap-2.5 p-2 rounded-lg bg-muted/30 border border-border/50"
              >
                <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                  {previewSteps.indexOf(step) + 1}
                </div>
                <span className="text-xs text-foreground">{step}</span>
              </div>
            ))}
            {previewIntents.length > 1 && (
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-success/10 border border-success/20 text-xs text-success">
                <Zap className="w-3 h-3" />
                {previewIntents.length} integrations will run in parallel
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setPreviewOpen(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmAndRun}
              className="rounded-xl bg-primary glow-primary"
            >
              Run Automation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
