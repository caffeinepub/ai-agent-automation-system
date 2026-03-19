import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import ChatBox from "./components/ChatBox";
import Header from "./components/Header";
import LogsPanel from "./components/LogsPanel";
import Sidebar from "./components/Sidebar";
import {
  useAddExecutionLog,
  useAddSavedAgent,
  useAddTaskHistory,
  useGetTaskHistory,
} from "./hooks/useQueries";

const queryClient = new QueryClient();

export type Theme = "dark" | "light";
export type AppView =
  | "chat"
  | "analytics"
  | "scheduler"
  | "agents"
  | "credentials";

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
  attachedFile?: string;
  detectedIntents?: string[];
}

export interface WorkflowStep {
  id: string;
  name: string;
  status: "pending" | "running" | "success" | "error";
  iconType: string;
  parallel?: boolean;
}

const SUGGESTIONS_POOL = [
  "Send weekly report to Slack",
  "Update team spreadsheet with metrics",
  "Notify #general and log entry",
  "Schedule daily standup alert",
  "Sync CRM data to Sheets",
  "Post deployment status to Slack",
  "Archive completed tasks",
  "Send performance metrics to manager",
  "Update lead in CRM system",
  "Email summary to stakeholders",
  "Run full automation workflow",
  "Backup data to Google Sheets",
];

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
    lower.includes("contact") ||
    lower.includes("salesforce")
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

function buildWorkflowSteps(
  intents: string[],
  _command: string,
): WorkflowStep[] {
  const steps: WorkflowStep[] = [
    { id: "s0", name: "AI Parsing Command", status: "pending", iconType: "ai" },
    {
      id: "s1",
      name: "Intent Detection & Planning",
      status: "pending",
      iconType: "system",
    },
  ];
  if (intents.includes("slack")) {
    steps.push({
      id: "s-slack",
      name: "Sending Slack Message",
      status: "pending",
      iconType: "slack",
      parallel: intents.length > 2,
    });
  }
  if (intents.includes("email")) {
    steps.push({
      id: "s-email",
      name: "Sending Email via SMTP",
      status: "pending",
      iconType: "email",
      parallel: intents.length > 2,
    });
  }
  if (intents.includes("sheets")) {
    steps.push({
      id: "s-sheets",
      name: "Updating Google Sheets",
      status: "pending",
      iconType: "sheets",
      parallel: intents.length > 2,
    });
  }
  if (intents.includes("crm")) {
    steps.push({
      id: "s-crm",
      name: "Syncing CRM Record",
      status: "pending",
      iconType: "crm",
      parallel: intents.length > 2,
    });
  }
  if (intents.length === 0) {
    steps.push(
      {
        id: "s-default1",
        name: "Executing Automation Task",
        status: "pending",
        iconType: "system",
      },
      {
        id: "s-default2",
        name: "Logging Results",
        status: "pending",
        iconType: "ai",
      },
    );
  }
  return steps;
}

