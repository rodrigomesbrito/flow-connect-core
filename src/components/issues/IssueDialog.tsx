import { useEffect, useState } from "react";
import { Copy, Trash2 } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  createIssue,
  deleteIssue,
  duplicateIssue,
  updateIssue,
  type Issue,
  type IssueSeverity,
  type IssueStatus,
} from "@/lib/issues/store";
import type { ActionItem } from "@/lib/action-items/store";

type Props = {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  issue?: Issue | null;
  ownerSuggestions?: string[];
  actionItems?: ActionItem[];
};

export function IssueDialog({
  projectId,
  open,
  onOpenChange,
  issue,
  ownerSuggestions = [],
  actionItems = [],
}: Props) {
  const isEdit = !!issue;
  const [text, setText] = useState("");
  const [owner, setOwner] = useState("");
  const [severity, setSeverity] = useState<IssueSeverity>("Medium");
  const [status, setStatus] = useState<IssueStatus>("Open");
  const [blocking, setBlocking] = useState(false);
  const [linkedActionItemId, setLinkedActionItemId] = useState<string>("none");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setText(issue?.text ?? "");
      setOwner(issue?.owner ?? "");
      setSeverity(issue?.severity ?? "Medium");
      setStatus(issue?.status ?? "Open");
      setBlocking(issue?.blocking ?? false);
      setLinkedActionItemId(issue?.linkedActionItemId ?? "none");
      setResolutionNotes(issue?.resolutionNotes ?? "");
    }
  }, [open, issue]);

  const fromMeeting = !!issue?.meetingId;

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const linked = linkedActionItemId === "none" ? undefined : linkedActionItemId;
    if (isEdit && issue) {
      updateIssue(projectId, issue.id, {
        text: trimmed,
        owner: owner.trim() || undefined,
        severity,
        status,
        blocking,
        linkedActionItemId: linked,
        resolutionNotes: resolutionNotes.trim() || undefined,
      });
    } else {
      createIssue(projectId, {
        text: trimmed,
        owner: owner.trim() || undefined,
        severity,
        status,
        blocking,
        linkedActionItemId: linked,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit issue" : "New issue"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? fromMeeting
                ? "The text comes from the meeting notes — editing here won't change the original."
                : "Update the issue details."
              : "Log a problem, risk, or blocker outside of any meeting."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="iss-text">Issue</Label>
            <Textarea
              id="iss-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What's the problem?"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="iss-owner">Owner</Label>
              <Input
                id="iss-owner"
                list="iss-owner-list"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="Optional"
              />
              <datalist id="iss-owner-list">
                {ownerSuggestions.map((a) => (
                  <option key={a} value={a} />
                ))}
              </datalist>
            </div>
            <div className="grid gap-1.5">
              <Label>Severity</Label>
              <Select
                value={severity}
                onValueChange={(v) => setSeverity(v as IssueSeverity)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as IssueStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="In Review">In Review</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="iss-blocking" className="text-sm">
                Blocking
              </Label>
              <div className="flex items-center gap-2 h-10 rounded-md border border-input px-3">
                <Switch
                  id="iss-blocking"
                  checked={blocking}
                  onCheckedChange={setBlocking}
                />
                <span className="text-xs text-muted-foreground">
                  {blocking ? "Blocks progress" : "Not blocking"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label>Linked mitigation action</Label>
            <Select
              value={linkedActionItemId}
              onValueChange={setLinkedActionItemId}
            >
              <SelectTrigger>
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {actionItems.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.text.length > 60 ? `${a.text.slice(0, 60)}…` : a.text}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(status === "Resolved" || isEdit) && (
            <div className="grid gap-1.5">
              <Label htmlFor="iss-resolution">Resolution notes</Label>
              <Textarea
                id="iss-resolution"
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="How was it resolved? Or context if still open."
                rows={2}
              />
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-between">
          <div className="flex gap-1">
            {isEdit && issue && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    duplicateIssue(projectId, issue.id);
                    onOpenChange(false);
                  }}
                >
                  <Copy className="mr-1.5 h-3.5 w-3.5" />
                  Duplicate
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setConfirmDeleteOpen(true)}
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Delete
                </Button>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!text.trim()}>
              {isEdit ? "Save changes" : "Create"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>

      {isEdit && issue && (
        <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this issue?</AlertDialogTitle>
              <AlertDialogDescription>
                This removes the issue permanently.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  deleteIssue(projectId, issue.id);
                  setConfirmDeleteOpen(false);
                  onOpenChange(false);
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </Dialog>
  );
}
