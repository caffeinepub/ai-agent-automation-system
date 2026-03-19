import {
  Bot,
  CheckCircle2,
  Cpu,
  Grid3x3,
  Loader2,
  Mail,
  Users,
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
    case "email":
      return <Mail className="w-3.5 h-3.5" />;
    case "crm":
      return <Users className="w-3.5 h-3.5" />;
    default:
      return <Cpu className="w-3.5 h-3.5" />;
  }
}

const parallelSteps = (steps: WorkflowStep[]) => {
  const parallelGroup = steps.filter((s) => s.parallel);
  const sequential = steps.filter((s) => !s.parallel);
  return { parallelGroup, sequential };
};

function StepItem({ step, index }: { step: WorkflowStep; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.06, duration: 0.2 }}
      className="flex items-center gap-2.5"
    >
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold transition-all ${
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
          <span>{index + 1}</span>
        )}
      </div>
      <div
        className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${
          step.status === "pending" ? "text-muted-foreground" : "text-primary"
        }`}
      >
        {getIcon(step.iconType)}
      </div>
      <span
        className={`text-xs flex-1 ${
          step.status === "pending"
            ? "text-muted-foreground"
            : "text-foreground font-medium"
        }`}
      >
        {step.name}
      </span>
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
  );
}

export default function WorkflowSteps({ steps }: { steps: WorkflowStep[] }) {
  const { parallelGroup, sequential } = parallelSteps(steps);
  const hasParallel = parallelGroup.length > 1;

  return (
    <div className="nexus-inner p-3 space-y-2">
      <div className="flex items-center gap-2 mb-2">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
          Workflow Progress
        </p>
        {hasParallel && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20">
            ⚡ Parallel
          </span>
        )}
      </div>

      {sequential.map((step, i) => (
        <StepItem key={step.id} step={step} index={i} />
      ))}

      {hasParallel && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="ml-2 pl-3 border-l-2 border-primary/30 space-y-2"
        >
          <p className="text-[10px] text-primary/70 font-semibold uppercase tracking-wide">
            Running in parallel
          </p>
          {parallelGroup.map((step, i) => (
            <StepItem key={step.id} step={step} index={sequential.length + i} />
          ))}
        </motion.div>
      )}

      {!hasParallel &&
        steps
          .filter((s) => s.parallel)
          .map((step, i) => (
            <StepItem key={step.id} step={step} index={sequential.length + i} />
          ))}
    </div>
  );
}
