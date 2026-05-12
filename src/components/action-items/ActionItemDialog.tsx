import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Copy, Trash2 } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  createActionItem,
  deleteActionItem,
  duplicateActionItem,
  updateActionItem,
  type ActionItem,
  type ActionPriority,
  type ActionStatus,
} from "@/lib/action-items/store";

type Props = {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: ActionItem | null;
  attendeeSuggestions?: string[];
};

export function ActionItemDialog({
  projectId,
  open,
  onOpenChange,
  item,
  attendeeSuggestions = [],
}: Props) {
  const isEdit = !!item;
  const [text, setText] = useState(item?.text ?? "");
  const [assignee, setAssignee] = useState(item?.assignee ?? "");
  const [dueDate, setDueDate] = useState<Date | undefined>(
    item?.dueDate ? new Date(item.dueDate) : undefined,
  );
  const [priority, setPriority] = useState<ActionPriority>(
    item?.priority ?? "Medium",
  );
  const [status, setStatus] = useState<ActionStatus>(item?.status ?? "Open");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // Reset state when opening with a different item
  const reset = (next?: ActionItem | null) => {
    setText(next?.text ?? "");
    setAssignee(next?.assignee ?? "");
    setDueDate(next?.dueDate ? new Date(next.dueDate) : undefined);
    setPriority(next?.priority ?? "Medium");
    setStatus(next?.status ?? "Open");
  };

  const handleOpenChange = (next: boolean) => {
    if (next) reset(item);
    onOpenChange(next);
  };

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const payload = {
      text: trimmed,
      assignee: assignee.trim() || undefined,
      dueDate: dueDate ? dueDate.toISOString() : undefined,
      priority,
      status,
    };
    if (isEdit && item) {
      updateActionItem(projectId, item.id, payload);
    } else {
      createActionItem(projectId, payload);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit action item" : "New action item"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the action item details."
              : "Add a task that lives outside of any meeting."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="ai-text">Action</Label>
            <Textarea
              id="ai-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What needs to be done?"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="ai-assignee">Assignee</Label>
              <Input
                id="ai-assignee"
                list="ai-attendee-list"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder="Optional"
              />
              <datalist id="ai-attendee-list">
                {attendeeSuggestions.map((a) => (
                  <option key={a} value={a} />
                ))}
              </datalist>
            </div>

            <div className="grid gap-1.5">
              <Label>Due date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "MMM d, yyyy") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                  {dueDate && (
                    <div className="border-t p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() => setDueDate(undefined)}
                      >
                        Clear
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Priority</Label>
              <Select
                value={priority}
                onValueChange={(v) => setPriority(v as ActionPriority)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as ActionStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!text.trim()}>
            {isEdit ? "Save changes" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
