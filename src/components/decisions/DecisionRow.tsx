import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { ExternalLink, Pencil, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  updateDecisionMeta,
  type Decision,
  type DecisionStatus,
} from "@/lib/decisions/store";
import { DecisionStatusMenu } from "./StatusBadge";

const initials = (name?: string) =>
  (name ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "?";

export function DecisionRow({
  decision,
  projectId,
  onEdit,
}: {
  decision: Decision;
  projectId: string;
  onEdit: (d: Decision) => void;
}) {
  const reverted = decision.status === "Reverted";
  const search = decision.sourceLine ? { line: decision.sourceLine } : {};
  const dateLabel = decision.decidedAt ?? decision.publishedAt;

  return (
    <div
      className={cn(
        "group grid grid-cols-[120px_1fr_auto_auto_auto_32px] items-center gap-3 border-b border-border px-4 py-2.5 hover:bg-muted/30 transition-colors",
        reverted && "opacity-60",
      )}
    >
      {/* Status */}
      <DecisionStatusMenu
        value={decision.status}
        onChange={(next: DecisionStatus) =>
          updateDecisionMeta(projectId, decision.id, { status: next })
        }
      />

      {/* Text — clickable to source line */}
      <Tooltip delayDuration={400}>
        <TooltipTrigger asChild>
          <Link
            to="/projects/$projectId/meetings/$meetingId"
            params={{ projectId, meetingId: decision.meetingId }}
            search={search}
            className={cn(
              "min-w-0 truncate text-sm flex items-center gap-1.5 hover:text-primary transition-colors",
              reverted && "line-through",
            )}
          >
            <span className="truncate">{decision.text}</span>
            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-60 shrink-0" />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-md">
          <div className="space-y-1">
            <div>{decision.text}</div>
            <div className="text-[10px] opacity-70">
              From "{decision.meetingTitle}"
              {decision.sourceLine && ` · line ${decision.sourceLine}`}
            </div>
            {decision.notes && (
              <div className="pt-1 text-[10px] opacity-80 italic">
                {decision.notes}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>

      {/* Decided by */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-[120px]">
        {decision.decidedBy ? (
          <>
            <Avatar className="h-5 w-5">
              <AvatarFallback className="text-[10px]">
                {initials(decision.decidedBy)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate max-w-[100px]">{decision.decidedBy}</span>
          </>
        ) : (
          <span className="inline-flex items-center gap-1 italic">
            <User className="h-3 w-3" />
            Unassigned
          </span>
        )}
      </div>

      {/* Date */}
      <div className="text-xs text-muted-foreground tabular-nums">
        {format(new Date(dateLabel), "MMM d, yyyy")}
      </div>

      {/* Source meeting */}
      <Link
        to="/projects/$projectId/meetings/$meetingId"
        params={{ projectId, meetingId: decision.meetingId }}
        search={search}
        className="inline-flex items-center gap-1 rounded border border-border bg-muted/50 px-1.5 py-0.5 text-[11px] text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors max-w-[180px]"
      >
        <span className="truncate">{decision.meetingTitle}</span>
        {decision.sourceLine && (
          <span className="opacity-70 shrink-0">L{decision.sourceLine}</span>
        )}
      </Link>

      {/* Edit */}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 opacity-0 group-hover:opacity-100"
        onClick={() => onEdit(decision)}
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
