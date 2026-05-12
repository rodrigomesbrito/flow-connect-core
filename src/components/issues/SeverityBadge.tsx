import { cn } from "@/lib/utils";
import type { IssueSeverity } from "@/lib/issues/store";

const CONFIG: Record<
  IssueSeverity,
  { label: string; dot: string; text: string }
> = {
  Critical: {
    label: "Critical",
    dot: "bg-rose-500",
    text: "text-rose-700 dark:text-rose-400 font-semibold",
  },
  High: {
    label: "High",
    dot: "bg-orange-500",
    text: "text-foreground",
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

export function SeverityBadge({
  severity,
  showIcon: _showIcon = false,
}: {
  severity: IssueSeverity;
  showIcon?: boolean;
}) {
  const cfg = CONFIG[severity];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span className={cn("h-2 w-2 rounded-full shrink-0", cfg.dot)} />
      <span className={cn(cfg.text)}>{cfg.label}</span>
    </span>
  );
}
