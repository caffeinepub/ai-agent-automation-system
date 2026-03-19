import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Bot,
  CheckCircle2,
  Cpu,
  Grid3x3,
  Loader2,
  Sparkles,
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
    stepName: "Initiating Data Fetch (Salesforce)",
    status: "success",
    iconType: "system",
    timestamp: BigInt(Date.now() - 3 * 60_000) * 1_000_000n,
  },
  {
    stepName: "Querying Sales Data (Q3)",
    status: "success",
    iconType: "sheets",
    timestamp: BigInt(Date.now() - 2 * 60_000) * 1_000_000n,
  },
  {
    stepName: "Processing 1,250 records",
    status: "success",
    iconType: "ai",
    timestamp: BigInt(Date.now() - 90_000) * 1_000_000n,
  },
  {
    stepName: "Analyzing trends & generating report",
    status: "success",
    iconType: "ai",
    timestamp: BigInt(Date.now() - 60_000) * 1_000_000n,
  },
  {
    stepName: "Posting to Slack #reports",
    status: "success",
    iconType: "slack",
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

  return (
    <div className="nexus-card h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border flex-shrink-0">
        <h2 className="text-sm font-semibold text-foreground">
          Execution Logs
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => clearLogs.mutate()}
          className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
          data-ocid="logs.clear.delete_button"
        >
          Clear
        </Button>
      </div>

      {/* Active execution */}
      {activeLog && (
        <div className="mx-3 mt-3 p-3 rounded-xl bg-primary/10 border border-primary/20 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-xs font-semibold text-primary truncate">
              {activeLog.stepName}
            </span>
            <span className="ml-auto text-[10px] text-primary/70 bg-primary/15 px-1.5 py-0.5 rounded-full whitespace-nowrap">
              Active
            </span>
          </div>
          <Progress value={75} className="mt-2 h-1" />
        </div>
      )}

      {/* Subheader */}
      <div className="px-4 pt-3 pb-1 flex-shrink-0">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
          Current Execution Logs
        </p>
      </div>

      {/* Log list */}
      <div
        className="flex-1 overflow-y-auto mx-3 mb-3 rounded-xl border border-border p-2 space-y-1 min-h-0"
        style={{ background: "oklch(var(--nexus-inner))" }}
        data-ocid="logs.list"
      >
        {displayLogs.length === 0 ? (
          <p
            className="text-center text-muted-foreground text-xs py-8"
            data-ocid="logs.empty_state"
          >
            No logs yet
          </p>
        ) : (
          <AnimatePresence initial={false}>
            {displayLogs.map((log, i) => (
              <motion.div
                key={`${String(log.timestamp)}-${i}`}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                data-ocid={`logs.item.${i + 1}`}
                className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-muted/40 transition-colors group"
              >
                {/* Timestamp */}
                <span className="text-[10px] text-muted-foreground font-mono w-16 flex-shrink-0">
                  {formatLogTime(log.timestamp)}
                </span>

                {/* Icon */}
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${getIconBg(log.iconType)}`}
                >
                  {getIcon(log.iconType)}
                </div>

                {/* Step name */}
                <span className="text-xs text-foreground flex-1 truncate">
                  {log.stepName}
                </span>

                {/* Status */}
                <div className="flex-shrink-0">
                  {log.status === "success" ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                  ) : log.status === "error" ? (
                    <XCircle className="w-3.5 h-3.5 text-destructive" />
                  ) : (
                    <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
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
