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
  { label: string; icon: typeof Check; pill: string; dot: string }
> = {
  Proposed: {
    label: "Proposed",
    icon: CircleDashed,
    pill: "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30",
    dot: "bg-amber-500",
  },
  Approved: {
    label: "Approved",
    icon: Check,
    pill: "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30",
    dot: "",
  },
  Reverted: {
    label: "Reverted",
    icon: Undo2,
    pill: "bg-slate-100 text-slate-500 border-slate-200 dark:bg-muted dark:text-muted-foreground dark:border-border line-through decoration-1",
    dot: "bg-slate-400",
  },
};

export function StatusBadge({ status }: { status: DecisionStatus }) {
  const cfg = CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-tight",
        cfg.pill,
      )}
    >
      {status === "Approved" ? (
        <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
      ) : (
        <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
      )}
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
        <button
          type="button"
          className="outline-none transition-opacity hover:opacity-80"
        >
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
