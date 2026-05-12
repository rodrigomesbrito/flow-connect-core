import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import {
  AlertCircle,
  CalendarIcon,
  Copy,
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Shield,
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
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  deleteActionItem,
  duplicateActionItem,
  isDueToday,
  isOverdue,
  updateActionItem,
  type ActionItem,
  type ActionPriority,
} from "@/lib/action-items/store";
import { PriorityBadge } from "./PriorityBadge";
import { StatusMenu } from "./StatusMenu";

const initials = (name?: string) =>
  (name ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "?";

export function ActionItemRow({
  item,
  projectId,
  onEdit,
}: {
  item: ActionItem;
  projectId: string;
  onEdit: (item: ActionItem) => void;
}) {
  const overdue = isOverdue(item);
  const dueToday = isDueToday(item);
  const due = item.dueDate ? new Date(item.dueDate) : undefined;
  const isDone = item.status === "Done";
  const [confirmOpen, setConfirmOpen] = useState(false);

  const fromMeeting = item.origin === "meeting" && item.meetingId;
  const meetingSearch = item.sourceLine ? { line: item.sourceLine } : {};

  return (
    <div
      className={cn(
        "group grid grid-cols-[120px_1fr_auto_auto_auto_auto_32px] items-center gap-3 border-b border-border px-4 py-2.5 hover:bg-muted/30 transition-colors",
        isDone && "opacity-60",
      )}
    >
      {/* Status */}
      <StatusMenu
        value={item.status}
        onChange={(next) => updateActionItem(projectId, item.id, { status: next })}
      />

      {/* Text — clickable when from meeting (jumps to source line) */}
      <Tooltip delayDuration={400}>
        <TooltipTrigger asChild>
          {fromMeeting ? (
            <Link
              to="/projects/$projectId/meetings/$meetingId"
              params={{ projectId, meetingId: item.meetingId! }}
              search={meetingSearch}
              className={cn(
                "min-w-0 truncate text-sm flex items-center gap-1.5 hover:text-primary transition-colors",
                isDone && "line-through",
              )}
            >
              <span className="truncate">{item.text}</span>
              <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-60 shrink-0" />
            </Link>
          ) : (
            <div
              className={cn(
                "min-w-0 truncate text-sm cursor-default",
                isDone && "line-through",
              )}
            >
              {item.text}
            </div>
          )}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-md">
          {fromMeeting ? (
            <div className="space-y-1">
              <div>{item.text}</div>
              <div className="text-[10px] opacity-70">
                From "{item.meetingTitle}"
                {item.sourceLine && ` · line ${item.sourceLine}`}
              </div>
            </div>
          ) : (
            item.text
          )}
        </TooltipContent>
      </Tooltip>

      {/* Assignee */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-[110px]">
        {item.assignee ? (
          <>
            <Avatar className="h-5 w-5">
              <AvatarFallback className="text-[10px]">
                {initials(item.assignee)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate max-w-[100px]">{item.assignee}</span>
          </>
        ) : (
          <span className="inline-flex items-center gap-1 italic">
            <User className="h-3 w-3" />
            Unassigned
          </span>
        )}
      </div>

      {/* Due date */}
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "inline-flex items-center gap-1 rounded-md border border-transparent px-2 py-1 text-xs hover:border-border",
              !due && "text-muted-foreground italic",
              overdue && "text-destructive font-medium",
              dueToday && "text-amber-700 dark:text-amber-400 font-medium",
            )}
          >
            {overdue && <AlertCircle className="h-3 w-3" />}
            {!due && <CalendarIcon className="h-3 w-3" />}
            {due ? format(due, "MMM d") : "No date"}
            {dueToday && (
              <span className="ml-1 rounded bg-amber-500/15 px-1 text-[10px] font-semibold uppercase tracking-wide">
                Today
              </span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={due}
            onSelect={(d) =>
              updateActionItem(projectId, item.id, {
                dueDate: d ? d.toISOString() : undefined,
              })
            }
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
          {due && (
            <div className="border-t p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() =>
                  updateActionItem(projectId, item.id, { dueDate: undefined })
                }
              >
                Clear
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Priority */}
      <Select
        value={item.priority}
        onValueChange={(v) =>
          updateActionItem(projectId, item.id, { priority: v as ActionPriority })
        }
      >
        <SelectTrigger className="h-7 w-[92px] border-transparent px-1.5 hover:border-border">
          <SelectValue asChild>
            <PriorityBadge priority={item.priority} />
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="High">High</SelectItem>
          <SelectItem value="Medium">Medium</SelectItem>
          <SelectItem value="Low">Low</SelectItem>
        </SelectContent>
      </Select>

      {/* Origin */}
      <div className="text-[11px] flex items-center gap-1">
        {fromMeeting ? (
          <Link
            to="/projects/$projectId/meetings/$meetingId"
            params={{ projectId, meetingId: item.meetingId! }}
            search={meetingSearch}
            className="inline-flex items-center gap-1 rounded border border-border bg-muted/50 px-1.5 py-0.5 text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
          >
            Meeting
            {item.sourceLine && (
              <span className="opacity-70">L{item.sourceLine}</span>
            )}
          </Link>
        ) : (
          <span className="rounded border border-border px-1.5 py-0.5 text-muted-foreground">
            Manual
          </span>
        )}
        {item.linkedIssueId && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to="/projects/$projectId/issues"
                params={{ projectId }}
                className="inline-flex items-center gap-1 rounded border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 transition-colors"
              >
                <Shield className="h-3 w-3" />
                Mitigation
              </Link>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              Mitigation for issue:{" "}
              {item.linkedIssueText ?? "(linked issue)"}
            </TooltipContent>
          </Tooltip>
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
          <DropdownMenuItem onClick={() => onEdit(item)}>
            <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => duplicateActionItem(projectId, item.id)}>
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
            <AlertDialogTitle>Delete this action item?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the item permanently. If it came from a meeting, the
              original meeting note is unchanged.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteActionItem(projectId, item.id)}
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
