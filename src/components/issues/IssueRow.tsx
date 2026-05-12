import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Ban,
  CheckSquare,
  Copy,
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Trash2,
  User,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  deleteIssue,
  duplicateIssue,
  updateIssue,
  type Issue,
  type IssueSeverity,
} from "@/lib/issues/store";
import type { ActionItem } from "@/lib/action-items/store";
import { IssueStatusMenu } from "./IssueStatusMenu";
import { SeverityBadge } from "./SeverityBadge";

const initials = (name?: string) =>
  (name ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "?";

export function IssueRow({
  issue,
  projectId,
  onEdit,
  linkedAction,
}: {
  issue: Issue;
  projectId: string;
  onEdit: (issue: Issue) => void;
  linkedAction?: ActionItem;
}) {
  const resolved = issue.status === "Resolved";
  const fromMeeting = issue.origin === "meeting" && issue.meetingId;
  const meetingSearch = issue.sourceLine ? { line: issue.sourceLine } : {};
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div
      className={cn(
        "group grid grid-cols-[110px_1fr_auto_auto_auto_auto_32px] items-center gap-3 border-b border-border px-4 py-2.5 hover:bg-muted/30 transition-colors",
        resolved && "opacity-60",
        issue.blocking && !resolved && "bg-destructive/[0.03]",
      )}
    >
      {/* Status */}
      <IssueStatusMenu
        value={issue.status}
        onChange={(next) => updateIssue(projectId, issue.id, { status: next })}
      />

      {/* Text */}
      <Tooltip delayDuration={400}>
        <TooltipTrigger asChild>
          {fromMeeting ? (
            <Link
              to="/projects/$projectId/meetings/$meetingId"
              params={{ projectId, meetingId: issue.meetingId! }}
              search={meetingSearch}
              className={cn(
                "min-w-0 truncate text-sm flex items-center gap-1.5 hover:text-primary transition-colors",
                resolved && "line-through",
              )}
            >
              {issue.blocking && !resolved && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Ban className="h-3.5 w-3.5 text-destructive shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent>Blocking</TooltipContent>
                </Tooltip>
              )}
              <span className="truncate">{issue.text}</span>
              <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-60 shrink-0" />
            </Link>
          ) : (
            <div
              className={cn(
                "min-w-0 truncate text-sm flex items-center gap-1.5 cursor-default",
                resolved && "line-through",
              )}
            >
              {issue.blocking && !resolved && (
                <Ban className="h-3.5 w-3.5 text-destructive shrink-0" />
              )}
              <span className="truncate">{issue.text}</span>
            </div>
          )}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-md">
          <div className="space-y-1">
            <div>{issue.text}</div>
            {fromMeeting && (
              <div className="text-[10px] opacity-70">
                From "{issue.meetingTitle}"
                {issue.sourceLine && ` · line ${issue.sourceLine}`}
              </div>
            )}
            {issue.resolutionNotes && resolved && (
              <div className="pt-1 text-[10px] italic opacity-80">
                Resolution: {issue.resolutionNotes}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>

      {/* Owner */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-[110px]">
        {issue.owner ? (
          <>
            <Avatar className="h-5 w-5">
              <AvatarFallback className="text-[10px]">
                {initials(issue.owner)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate max-w-[100px]">{issue.owner}</span>
          </>
        ) : (
          <span className="inline-flex items-center gap-1 italic">
            <User className="h-3 w-3" />
            Unassigned
          </span>
        )}
      </div>

      {/* Severity */}
      <Select
        value={issue.severity}
        onValueChange={(v) =>
          updateIssue(projectId, issue.id, { severity: v as IssueSeverity })
        }
      >
        <SelectTrigger className="h-7 w-[100px] border-transparent px-1.5 hover:border-border">
          <SelectValue asChild>
            <SeverityBadge severity={issue.severity} showIcon />
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Critical">Critical</SelectItem>
          <SelectItem value="High">High</SelectItem>
          <SelectItem value="Medium">Medium</SelectItem>
          <SelectItem value="Low">Low</SelectItem>
        </SelectContent>
      </Select>

      {/* Linked action */}
      <div className="text-[11px] min-w-[100px]">
        {linkedAction ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to="/projects/$projectId/action-items"
                params={{ projectId }}
                className="inline-flex items-center gap-1 rounded border border-border bg-primary/5 px-1.5 py-0.5 text-primary hover:bg-primary/10 transition-colors max-w-[140px]"
              >
                <CheckSquare className="h-3 w-3 shrink-0" />
                <span className="truncate">{linkedAction.text}</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent>Mitigation: {linkedAction.text}</TooltipContent>
          </Tooltip>
        ) : (
          <span className="text-muted-foreground italic">—</span>
        )}
      </div>

      {/* Origin */}
      <div className="text-[11px]">
        {fromMeeting ? (
          <Link
            to="/projects/$projectId/meetings/$meetingId"
            params={{ projectId, meetingId: issue.meetingId! }}
            search={meetingSearch}
            className="inline-flex items-center gap-1 rounded border border-border bg-muted/50 px-1.5 py-0.5 text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
          >
            Meeting
            {issue.sourceLine && (
              <span className="opacity-70">L{issue.sourceLine}</span>
            )}
          </Link>
        ) : (
          <span className="rounded border border-border px-1.5 py-0.5 text-muted-foreground">
            Manual
          </span>
        )}
      </div>

      {/* Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 opacity-0 group-hover:opacity-100"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(issue)}>
            <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              updateIssue(projectId, issue.id, { blocking: !issue.blocking })
            }
          >
            <Ban className="mr-2 h-3.5 w-3.5" />
            {issue.blocking ? "Unmark blocking" : "Mark as blocking"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => duplicateIssue(projectId, issue.id)}>
            <Copy className="mr-2 h-3.5 w-3.5" /> Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={(e) => {
              e.preventDefault();
              setConfirmOpen(true);
            }}
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this issue?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the issue permanently. If it came from a meeting, the
              original meeting note is unchanged.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteIssue(projectId, issue.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
