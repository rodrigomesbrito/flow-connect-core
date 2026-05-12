import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Link2, Plus, Shield, Trash2, X } from "lucide-react";
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  createIssue,
  deleteIssue,
  duplicateIssue,
  updateIssue,
  type Issue,
  type IssueSeverity,
  type IssueStatus,
} from "@/lib/issues/store";
import {
  createActionItem,
  updateActionItem,
  type ActionItem,
  type ActionPriority,
} from "@/lib/action-items/store";

type Props = {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  issue?: Issue | null;
  ownerSuggestions?: string[];
  actionItems?: ActionItem[];
};

type PendingNewAction = {
  text: string;
  assignee?: string;
  priority: ActionPriority;
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
  const [linkedActionItemId, setLinkedActionItemId] = useState<string | undefined>(
    undefined,
  );
  const [pendingNewAction, setPendingNewAction] =
    useState<PendingNewAction | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // Mitigation UI sub-mode: "view" | "creating"
  const [mitigationMode, setMitigationMode] = useState<"view" | "creating">(
    "view",
  );
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);

  // Quick-create form state (only when mitigationMode === "creating")
  const [newActionText, setNewActionText] = useState("");
  const [newActionAssignee, setNewActionAssignee] = useState("");
  const [newActionPriority, setNewActionPriority] =
    useState<ActionPriority>("Medium");

  // Confirmation when saving with blocking OFF but link still set
  const [keepLinkConfirmOpen, setKeepLinkConfirmOpen] = useState(false);

  const previousLinkedId = issue?.linkedActionItemId;

  useEffect(() => {
    if (open) {
      setText(issue?.text ?? "");
      setOwner(issue?.owner ?? "");
      setSeverity(issue?.severity ?? "Medium");
      setStatus(issue?.status ?? "Open");
      setBlocking(issue?.blocking ?? false);
      setLinkedActionItemId(issue?.linkedActionItemId);
      setPendingNewAction(null);
      setResolutionNotes(issue?.resolutionNotes ?? "");
      setMitigationMode("view");
      setNewActionText("");
      setNewActionAssignee("");
      setNewActionPriority("Medium");
      setLinkPopoverOpen(false);
    }
  }, [open, issue]);

  const fromMeeting = !!issue?.meetingId;

  const linkedAction = useMemo(
    () =>
      linkedActionItemId
        ? actionItems.find((a) => a.id === linkedActionItemId)
        : undefined,
    [linkedActionItemId, actionItems],
  );

  // Sorted: Open/In Progress first, Done last
  const linkableActions = useMemo(
    () =>
      [...actionItems].sort((a, b) => {
        const rank = (s: ActionItem["status"]) =>
          s === "Done" ? 2 : s === "In Progress" ? 1 : 0;
        return rank(a.status) - rank(b.status);
      }),
    [actionItems],
  );

  const handleStartCreate = () => {
    setNewActionText("");
    setNewActionAssignee(owner.trim());
    setNewActionPriority(severity === "Critical" || severity === "High" ? "High" : "Medium");
    setMitigationMode("creating");
  };

  const handleConfirmQuickCreate = () => {
    const t = newActionText.trim();
    if (!t) return;
    setPendingNewAction({
      text: t,
      assignee: newActionAssignee.trim() || undefined,
      priority: newActionPriority,
    });
    // Clear any explicit link — pending takes precedence
    setLinkedActionItemId(undefined);
    setMitigationMode("view");
  };

  const handleUnlink = () => {
    setLinkedActionItemId(undefined);
    setPendingNewAction(null);
  };

  const persist = (opts: { keepLink: boolean }) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Resolve final link policy
    let finalLinkedId = linkedActionItemId;
    let finalPending = pendingNewAction;
    if (!opts.keepLink) {
      finalLinkedId = undefined;
      finalPending = null;
    }

    // 1. Save the issue first (so we have a stable issueId)
    let issueId: string;
    let issueText = trimmed;
    if (isEdit && issue) {
      updateIssue(projectId, issue.id, {
        text: trimmed,
        owner: owner.trim() || undefined,
        severity,
        status,
        blocking,
        // We'll patch linkedActionItemId again at the end, after possibly creating a new action
        linkedActionItemId: finalLinkedId,
        resolutionNotes: resolutionNotes.trim() || undefined,
      });
      issueId = issue.id;
    } else {
      const created = createIssue(projectId, {
        text: trimmed,
        owner: owner.trim() || undefined,
        severity,
        status,
        blocking,
        linkedActionItemId: finalLinkedId,
      });
      issueId = created.id;
    }

    // 2. Quick-create the new action item if pending
    if (finalPending) {
      const createdAction = createActionItem(projectId, {
        text: finalPending.text,
        assignee: finalPending.assignee,
        priority: finalPending.priority,
        linkedIssueId: issueId,
        linkedIssueText: issueText,
      });
      finalLinkedId = createdAction.id;
    } else if (finalLinkedId) {
      // 3. Reconcile bidirectional metadata on existing target action item
      updateActionItem(projectId, finalLinkedId, {
        linkedIssueId: issueId,
        linkedIssueText: issueText,
      });
    }

    // 4. If the previous link is now orphaned, clear its back-reference
    if (
      previousLinkedId &&
      previousLinkedId !== finalLinkedId
    ) {
      updateActionItem(projectId, previousLinkedId, {
        linkedIssueId: undefined,
        linkedIssueText: undefined,
      });
    }

    // 5. Patch the issue's link if it changed (e.g. via quick-create)
    if (finalLinkedId !== linkedActionItemId || finalPending) {
      updateIssue(projectId, issueId, {
        linkedActionItemId: finalLinkedId,
      });
    }

    onOpenChange(false);
  };

  const handleSubmit = () => {
    if (!text.trim()) return;
    // If user committed quick-create form but didn't click "Create & link",
    // auto-promote when text was typed.
    if (mitigationMode === "creating" && newActionText.trim() && !pendingNewAction) {
      setPendingNewAction({
        text: newActionText.trim(),
        assignee: newActionAssignee.trim() || undefined,
        priority: newActionPriority,
      });
      setLinkedActionItemId(undefined);
      // Submit on next tick so state settles? Easier: persist directly with values inline.
      // We'll just call persist with current intent — pendingNewAction read inside persist
      // would be stale, so handle it inline:
      const inlinePending: PendingNewAction = {
        text: newActionText.trim(),
        assignee: newActionAssignee.trim() || undefined,
        priority: newActionPriority,
      };
      // Mirror persist() but with inlinePending
      const trimmed = text.trim();
      let issueId: string;
      if (isEdit && issue) {
        updateIssue(projectId, issue.id, {
          text: trimmed,
          owner: owner.trim() || undefined,
          severity,
          status,
          blocking,
          linkedActionItemId: undefined,
          resolutionNotes: resolutionNotes.trim() || undefined,
        });
        issueId = issue.id;
      } else {
        const created = createIssue(projectId, {
          text: trimmed,
          owner: owner.trim() || undefined,
          severity,
          status,
          blocking,
        });
        issueId = created.id;
      }
      const createdAction = createActionItem(projectId, {
        text: inlinePending.text,
        assignee: inlinePending.assignee,
        priority: inlinePending.priority,
        linkedIssueId: issueId,
        linkedIssueText: trimmed,
      });
      if (previousLinkedId && previousLinkedId !== createdAction.id) {
        updateActionItem(projectId, previousLinkedId, {
          linkedIssueId: undefined,
          linkedIssueText: undefined,
        });
      }
      updateIssue(projectId, issueId, {
        linkedActionItemId: createdAction.id,
      });
      onOpenChange(false);
      return;
    }

    // Confirmation: blocking just turned OFF but a link still exists
    const hasLink = !!linkedActionItemId || !!pendingNewAction;
    if (!blocking && hasLink) {
      setKeepLinkConfirmOpen(true);
      return;
    }

    persist({ keepLink: true });
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

          {/* Mitigation block — only when blocking is ON */}
          {blocking && (
            <div className="grid gap-1.5">
              <Label className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-amber-500" />
                Mitigation action
              </Label>

              {/* CASE: linked or pending */}
              {(linkedAction || pendingNewAction) && mitigationMode === "view" && (
                <div className="rounded-md border border-amber-500/40 bg-amber-500/5 p-3">
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">
                        {pendingNewAction
                          ? pendingNewAction.text
                          : linkedAction?.text}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {pendingNewAction ? (
                          <>
                            New action — will be created on save
                            {pendingNewAction.assignee &&
                              ` · ${pendingNewAction.assignee}`}
                            {` · ${pendingNewAction.priority}`}
                          </>
                        ) : (
                          <>
                            {linkedAction?.assignee ?? "Unassigned"}
                            {` · ${linkedAction?.status}`}
                            {` · ${linkedAction?.priority}`}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex gap-1">
                    <Popover
                      open={linkPopoverOpen}
                      onOpenChange={setLinkPopoverOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button type="button" variant="ghost" size="sm">
                          <Link2 className="mr-1.5 h-3.5 w-3.5" />
                          Change
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[360px] p-0" align="start">
                        <ActionPicker
                          actions={linkableActions}
                          selectedId={linkedActionItemId}
                          onPick={(id) => {
                            setLinkedActionItemId(id);
                            setPendingNewAction(null);
                            setLinkPopoverOpen(false);
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleUnlink}
                      className="text-muted-foreground"
                    >
                      <X className="mr-1.5 h-3.5 w-3.5" />
                      Unlink
                    </Button>
                  </div>
                </div>
              )}

              {/* CASE: empty + view */}
              {!linkedAction && !pendingNewAction && mitigationMode === "view" && (
                <div className="rounded-md border border-dashed border-border p-3">
                  <p className="text-xs text-muted-foreground">
                    No mitigation action linked
                  </p>
                  <div className="mt-2 flex gap-1">
                    <Popover
                      open={linkPopoverOpen}
                      onOpenChange={setLinkPopoverOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button type="button" variant="outline" size="sm">
                          <Link2 className="mr-1.5 h-3.5 w-3.5" />
                          Link existing
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[360px] p-0" align="start">
                        <ActionPicker
                          actions={linkableActions}
                          selectedId={linkedActionItemId}
                          onPick={(id) => {
                            setLinkedActionItemId(id);
                            setPendingNewAction(null);
                            setLinkPopoverOpen(false);
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleStartCreate}
                    >
                      <Plus className="mr-1.5 h-3.5 w-3.5" />
                      Create
                    </Button>
                  </div>
                </div>
              )}

              {/* CASE: inline create form */}
              {mitigationMode === "creating" && (
                <div className="rounded-md border border-amber-500/40 bg-amber-500/5 p-3 grid gap-2">
                  <Textarea
                    value={newActionText}
                    onChange={(e) => setNewActionText(e.target.value)}
                    placeholder="What's the mitigation action?"
                    rows={2}
                    autoFocus
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={newActionAssignee}
                      onChange={(e) => setNewActionAssignee(e.target.value)}
                      placeholder="Assignee"
                      list="iss-owner-list"
                    />
                    <Select
                      value={newActionPriority}
                      onValueChange={(v) =>
                        setNewActionPriority(v as ActionPriority)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High">High priority</SelectItem>
                        <SelectItem value="Medium">Medium priority</SelectItem>
                        <SelectItem value="Low">Low priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setMitigationMode("view")}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleConfirmQuickCreate}
                      disabled={!newActionText.trim()}
                    >
                      Create &amp; link
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

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

      {/* Discreet confirmation: blocking OFF but link still set */}
      <AlertDialog
        open={keepLinkConfirmOpen}
        onOpenChange={setKeepLinkConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Keep mitigation action linked?</AlertDialogTitle>
            <AlertDialogDescription>
              This issue is no longer blocking. Do you want to keep the
              mitigation action linked anyway, or unlink it?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setKeepLinkConfirmOpen(false);
                persist({ keepLink: false });
              }}
            >
              Unlink
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setKeepLinkConfirmOpen(false);
                persist({ keepLink: true });
              }}
            >
              Keep linked
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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

function ActionPicker({
  actions,
  selectedId,
  onPick,
}: {
  actions: ActionItem[];
  selectedId?: string;
  onPick: (id: string) => void;
}) {
  return (
    <Command>
      <CommandInput placeholder="Search action items..." />
      <CommandList>
        <CommandEmpty>No action items found.</CommandEmpty>
        <CommandGroup>
          {actions.map((a) => (
            <CommandItem
              key={a.id}
              value={`${a.text} ${a.assignee ?? ""}`}
              onSelect={() => onPick(a.id)}
              className="flex items-start gap-2"
            >
              <Check
                className={cn(
                  "h-4 w-4 mt-0.5 shrink-0",
                  selectedId === a.id ? "opacity-100" : "opacity-0",
                )}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm truncate">{a.text}</div>
                <div className="text-[11px] text-muted-foreground">
                  {a.assignee ?? "Unassigned"} · {a.status} · {a.priority}
                </div>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
