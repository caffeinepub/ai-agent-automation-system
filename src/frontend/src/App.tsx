import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import ChatBox from "./components/ChatBox";
import Header from "./components/Header";
import LogsPanel from "./components/LogsPanel";
import Sidebar from "./components/Sidebar";
import { useAddExecutionLog, useAddTaskHistory } from "./hooks/useQueries";

const queryClient = new QueryClient();

export type Theme = "dark" | "light";

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

export interface WorkflowStep {
  id: string;
  name: string;
  status: "pending" | "running" | "success" | "error";
  iconType: string;
}

function AppInner() {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem("nexus-theme");
    return (stored as Theme) || "dark";
  });
  const [activeView, setActiveView] = useState<"chat" | "settings">("chat");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "ai",
      content:
        "Hello! I'm Nexus AI, your automation assistant. Type a command like 'Send message to Slack and update sheet' to get started.",
      timestamp: new Date(),
    },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [pendingCommand, setPendingCommand] = useState<string | null>(null);

  const addTaskHistory = useAddTaskHistory();
  const addExecutionLog = useAddExecutionLog();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("nexus-theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const suggestionsPool = [
    "Send weekly report to Slack",
    "Update team spreadsheet",
    "Notify channel and log entry",
    "Schedule daily standup alert",
    "Sync CRM data to Sheets",
    "Post deployment status to Slack",
    "Archive completed tasks",
    "Send performance metrics",
  ];

  const runCommand = useCallback(
    async (command: string) => {
      if (isProcessing || !command.trim()) return;
      setIsProcessing(true);
      setSuggestions([]);

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: command,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);

      const steps: WorkflowStep[] = [
        {
          id: "s1",
          name: "AI Interpreting Command...",
          status: "pending",
          iconType: "ai",
        },
        {
          id: "s2",
          name: "Detecting Tasks: Slack + Sheets",
          status: "pending",
          iconType: "system",
        },
        {
          id: "s3",
          name: "Executing Slack Message",
          status: "pending",
          iconType: "slack",
        },
        {
          id: "s4",
          name: "Updating Google Sheet Row",
          status: "pending",
          iconType: "sheets",
        },
      ];
      setWorkflowSteps(steps.map((s) => ({ ...s, status: "pending" })));

      const delays = [800, 600, 900, 700];
      let sheetsError = false;

      for (let i = 0; i < steps.length; i++) {
        await new Promise((r) => setTimeout(r, 200));
        setWorkflowSteps((prev) =>
          prev.map((s, idx) => (idx === i ? { ...s, status: "running" } : s)),
        );
        await new Promise((r) => setTimeout(r, delays[i]));

        const failed = i === 3 && Math.random() < 0.1;
        if (failed) sheetsError = true;

        const status = failed ? "error" : "success";
        setWorkflowSteps((prev) =>
          prev.map((s, idx) => (idx === i ? { ...s, status } : s)),
        );

        addExecutionLog.mutate({
          stepName: steps[i].name,
          status,
          iconType: steps[i].iconType,
        });
      }

      await new Promise((r) => setTimeout(r, 400));

      const aiResponse = sheetsError
        ? `I processed your command "${command}". Slack message was sent successfully, but updating the Google Sheet encountered an error. Please check your Sheets configuration in Settings.`
        : `I've successfully processed your command "${command}". The Slack message was sent and the Google Sheet has been updated. All tasks completed successfully! ✅`;

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "ai",
        content: aiResponse,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);

      const taskId = BigInt(Date.now());
      addTaskHistory.mutate({
        taskId,
        commandText: command,
        success: !sheetsError,
      });

      if (sheetsError) {
        toast.error("Sheets step failed. Check your configuration.");
      } else {
        toast.success("Automation workflow completed successfully!");
      }

      const shuffled = [...suggestionsPool].sort(() => Math.random() - 0.5);
      setSuggestions(shuffled.slice(0, 3));
      setIsProcessing(false);
    },
    [isProcessing, addTaskHistory, addExecutionLog],
  );

  useEffect(() => {
    if (pendingCommand) {
      const cmd = pendingCommand;
      setPendingCommand(null);
      runCommand(cmd);
    }
  }, [pendingCommand, runCommand]);

  const handleRerun = useCallback((command: string) => {
    setPendingCommand(command);
    setActiveView("chat");
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header theme={theme} onToggleTheme={toggleTheme} />
      <main
        className="flex-1 flex gap-5 p-5 overflow-hidden"
        style={{ height: "calc(100vh - 64px)" }}
      >
        {/* Left sidebar */}
        <div className="w-72 flex-shrink-0 h-full">
          <Sidebar
            activeView={activeView}
            onViewChange={setActiveView}
            onRerun={handleRerun}
          />
        </div>
        {/* Center chat */}
        <div className="flex-1 min-w-0 h-full">
          {activeView === "chat" ? (
            <ChatBox
              messages={messages}
              isProcessing={isProcessing}
              workflowSteps={workflowSteps}
              suggestions={suggestions}
              onSendCommand={runCommand}
              onSuggestionClick={runCommand}
            />
          ) : (
            <SettingsPlaceholder />
          )}
        </div>
        {/* Right logs panel */}
        <div className="w-72 flex-shrink-0 h-full">
          <LogsPanel />
        </div>
      </main>
      <Toaster position="top-right" richColors />
    </div>
  );
}

function SettingsPlaceholder() {
  return (
    <div className="nexus-card h-full flex items-center justify-center">
      <p className="text-muted-foreground">Settings panel loaded in Sidebar</p>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  );
}
