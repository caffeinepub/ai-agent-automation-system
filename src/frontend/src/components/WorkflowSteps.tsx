import {
  Bot,
  CheckCircle2,
  Cpu,
  Grid3x3,
  Loader2,
  XCircle,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import type { WorkflowStep } from "../App";

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

export default function WorkflowSteps({ steps }: { steps: WorkflowStep[] }) {
  return (
    <div className="nexus-inner p-3 space-y-2">
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
        Workflow Progress
      </p>
      {steps.map((step, i) => (
        <motion.div
          key={step.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.08, duration: 0.2 }}
          className="flex items-center gap-3"
        >
          {/* Step number / icon */}
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold transition-colors ${
              step.status === "success"
                ? "bg-success/20 text-success"
                : step.status === "error"
                  ? "bg-destructive/20 text-destructive"
                  : step.status === "running"
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
            }`}
          >
            {step.status === "success" ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : step.status === "error" ? (
              <XCircle className="w-3.5 h-3.5" />
            ) : step.status === "running" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <span>{i + 1}</span>
            )}
          </div>

          {/* Icon */}
          <div
            className={`w-5 h-5 rounded flex items-center justify-center ${
              step.status === "pending"
                ? "text-muted-foreground"
                : "text-primary"
            }`}
          >
            {getIcon(step.iconType)}
          </div>

          {/* Name */}
          <span
            className={`text-xs flex-1 ${
              step.status === "pending"
                ? "text-muted-foreground"
                : "text-foreground"
            }`}
          >
            {step.name}
          </span>

          {/* Status badge */}
          {step.status !== "pending" && (
            <span
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                step.status === "success"
                  ? "bg-success/15 text-success"
                  : step.status === "error"
                    ? "bg-destructive/15 text-destructive"
                    : "bg-primary/15 text-primary"
              }`}
            >
              {step.status === "running"
                ? "Running"
                : step.status === "success"
                  ? "Done"
                  : "Error"}
            </span>
          )}
        </motion.div>
      ))}
    </div>
  );
}
