import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Ban,
  CheckSquare,
  Copy,
  ExternalLink,
  Pencil,
  Shield,
  Trash2,
} from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
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
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { RowMenu } from "@/components/data";
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

/** Deterministic ring color derived from owner name. */
const ringColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = (hash << 5) - hash + name.charCodeAt(i);
  const palette = [
    "bg-blue-100 text-blue-700 ring-blue-200",
    "bg-emerald-100 text-emerald-700 ring-emerald-200",
    "bg-violet-100 text-violet-700 ring-violet-200",
    "bg-amber-100 text-amber-700 ring-amber-200",
    "bg-rose-100 text-rose-700 ring-rose-200",
    "bg-cyan-100 text-cyan-700 ring-cyan-200",
  ];
  return palette[Math.abs(hash) % palette.length];
};

export const ISSUES_GRID = ""; // Deprecated, will be removed soon.

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
  const fromMeeting = issue.origin === "meeting" && !!issue.meetingId;
  const meetingSearch = issue.sourceLine ? { line: issue.sourceLine } : {};
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <TableRow
      className={cn(
        "group hover:bg-muted/20 border-border/40 transition-colors",
        resolved && "opacity-60",
        issue.blocking && !resolved && "bg-rose-50/30 dark:bg-rose-950/10",
      )}
    >
      {/* Status */}
      <TableCell className="pl-5 py-3 align-middle w-[130px]">
        <IssueStatusMenu
          value={issue.status}
          onChange={(next) => updateIssue(projectId, issue.id, { status: next })}
        />
      </TableCell>

      {/* Issue text + blocking marker */}
      <TableCell className="py-3 align-middle">
      <Tooltip delayDuration={400}>
        <TooltipTrigger asChild>
          {fromMeeting ? (
            <Link
              to="/projects/$projectId/meetings/$meetingId"
              params={{ projectId, meetingId: issue.meetingId! }}
              search={meetingSearch}
              className={cn(
                "min-w-0 flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors",
                resolved && "line-through text-muted-foreground font-normal",
              )}
            >
              {issue.blocking && !resolved && (
                <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-tight bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 shrink-0">
                  <Ban className="h-2.5 w-2.5" />
                  Block
                </span>
              )}
              <span className="truncate text-[14px]">{issue.text}</span>
              <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-50 shrink-0" />
            </Link>
          ) : (
            <div
              className={cn(
                "min-w-0 flex items-center gap-2 text-sm font-medium text-foreground cursor-default",
                resolved && "line-through text-muted-foreground font-normal",
              )}
            >
              {issue.blocking && !resolved && (
                <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-tight bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 shrink-0">
                  <Ban className="h-2.5 w-2.5" />
                  Block
                </span>
              )}
              <span className="truncate text-[14px]">{issue.text}</span>
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
      </TableCell>

      {/* Owner */}
      <TableCell className="py-3 align-middle w-[140px]">
        <div className="flex items-center gap-2 min-w-0">
        {issue.owner ? (
          <>
            <span
              className={cn(
                "h-6 w-6 rounded-full ring-1 flex items-center justify-center text-[10px] font-semibold shrink-0",
                ringColor(issue.owner),
              )}
            >
              {initials(issue.owner)}
            </span>
            <span className="text-xs text-foreground truncate">
              {issue.owner}
            </span>
          </>
        ) : (
          <span className="text-[13px] italic text-muted-foreground">
            Unassigned
          </span>
        )}
      </div>
      </TableCell>

      {/* Severity */}
      <TableCell className="py-3 align-middle w-[120px]">
      <Select
        value={issue.severity}
        onValueChange={(v) =>
          updateIssue(projectId, issue.id, { severity: v as IssueSeverity })
        }
      >
        <SelectTrigger className="h-7 w-full justify-start border-transparent bg-transparent px-1.5 hover:bg-muted/60 hover:border-border [&_svg]:opacity-0 group-hover:[&_svg]:opacity-50">
          <SelectValue asChild>
            <SeverityBadge severity={issue.severity} />
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Critical">Critical</SelectItem>
          <SelectItem value="High">High</SelectItem>
          <SelectItem value="Medium">Medium</SelectItem>
          <SelectItem value="Low">Low</SelectItem>
        </SelectContent>
      </Select>
      </TableCell>

      {/* Mitigation */}
      <TableCell className="py-3 align-middle w-[140px]">
      <div className="text-[11px] min-w-0">
        {linkedAction ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to="/projects/$projectId/action-items"
                params={{ projectId }}
                className="inline-flex items-center gap-1 rounded border border-amber-200/80 bg-amber-50 px-1.5 py-0.5 text-amber-700 hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300 transition-colors max-w-full"
              >
                <Shield className="h-3 w-3 shrink-0" />
                <span className="truncate">{linkedAction.text}</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent>Mitigation: {linkedAction.text}</TooltipContent>
          </Tooltip>
        ) : (
          <span className="text-muted-foreground/60">—</span>
        )}
      </div>
      </TableCell>

      {/* Origin */}
      <TableCell className="py-3 align-middle w-[100px]">
      <div className="text-[12px] font-medium">
        {fromMeeting ? (
          <Link
            to="/projects/$projectId/meetings/$meetingId"
            params={{ projectId, meetingId: issue.meetingId! }}
            search={meetingSearch}
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            Meeting
            {issue.sourceLine && (
              <span className="opacity-60">·L{issue.sourceLine}</span>
            )}
          </Link>
        ) : (
          <span className="text-muted-foreground">Manual</span>
        )}
      </div>
      </TableCell>

      {/* Row menu */}
      <TableCell className="pr-5 py-3 align-middle text-right w-[60px]">
      <RowMenu>
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
        {linkedAction && (
          <DropdownMenuItem asChild>
            <Link
              to="/projects/$projectId/action-items"
              params={{ projectId }}
              className="cursor-pointer"
            >
              <CheckSquare className="mr-2 h-3.5 w-3.5" /> View mitigation
            </Link>
          </DropdownMenuItem>
        )}
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
      </RowMenu>

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
      </TableCell>
    </TableRow>
  );
}
