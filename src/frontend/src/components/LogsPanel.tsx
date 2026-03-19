import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Bot,
  CheckCircle2,
  Cpu,
  Grid3x3,
  Loader2,
  Mail,
  Sparkles,
  Users,
  XCircle,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { ExecutionLogEntry } from "../backend.d";
import {
  useClearExecutionLogs,
  useGetExecutionLogs,
} from "../hooks/useQueries";

const SAMPLE_LOGS: ExecutionLogEntry[] = [
  {
    stepName: "AI Parsing Command",
    status: "success",
    iconType: "ai",
    timestamp: BigInt(Date.now() - 4 * 60_000) * 1_000_000n,
  },
  {
    stepName: "Intent Detection: Slack + Sheets",
    status: "success",
    iconType: "system",
    timestamp: BigInt(Date.now() - 3 * 60_000) * 1_000_000n,
  },
  {
    stepName: "Sending Slack Message",
    status: "success",
    iconType: "slack",
    timestamp: BigInt(Date.now() - 2 * 60_000) * 1_000_000n,
  },
  {
    stepName: "Updating Google Sheets row",
    status: "success",
    iconType: "sheets",
    timestamp: BigInt(Date.now() - 90_000) * 1_000_000n,
  },
  {
    stepName: "Logging execution results",
    status: "success",
    iconType: "ai",
    timestamp: BigInt(Date.now() - 30_000) * 1_000_000n,
  },
];

function getIcon(iconType: string) {
  switch (iconType) {
    case "slack":
      return <Zap className="w-3.5 h-3.5" />;
    case "sheets":
      return <Grid3x3 className="w-3.5 h-3.5" />;
    case "ai":
      return <Bot className="w-3.5 h-3.5" />;
    case "email":
      return <Mail className="w-3.5 h-3.5" />;
    case "crm":
      return <Users className="w-3.5 h-3.5" />;
    default:
      return <Cpu className="w-3.5 h-3.5" />;
  }
}

function getIconBg(iconType: string) {
  switch (iconType) {
    case "slack":
      return "bg-warning/15 text-warning";
    case "sheets":
      return "bg-success/15 text-success";
    case "ai":
      return "bg-primary/15 text-primary";
    case "email":
      return "bg-blue-400/15 text-blue-400";
    case "crm":
      return "bg-orange-400/15 text-orange-400";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function formatLogTime(ns: bigint): string {
  const date = new Date(Number(ns / 1_000_000n));
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export default function LogsPanel() {
  const { data: logs } = useGetExecutionLogs();
  const clearLogs = useClearExecutionLogs();

  const displayLogs =
    logs && logs.length > 0 ? [...logs].reverse() : SAMPLE_LOGS;
  const activeLog = displayLogs[0];
  const runningLogs = displayLogs.filter((l) => l.status === "running");

  return (
    <div className="glass-card h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/50 flex-shrink-0">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Execution Logs
          </h2>
          <p className="text-[10px] text-muted-foreground">
            {displayLogs.length} entries
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => clearLogs.mutate()}
          className="h-6 px-2 text-[10px] text-muted-foreground hover:text-destructive"
        >
          Clear
        </Button>
      </div>

      {activeLog && (
        <div className="mx-3 mt-3 p-2.5 rounded-xl bg-primary/8 border border-primary/20 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            <span className="text-xs font-medium text-primary truncate">
              {activeLog.stepName}
            </span>
            <span className="ml-auto text-[9px] text-primary/70 bg-primary/10 px-1.5 py-0.5 rounded-full whitespace-nowrap">
              {runningLogs.length > 0 ? "Running" : "Latest"}
            </span>
          </div>
          <Progress
            value={runningLogs.length > 0 ? 60 : 100}
            className="mt-2 h-1"
          />
        </div>
      )}

      <div className="px-4 pt-2.5 pb-1 flex-shrink-0">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
          Step Log
        </p>
      </div>

      <div
        className="flex-1 overflow-y-auto mx-3 mb-3 rounded-xl border border-border/50 p-2 space-y-1 min-h-0"
        style={{ background: "oklch(var(--nexus-inner))" }}
      >
        {displayLogs.length === 0 ? (
          <p className="text-center text-muted-foreground text-xs py-8">
            No logs yet
          </p>
        ) : (
          <AnimatePresence initial={false}>
            {displayLogs.map((log, i) => (
              <motion.div
                key={`${String(log.timestamp)}-${i}`}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/40 transition-colors"
              >
                <span className="text-[9px] text-muted-foreground font-mono-code w-14 flex-shrink-0">
                  {formatLogTime(log.timestamp)}
                </span>
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${getIconBg(log.iconType)}`}
                >
                  {getIcon(log.iconType)}
                </div>
                <span className="text-[11px] text-foreground flex-1 truncate">
                  {log.stepName}
                </span>
                <div className="flex-shrink-0">
                  {log.status === "success" ? (
                    <CheckCircle2 className="w-3 h-3 text-success" />
                  ) : log.status === "error" ? (
                    <XCircle className="w-3 h-3 text-destructive" />
                  ) : (
                    <Loader2 className="w-3 h-3 text-primary animate-spin" />
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
