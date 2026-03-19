import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  Bot,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Eye,
  EyeOff,
  History,
  Key,
  Loader2,
  Plus,
  RotateCcw,
  Settings,
  Trash2,
  XCircle,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

import type { TaskHistoryEntry } from "../backend.d";
import {
  useAddCredential,
  useAddSavedAgent,
  useAddScheduledTask,
  useClearTaskHistory,
  useDeleteCredential,
  useDeleteSavedAgent,
  useDeleteScheduledTask,
  useDeleteTaskById,
  useGetAnalyticsSummary,
  useGetCredentials,
  useGetSavedAgents,
  useGetScheduledTasks,
  useGetSettings,
  useGetTaskHistory,
  useUpdateScheduledTask,
  useUpdateSettings,
} from "../hooks/useQueries";

interface SidebarProps {
  onRerun: (command: string) => void;
}

function relativeTime(nsTimestamp: bigint): string {
  const ms = Number(nsTimestamp / 1_000_000n);
  const diff = Date.now() - ms;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

const SAMPLE_TASKS: TaskHistoryEntry[] = [
  {
    taskId: 1n,
    taskName: "Send Q3 report",
    commandText: "Send Q3 report to Slack #general",
    success: true,
    timestamp: BigInt(Date.now() - 5 * 60_000) * 1_000_000n,
  },
  {
    taskId: 2n,
    taskName: "Update spreadsheet",
    commandText: "Update team spreadsheet with new entries",
    success: true,
    timestamp: BigInt(Date.now() - 23 * 60_000) * 1_000_000n,
  },
  {
    taskId: 3n,
    taskName: "Notify devops",
    commandText: "Notify #devops and log deployment status",
    success: false,
    timestamp: BigInt(Date.now() - 65 * 60_000) * 1_000_000n,
  },
  {
    taskId: 4n,
    taskName: "Sync CRM",
    commandText: "Sync CRM contacts to Google Sheets",
    success: true,
    timestamp: BigInt(Date.now() - 2 * 3_600_000) * 1_000_000n,
  },
];

const TABS = [
  { id: "history" as const, icon: History, label: "History" },
  { id: "agents" as const, icon: Bot, label: "Agents" },
  { id: "schedule" as const, icon: Calendar, label: "Schedule" },
  { id: "analytics" as const, icon: BarChart3, label: "Analytics" },
  { id: "settings" as const, icon: Settings, label: "Settings" },
];

type SidebarTab = "history" | "agents" | "schedule" | "analytics" | "settings";

export default function Sidebar({ onRerun }: SidebarProps) {
  const [tab, setTab] = useState<SidebarTab>("history");

  return (
    <div className="glass-card h-full flex flex-col overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-border/50 flex-shrink-0">
        {TABS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[9px] font-semibold uppercase tracking-wide transition-all ${
              tab === id
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden">
        {tab === "history" && <HistoryPanel onRerun={onRerun} />}
        {tab === "agents" && <AgentsPanel onRerun={onRerun} />}
        {tab === "schedule" && <SchedulePanel />}
        {tab === "analytics" && <AnalyticsPanel />}
        {tab === "settings" && <SettingsPanel />}
      </div>

      <footer className="flex-shrink-0 px-4 py-2.5 border-t border-border/50 text-center">
        <p className="text-[10px] text-muted-foreground">
          © {new Date().getFullYear()}{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            Built with ❤️ caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}

// ─── History Panel ───────────────────────────────────────────────────────────
function HistoryPanel({ onRerun }: { onRerun: (cmd: string) => void }) {
  const { data: tasks } = useGetTaskHistory();
  const clearHistory = useClearTaskHistory();
  const deleteTask = useDeleteTaskById();
  const displayTasks = tasks && tasks.length > 0 ? tasks : SAMPLE_TASKS;

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full">
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
        <h3 className="text-xs font-semibold text-foreground">Task History</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => clearHistory.mutate()}
          className="h-6 px-2 text-[10px] text-muted-foreground hover:text-destructive"
        >
          Clear all
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1.5">
        <AnimatePresence>
          {displayTasks.map((task, i) => (
            <motion.div
              key={String(task.taskId)}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ delay: i * 0.04 }}
              className="group flex items-start gap-2 p-2.5 rounded-xl bg-muted/40 border border-border/50 hover:border-primary/30 transition-all cursor-pointer"
              onClick={() => onRerun(task.commandText)}
            >
              <div
                className={`mt-0.5 flex-shrink-0 ${task.success ? "text-success" : "text-destructive"}`}
              >
                {task.success ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <XCircle className="w-3.5 h-3.5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">
                  {task.commandText}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Clock className="w-2.5 h-2.5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">
                    {relativeTime(task.timestamp)}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[9px] px-1 py-0 h-3.5 ${
                      task.success
                        ? "border-success/30 text-success"
                        : "border-destructive/30 text-destructive"
                    }`}
                  >
                    {task.success ? "Done" : "Failed"}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTask.mutate(task.taskId);
                  }}
                  className="p-1 rounded hover:bg-destructive/15 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRerun(task.commandText);
                  }}
                  className="p-1 rounded hover:bg-primary/15 text-muted-foreground hover:text-primary transition-colors"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Agents Panel ─────────────────────────────────────────────────────────────
function AgentsPanel({ onRerun }: { onRerun: (cmd: string) => void }) {
  const { data: agents } = useGetSavedAgents();
  const { data: tasks } = useGetTaskHistory();
  const addAgent = useAddSavedAgent();
  const deleteAgent = useDeleteSavedAgent();

  const suggestAgents = () => {
    if (!tasks || tasks.length < 2) {
      toast.info("Run more tasks to auto-detect agents.");
      return;
    }
    const counts: Record<string, number> = {};
    for (const t of tasks)
      counts[t.commandText] = (counts[t.commandText] || 0) + 1;
    const repeated = Object.entries(counts).filter(([, n]) => n >= 2);
    if (repeated.length === 0) {
      toast.info("No repeated commands found yet.");
      return;
    }
    for (const [cmd] of repeated) {
      const exists = agents?.some((a) => a.command === cmd);
      if (!exists) {
        addAgent.mutate({
          id: BigInt(Date.now()),
          name: `Auto: ${cmd.slice(0, 28)}`,
          command: cmd,
        });
      }
    }
    toast.success(`${repeated.length} agent(s) detected and saved!`);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full">
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
        <h3 className="text-xs font-semibold text-foreground">Saved Agents</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={suggestAgents}
          className="h-6 px-2 text-[10px] rounded-lg"
        >
          Auto-detect
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1.5">
        {!agents || agents.length === 0 ? (
          <div className="text-center py-8">
            <Bot className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-xs text-muted-foreground">No agents yet.</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              Run repeated tasks to auto-create agents.
            </p>
          </div>
        ) : (
          agents.map((agent, i) => (
            <motion.div
              key={String(agent.id)}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group p-2.5 rounded-xl bg-muted/40 border border-border/50 hover:border-primary/30 transition-all"
            >
              <div className="flex items-start justify-between gap-1">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Bot className="w-3 h-3 text-primary flex-shrink-0" />
                    <p className="text-xs font-semibold text-foreground truncate">
                      {agent.name}
                    </p>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                    {agent.command}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Runs: {String(agent.triggerCount)}
                  </p>
                </div>
                <div className="flex gap-0.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => onRerun(agent.command)}
                    className="p-1 rounded hover:bg-primary/15 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteAgent.mutate(agent.id)}
                    className="p-1 rounded hover:bg-destructive/15 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Schedule Panel ───────────────────────────────────────────────────────────
function SchedulePanel() {
  const { data: tasks } = useGetScheduledTasks();
  const addTask = useAddScheduledTask();
  const deleteTask = useDeleteScheduledTask();
  const updateTask = useUpdateScheduledTask();
  const [name, setName] = useState("");
  const [command, setCommand] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly">("daily");
  const [showForm, setShowForm] = useState(false);

  const handleAdd = () => {
    if (!name.trim() || !command.trim()) return;
    addTask.mutate({
      id: BigInt(Date.now()),
      name: name.trim(),
      command: command.trim(),
      frequency,
      nextRun: BigInt(Date.now() + 86_400_000) * 1_000_000n,
    });
    setName("");
    setCommand("");
    setShowForm(false);
    toast.success(`Schedule "${name}" created!`);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full">
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
        <h3 className="text-xs font-semibold text-foreground">Scheduler</h3>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="w-5 h-5 rounded-md bg-primary/20 text-primary hover:bg-primary/30 transition-colors flex items-center justify-center"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-3 mb-3 p-3 rounded-xl bg-muted/40 border border-border/50 space-y-2"
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Schedule name"
            className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-muted/60 border border-border focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <input
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Command to run"
            className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-muted/60 border border-border focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <div className="flex gap-1">
            {(["daily", "weekly"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFrequency(f)}
                className={`flex-1 py-1 text-[10px] font-semibold rounded-lg border transition-all ${
                  frequency === f
                    ? "bg-primary/20 border-primary/40 text-primary"
                    : "bg-muted/40 border-border text-muted-foreground"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <Button
            onClick={handleAdd}
            disabled={addTask.isPending}
            size="sm"
            className="w-full rounded-lg text-xs h-7"
          >
            {addTask.isPending ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              "Add Schedule"
            )}
          </Button>
        </motion.div>
      )}

      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1.5">
        {!tasks || tasks.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-xs text-muted-foreground">No schedules yet.</p>
          </div>
        ) : (
          tasks.map((task, i) => (
            <motion.div
              key={String(task.id)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.04 }}
              className="p-2.5 rounded-xl bg-muted/40 border border-border/50 transition-all"
            >
              <div className="flex items-start justify-between gap-1">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {task.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {task.command}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Badge
                      variant="outline"
                      className="text-[9px] px-1 py-0 h-3.5"
                    >
                      {task.frequency}
                    </Badge>
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${task.enabled ? "bg-success" : "bg-muted-foreground"}`}
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {task.enabled ? "Active" : "Paused"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-0.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      updateTask.mutate({
                        id: task.id,
                        updatedTask: { ...task, enabled: !task.enabled },
                      })
                    }
                    className="p-1 rounded hover:bg-primary/15 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Zap className="w-2.5 h-2.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteTask.mutate(task.id)}
                    className="p-1 rounded hover:bg-destructive/15 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Analytics Panel ──────────────────────────────────────────────────────────
function AnalyticsPanel() {
  const { data: analytics, isLoading } = useGetAnalyticsSummary();
  const { data: tasks } = useGetTaskHistory();
  const displayTasks = tasks && tasks.length > 0 ? tasks : SAMPLE_TASKS;

  const total = analytics ? Number(analytics.totalTasks) : displayTasks.length;
  const success = analytics
    ? Number(analytics.successCount)
    : displayTasks.filter((t) => t.success).length;
  const failure = analytics
    ? Number(analytics.failureCount)
    : displayTasks.filter((t) => !t.success).length;
  const rate = total > 0 ? Math.round((success / total) * 100) : 0;
  const mostUsed =
    analytics?.mostUsedCommands ??
    displayTasks.slice(0, 3).map((t) => t.commandText);

  return (
    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
      <h3 className="text-xs font-semibold text-foreground px-1">Analytics</h3>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2">
            {[
              {
                label: "Total",
                value: total,
                color: "text-primary",
                bg: "bg-primary/10",
              },
              {
                label: "Success",
                value: success,
                color: "text-success",
                bg: "bg-success/10",
              },
              {
                label: "Failed",
                value: failure,
                color: "text-destructive",
                bg: "bg-destructive/10",
              },
              {
                label: "Rate",
                value: `${rate}%`,
                color: "text-warning",
                bg: "bg-warning/10",
              },
            ].map(({ label, value, color, bg }) => (
              <div
                key={label}
                className={`p-2.5 rounded-xl ${bg} border border-border/50 text-center`}
              >
                <p className={`text-base font-bold font-display ${color}`}>
                  {value}
                </p>
                <p className="text-[10px] text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Success Rate
            </p>
            <Progress value={rate} className="h-2" />
            <p className="text-[10px] text-muted-foreground mt-1">
              {rate}% of tasks completed successfully
            </p>
          </div>

          {mostUsed.length > 0 && (
            <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Recent Tasks
              </p>
              <div className="space-y-1.5">
                {mostUsed.slice(0, 4).map((cmd) => (
                  <div key={cmd} className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                    <p className="text-[10px] text-foreground truncate">
                      {cmd}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Settings Panel ───────────────────────────────────────────────────────────
function SettingsPanel() {
  const { data: settings } = useGetSettings();
  const updateSettings = useUpdateSettings();
  const { data: credentials } = useGetCredentials();
  const addCredential = useAddCredential();
  const deleteCredential = useDeleteCredential();

  const [slackUrl, setSlackUrl] = useState(settings?.slackWebhookUrl ?? "");
  const [sheetsId, setSheetsId] = useState(settings?.googleSheetsId ?? "");
  const [tabName, setTabName] = useState(settings?.sheetTabName ?? "");
  const [credName, setCredName] = useState("");
  const [credService, setCredService] = useState("");
  const [credValue, setCredValue] = useState("");
  const [revealedCreds, setRevealedCreds] = useState<Set<string>>(new Set());

  const handleSave = () => {
    updateSettings.mutate({
      slackWebhookUrl: slackUrl,
      googleSheetsId: sheetsId,
      sheetTabName: tabName,
    });
    toast.success("Settings saved!");
  };

  const handleAddCred = () => {
    if (!credName.trim() || !credValue.trim()) return;
    addCredential.mutate({
      name: credName.trim(),
      value: credValue.trim(),
      service: credService.trim() || "general",
    });
    setCredName("");
    setCredService("");
    setCredValue("");
    toast.success(`Credential "${credName}" saved.`);
  };

  const toggleReveal = (name: string) => {
    setRevealedCreds((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const INPUT_CLS =
    "w-full px-2.5 py-1.5 text-xs rounded-lg bg-muted/60 border border-border focus:outline-none focus:ring-1 focus:ring-ring";

  return (
    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
      {/* Integrations */}
      <div>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Integrations
        </p>
        <div className="space-y-2">
          {[
            {
              label: "Slack Webhook URL",
              value: slackUrl,
              setter: setSlackUrl,
              placeholder: "https://hooks.slack.com/...",
              type: "url",
            },
            {
              label: "Google Sheets ID",
              value: sheetsId,
              setter: setSheetsId,
              placeholder: "1BxiMVs0XRA5...",
              type: "text",
            },
            {
              label: "Sheet Tab Name",
              value: tabName,
              setter: setTabName,
              placeholder: "Sheet1",
              type: "text",
            },
          ].map(({ label, value, setter, placeholder, type }) => {
            const inputId = `settings-${label.toLowerCase().replace(/\s+/g, "-")}`;
            return (
              <div key={label}>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor={inputId}
                    className="text-[10px] font-semibold text-muted-foreground"
                  >
                    {label}
                  </label>
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${value ? "bg-success" : "bg-muted-foreground"}`}
                  />
                </div>
                <input
                  id={inputId}
                  type={type}
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  placeholder={placeholder}
                  className={INPUT_CLS}
                />
              </div>
            );
          })}
          <Button
            onClick={handleSave}
            disabled={updateSettings.isPending}
            size="sm"
            className="w-full rounded-xl text-xs h-7"
          >
            {updateSettings.isPending ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              "Save Settings"
            )}
          </Button>
        </div>
      </div>

      {/* Credentials */}
      <div>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Credentials
        </p>
        <div className="space-y-2">
          {!credentials || credentials.length === 0 ? (
            <div className="text-center py-4">
              <Key className="w-6 h-6 mx-auto text-muted-foreground/40 mb-1" />
              <p className="text-[10px] text-muted-foreground">
                No credentials stored.
              </p>
            </div>
          ) : (
            credentials.map((cred) => (
              <div
                key={cred.name}
                className="flex items-center gap-2 p-2 rounded-lg bg-muted/40 border border-border/50"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground">
                    {cred.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {cred.service}
                  </p>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {revealedCreds.has(cred.name) ? cred.value : "••••••"}
                </span>
                <button
                  type="button"
                  onClick={() => toggleReveal(cred.name)}
                  className="p-1 text-muted-foreground hover:text-primary transition-colors"
                >
                  {revealedCreds.has(cred.name) ? (
                    <EyeOff className="w-3 h-3" />
                  ) : (
                    <Eye className="w-3 h-3" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => deleteCredential.mutate(cred.name)}
                  className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))
          )}

          <div className="space-y-1.5 p-2.5 rounded-xl bg-muted/30 border border-border/50">
            <p className="text-[10px] font-semibold text-muted-foreground">
              Add Credential
            </p>
            <input
              value={credName}
              onChange={(e) => setCredName(e.target.value)}
              placeholder="Name (e.g. OPENAI_KEY)"
              className={INPUT_CLS}
            />
            <input
              value={credService}
              onChange={(e) => setCredService(e.target.value)}
              placeholder="Service (e.g. OpenAI)"
              className={INPUT_CLS}
            />
            <input
              type="password"
              value={credValue}
              onChange={(e) => setCredValue(e.target.value)}
              placeholder="Value"
              className={INPUT_CLS}
            />
            <Button
              onClick={handleAddCred}
              disabled={addCredential.isPending}
              size="sm"
              className="w-full rounded-lg text-xs h-7"
            >
              {addCredential.isPending ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <>
                  <Plus className="w-3 h-3 mr-1" />
                  Add
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
