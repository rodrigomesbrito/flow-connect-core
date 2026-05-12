import { CheckSquare, Gavel, AlertTriangle, X, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GeneratedItem } from "@/lib/meetings/store";

const meta = {
  action: {
    icon: CheckSquare,
    border: "border-primary/30",
    bg: "bg-primary/5",
    text: "text-primary",
  },
  issue: {
    icon: AlertTriangle,
    border: "border-destructive/30",
    bg: "bg-destructive/5",
    text: "text-destructive",
  },
  decision: {
    icon: Gavel,
    border: "border-success/30",
    bg: "bg-success/5",
    text: "text-success",
  },
} as const;

export function ItemCard({
  item,
  onRemove,
  readOnly,
}: {
  item: GeneratedItem;
  onRemove?: () => void;
  readOnly?: boolean;
}) {
  const m = meta[item.kind];
  const Icon = m.icon;

  return (
    <div
      className={cn(
        "group relative rounded-lg border p-2.5 pr-7 transition-colors",
        m.border,
        m.bg,
      )}
    >
      <div className="flex items-start gap-2">
        <Icon className={cn("size-3.5 mt-0.5 shrink-0", m.text)} />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] leading-snug text-foreground break-words">
            {item.text}
          </p>
          <div className="flex items-center gap-2 mt-1.5 text-[11px] text-muted-foreground">
            {item.kind === "action" && (
              <span className="inline-flex items-center gap-1">
                <User className="size-3" />
                {item.assignee ?? <span className="italic">Unassigned</span>}
              </span>
            )}
            <span className="opacity-70">L{item.sourceLine}</span>
          </div>
        </div>
      </div>
      {!readOnly && onRemove && (
        <button
          onClick={onRemove}
          className="absolute right-1.5 top-1.5 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-background"
          aria-label="Remove item"
        >
          <X className="size-3.5 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}
