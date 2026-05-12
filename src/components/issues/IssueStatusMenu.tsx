import { Check, CircleDot, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { IssueStatus } from "@/lib/issues/store";

const CONFIG: Record<
  IssueStatus,
  { label: string; icon: typeof Check; pill: string; dot: string }
> = {
  Open: {
    label: "Open",
    icon: CircleDot,
    pill: "bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/30",
    dot: "bg-rose-500",
  },
  "In Review": {
    label: "In Review",
    icon: Eye,
    pill: "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30",
    dot: "bg-amber-500",
  },
  Resolved: {
    label: "Resolved",
    icon: Check,
    pill: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-muted dark:text-muted-foreground dark:border-border",
    dot: "bg-emerald-500",
  },
};

export function IssueStatusBadge({
  status,
  className,
}: {
  status: IssueStatus;
  className?: string;
}) {
  const cfg = CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-tight",
        cfg.pill,
        className,
      )}
    >
      {status === "Resolved" ? (
        <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
      ) : (
        <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot, status === "Open" && "animate-pulse")} />
      )}
      {cfg.label}
    </span>
  );
}

export function IssueStatusMenu({
  value,
  onChange,
}: {
  value: IssueStatus;
  onChange: (next: IssueStatus) => void;
}) {
  const ALL: IssueStatus[] = ["Open", "In Review", "Resolved"];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="outline-none transition-opacity hover:opacity-80"
        >
          <IssueStatusBadge status={value} />
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
