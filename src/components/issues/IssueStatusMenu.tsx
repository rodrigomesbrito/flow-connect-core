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
  { label: string; icon: typeof Check; className: string }
> = {
  Open: {
    label: "Open",
    icon: CircleDot,
    className:
      "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30",
  },
  "In Review": {
    label: "In Review",
    icon: Eye,
    className:
      "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30",
  },
  Resolved: {
    label: "Resolved",
    icon: Check,
    className:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  },
};

export function IssueStatusBadge({ status }: { status: IssueStatus }) {
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
        <button type="button" className="outline-none">
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
