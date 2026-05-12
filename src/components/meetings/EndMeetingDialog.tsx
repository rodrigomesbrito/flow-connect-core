import { useState } from "react";
import { CheckSquare, Gavel, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { endMeeting, removeItem, updateItem } from "@/lib/meetings/store";
import type { Meeting } from "@/lib/meetings/store";

const kindMeta = {
  action: { label: "Action items", icon: CheckSquare, color: "text-primary" },
  issue: { label: "Issues", icon: AlertTriangle, color: "text-destructive" },
  decision: { label: "Decisions", icon: Gavel, color: "text-success" },
} as const;

export function EndMeetingDialog({
  meeting,
  open,
  onOpenChange,
  onCompleted,
}: {
  meeting: Meeting;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCompleted: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = () => {
    setConfirming(true);
    endMeeting(meeting.projectId, meeting.id);
    setConfirming(false);
    onOpenChange(false);
    onCompleted();
  };

  const grouped = (["decision", "issue", "action"] as const).map((k) => ({
    kind: k,
    items: meeting.items.filter((it) => it.kind === k),
  }));

  const total = meeting.items.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Review and finalize meeting</DialogTitle>
          <DialogDescription>
            {total === 0
              ? "No items were captured. You can still finalize the meeting."
              : `${total} item${total === 1 ? "" : "s"} will be published to the project.`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-5 py-2">
          {grouped.map(({ kind, items }) => {
            const meta = kindMeta[kind];
            const Icon = meta.icon;
            return (
              <section key={kind}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`size-4 ${meta.color}`} />
                  <h3 className="text-sm font-semibold">{meta.label}</h3>
                  <span className="text-xs text-muted-foreground">({items.length})</span>
                </div>

                {items.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic pl-6">None.</p>
                ) : (
                  <ul className="space-y-2">
                    {items.map((it) => (
                      <li
                        key={it.id}
                        className="flex items-start gap-2 rounded-md border border-border p-2.5"
                      >
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <input
                            value={it.text}
                            onChange={(e) =>
                              updateItem(meeting.projectId, meeting.id, it.id, {
                                text: e.target.value,
                              })
                            }
                            className="w-full text-sm bg-transparent outline-none focus:ring-1 focus:ring-ring rounded px-1 -mx-1"
                          />
                          {kind === "action" && (
                            <Select
                              value={it.assignee ?? "__none"}
                              onValueChange={(v) =>
                                updateItem(meeting.projectId, meeting.id, it.id, {
                                  assignee: v === "__none" ? undefined : v,
                                })
                              }
                            >
                              <SelectTrigger className="h-7 text-xs w-48">
                                <SelectValue placeholder="Assign…" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none">Unassigned</SelectItem>
                                {meeting.attendees.map((a) => (
                                  <SelectItem key={a} value={a}>
                                    {a}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                          onClick={() =>
                            removeItem(meeting.projectId, meeting.id, it.id)
                          }
                        >
                          Remove
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Keep editing
          </Button>
          <Button onClick={handleConfirm} disabled={confirming}>
            Finalize meeting
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
