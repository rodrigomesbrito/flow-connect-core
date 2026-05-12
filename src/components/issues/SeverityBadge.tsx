import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IssueSeverity } from "@/lib/issues/store";

const CONFIG: Record<
  IssueSeverity,
  { label: string; className: string }
> = {
  Critical: {
    label: "Critical",
    className:
      "bg-destructive/15 text-destructive border-destructive/40 font-semibold",
  },
  High: {
    label: "High",
    className:
      "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/40",
  },
  Medium: {
    label: "Medium",
    className:
      "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
  },
  Low: {
    label: "Low",
    className: "bg-muted text-muted-foreground border-border",
  },
};

export function SeverityBadge({
  severity,
  showIcon = false,
}: {
  severity: IssueSeverity;
  showIcon?: boolean;
}) {
  const cfg = CONFIG[severity];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]",
        cfg.className,
      )}
    >
      {showIcon && severity === "Critical" && <AlertTriangle className="h-3 w-3" />}
      {cfg.label}
    </span>
  );
}
