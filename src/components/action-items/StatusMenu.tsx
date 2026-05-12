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

const PILL: Record<ActionStatus, string> = {
  Open: "bg-muted text-muted-foreground border-border",
  "In Progress": "bg-primary/10 text-primary border-primary/20",
  Done: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400",
};

export function StatusMenu({
  value,
  onChange,
}: {
  value: ActionStatus;
  onChange: (next: ActionStatus) => void;
}) {
  const Icon = OPTIONS.find((o) => o.value === value)?.icon ?? CircleDashed;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium transition-colors hover:opacity-80",
            PILL[value],
          )}
        >
          <Icon className="h-3 w-3" />
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
