import { cn } from "@/lib/utils";
import type { ActionPriority } from "@/lib/action-items/store";

const CONFIG: Record<
  ActionPriority,
  { label: string; dot: string; text: string }
> = {
  High: {
    label: "High",
    dot: "bg-rose-500",
    text: "text-foreground font-medium",
  },
  Medium: {
    label: "Medium",
    dot: "bg-amber-400",
    text: "text-foreground",
  },
  Low: {
    label: "Low",
    dot: "bg-slate-300 dark:bg-slate-600",
    text: "text-muted-foreground",
  },
};

export function PriorityBadge({
  priority,
  className,
}: {
  priority: ActionPriority;
  className?: string;
}) {
  const cfg = CONFIG[priority];
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 text-xs", className)}
    >
      <span className={cn("h-2 w-2 rounded-full shrink-0", cfg.dot)} />
      <span className={cfg.text}>{cfg.label}</span>
    </span>
  );
}