function AppInner() {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem("nexus-theme") as Theme) || "dark",
  );
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "ai",
      content:
        'Hello! I\'m **Nexus AI**, your universal automation agent. Type a natural language command like:\n\n• *"Send report to Slack and update spreadsheet"*\n• *"Email manager and sync CRM contact"*\n• *"Schedule daily standup notification"*\n\nI\'ll detect your intents, build a workflow, and execute it step by step.',
      timestamp: new Date(),
    },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([
    "Send report to Slack",
    "Update Google Sheets",
    "Email the team",
  ]);
  const [pendingCommand, setPendingCommand] = useState<string | null>(null);

  const addTaskHistory = useAddTaskHistory();
  const addExecutionLog = useAddExecutionLog();
  const addSavedAgent = useAddSavedAgent();
  const { data: taskHistory } = useGetTaskHistory();
  const autoCreatedAgents = useRef<Set<string>>(new Set());

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("nexus-theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(
    () => setTheme((prev) => (prev === "dark" ? "light" : "dark")),
    [],
  );

  const runCommand = useCallback(
    async (command: string, attachedFile?: string) => {
      if (isProcessing || !command.trim()) return;
      setIsProcessing(true);
      setSuggestions([]);

      const detectedIntents = detectIntents(command);
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: command,
        timestamp: new Date(),
        attachedFile,
        detectedIntents,
      };
      setMessages((prev) => [...prev, userMsg]);

      const steps = buildWorkflowSteps(detectedIntents, command);
      setWorkflowSteps(steps.map((s) => ({ ...s, status: "pending" })));

      let hasError = false;
      const delays = [600, 500, 800, 700, 750, 650];

      for (let i = 0; i < steps.length; i++) {
        await new Promise((r) => setTimeout(r, 150));
        setWorkflowSteps((prev) =>
          prev.map((s, idx) => (idx === i ? { ...s, status: "running" } : s)),
        );
        await new Promise((r) => setTimeout(r, delays[i] ?? 700));

        const failed = i === steps.length - 1 && Math.random() < 0.07;
        if (failed) hasError = true;
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

      await new Promise((r) => setTimeout(r, 300));

      const intentLabels: Record<string, string> = {
        slack: "Slack",
        sheets: "Google Sheets",
        email: "Email",
        crm: "CRM",
        schedule: "Scheduler",
      };
      const completedIntents = detectedIntents
        .map((i) => intentLabels[i] || i)
        .join(", ");

      const aiResponse = hasError
        ? `Partial execution for "${command}". Most steps completed${completedIntents ? ` (${completedIntents})` : ""}, but one step encountered an error. Check your credentials in Settings.`
        : `Automation complete for "${command}"${completedIntents ? ` — executed: **${completedIntents}**` : ""}. All steps ran successfully. ✓`;

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
        taskName: command.slice(0, 40),
        commandText: command,
        success: !hasError,
      });

      if (hasError) {
        toast.error("One step failed — check your integration settings.");
      } else {
        toast.success("Automation completed successfully!", {
          description: completedIntents || undefined,
        });
      }

      // Auto-agent creation: check for repeated commands
      if (taskHistory && !autoCreatedAgents.current.has(command)) {
        const sameCommands = taskHistory.filter(
          (t) => t.commandText === command,
        );
        if (sameCommands.length >= 2) {
          autoCreatedAgents.current.add(command);
          const agentName = `Auto: ${command.slice(0, 30)}`;
          const agentId = BigInt(Date.now() + 1);
          addSavedAgent.mutate({ id: agentId, name: agentName, command });
          toast.info(`Agent "${agentName}" auto-created from repeated task`, {
            duration: 5000,
          });
        }
      }

      // Smart suggestions based on recent patterns
      const recentCommands = (taskHistory || [])
        .slice(-3)
        .map((t) => t.commandText);
      const contextSuggestions = SUGGESTIONS_POOL.filter(
        (s) =>
          !recentCommands.some((r) =>
            r.toLowerCase().includes(s.toLowerCase().slice(0, 10)),
          ),
      );
      const shuffled = [...contextSuggestions].sort(() => Math.random() - 0.5);
      setSuggestions(shuffled.slice(0, 3));
      setIsProcessing(false);
    },
    [isProcessing, addTaskHistory, addExecutionLog, addSavedAgent, taskHistory],
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
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <Header theme={theme} onToggleTheme={toggleTheme} />
      <main
        className="flex-1 flex gap-4 p-4 overflow-hidden relative z-10"
        style={{ height: "calc(100vh - 64px)" }}
      >
        <div className="w-72 flex-shrink-0 h-full">
          <Sidebar onRerun={handleRerun} />
        </div>
        <div className="flex-1 min-w-0 h-full">
          <ChatBox
            messages={messages}
            isProcessing={isProcessing}
            workflowSteps={workflowSteps}
            suggestions={suggestions}
            onSendCommand={runCommand}
            onSuggestionClick={runCommand}
          />
        </div>
        <div className="w-72 flex-shrink-0 h-full">
          <LogsPanel />
        </div>
      </main>
      <Toaster position="top-right" richColors closeButton />
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
