import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ActionPriority } from "@/lib/action-items/store";

const STYLES: Record<ActionPriority, string> = {
  High: "bg-destructive/10 text-destructive border-destructive/20",
  Medium: "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400",
  Low: "bg-muted text-muted-foreground border-border",
};

export function PriorityBadge({
  priority,
  className,
}: {
  priority: ActionPriority;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium text-[11px] py-0 px-1.5", STYLES[priority], className)}
    >
      {priority}
    </Badge>
  );
}
