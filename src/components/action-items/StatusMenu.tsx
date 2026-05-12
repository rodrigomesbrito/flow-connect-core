import { Check, CircleDashed, Loader2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { ActionStatus } from "@/lib/action-items/store";

const OPTIONS: { value: ActionStatus; label: string; icon: typeof Check }[] = [
  { value: "Open", label: "Open", icon: CircleDashed },
  { value: "In Progress", label: "In Progress", icon: Loader2 },
  { value: "Done", label: "Done", icon: Check },
];

const CONFIG: Record<
  ActionStatus,
  { pill: string; dot: string }
> = {
  Open: {
    pill: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-muted dark:text-foreground dark:border-border",
    dot: "bg-slate-400",
  },
  "In Progress": {
    pill: "bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30",
    dot: "bg-blue-500 animate-pulse",
  },
  Done: {
    pill: "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30",
    dot: "",
  },
};

export function StatusMenu({
  value,
  onChange,
}: {
  value: ActionStatus;
  onChange: (next: ActionStatus) => void;
}) {
  const cfg = CONFIG[value];
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-tight transition-opacity hover:opacity-80",
            cfg.pill,
          )}
        >
          {value === "Done" ? (
            <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
          )}
          {value}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-1" align="start">
        {OPTIONS.map((opt) => {
          const OptIcon = opt.icon;
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent",
                active && "bg-accent",
              )}
            >
              <OptIcon className="h-3.5 w-3.5" />
              {opt.label}
              {active && <Check className="ml-auto h-3.5 w-3.5 text-primary" />}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
