import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { ExternalLink } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  updateDecisionMeta,
  type Decision,
  type DecisionStatus,
} from "@/lib/decisions/store";

type Props = {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  decision: Decision | null;
  decisorSuggestions?: string[];
};

export function DecisionDialog({
  projectId,
  open,
  onOpenChange,
  decision,
  decisorSuggestions = [],
}: Props) {
  const [status, setStatus] = useState<DecisionStatus>("Proposed");
  const [decidedBy, setDecidedBy] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open && decision) {
      setStatus(decision.status);
      setDecidedBy(decision.decidedBy ?? "");
      setNotes(decision.notes ?? "");
    }
  }, [open, decision]);

  if (!decision) return null;

  const search = decision.sourceLine ? { line: decision.sourceLine } : {};

  const handleSave = () => {
    updateDecisionMeta(projectId, decision.id, {
      status,
      decidedBy: decidedBy.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Edit decision</DialogTitle>
          <DialogDescription>
            The decision text comes from the meeting notes. Update its status
            and metadata here.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          {/* Read-only text */}
          <div className="grid gap-1.5">
            <Label className="text-xs text-muted-foreground">Decision</Label>
            <div className="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
              {decision.text}
            </div>
            <Link
              to="/projects/$projectId/meetings/$meetingId"
              params={{ projectId, meetingId: decision.meetingId }}
              search={search}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors w-fit"
              onClick={() => onOpenChange(false)}
            >
              From "{decision.meetingTitle}"
              {decision.sourceLine && ` · line ${decision.sourceLine}`}
              <ExternalLink className="h-3 w-3" />
            </Link>
            <p className="text-[11px] text-muted-foreground">
              Published {format(new Date(decision.publishedAt), "MMM d, yyyy")}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as DecisionStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Proposed">Proposed</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Reverted">Reverted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="dec-by">Decided by</Label>
              <Input
                id="dec-by"
                list="dec-by-list"
                value={decidedBy}
                onChange={(e) => setDecidedBy(e.target.value)}
                placeholder="Optional"
              />
              <datalist id="dec-by-list">
                {decisorSuggestions.map((a) => (
                  <option key={a} value={a} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="dec-notes">Notes</Label>
            <Textarea
              id="dec-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Rationale, context, links..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
