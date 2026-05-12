import { Check, CircleDashed, Undo2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { DecisionStatus } from "@/lib/decisions/store";

const CONFIG: Record<
  DecisionStatus,
  { label: string; icon: typeof Check; className: string }
> = {
  Proposed: {
    label: "Proposed",
    icon: CircleDashed,
    className:
      "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
  },
  Approved: {
    label: "Approved",
    icon: Check,
    className:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  },
  Reverted: {
    label: "Reverted",
    icon: Undo2,
    className:
      "bg-muted text-muted-foreground border-border line-through decoration-1",
  },
};

export function StatusBadge({ status }: { status: DecisionStatus }) {
  const cfg = CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        cfg.className,
      )}
    >
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

export function DecisionStatusMenu({
  value,
  onChange,
}: {
  value: DecisionStatus;
  onChange: (next: DecisionStatus) => void;
}) {
  const ALL: DecisionStatus[] = ["Proposed", "Approved", "Reverted"];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="outline-none">
          <StatusBadge status={value} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {ALL.map((s) => {
          const Icon = CONFIG[s].icon;
          return (
            <DropdownMenuItem
              key={s}
              onClick={() => onChange(s)}
              className="text-xs"
            >
              <Icon className="mr-2 h-3.5 w-3.5" />
              {CONFIG[s].label}
              {value === s && (
                <Check className="ml-auto h-3.5 w-3.5 opacity-60" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
