import { createFileRoute, notFound, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect, useRef } from "react";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  CheckCircle2,
  CheckSquare,
  Gavel,
  AlertTriangle,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getProject } from "@/lib/mock/projects";
import {
  useMeeting,
  updateMeetingNotes,
  updateMeetingMeta,
  removeItem,
  type ItemKind,
} from "@/lib/meetings/store";
import { ItemCard } from "@/components/meetings/ItemCard";
import { EndMeetingDialog } from "@/components/meetings/EndMeetingDialog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/projects/$projectId/meetings/$meetingId")({
  loader: ({ params }) => {
    const project = getProject(params.projectId);
    if (!project) throw notFound();
    return { project };
  },
  head: ({ params }) => ({
    meta: [{ title: `Meeting — ${params.projectId}` }],
  }),
  component: MeetingDetailPage,
});

function MeetingDetailPage() {
  const { project } = Route.useLoaderData();
  const { meetingId } = Route.useParams();
  const navigate = useNavigate();
  const meeting = useMeeting(project.id, meetingId);

  const [notesDraft, setNotesDraft] = useState("");
  const [endOpen, setEndOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (meeting && !initialized.current) {
      setNotesDraft(meeting.notes);
      initialized.current = true;
    }
  }, [meeting]);

  if (!meeting) {
    return (
      <div className="px-6 py-12 text-center max-w-xl mx-auto">
        <h1 className="text-lg font-semibold">Meeting not found</h1>
        <p className="text-sm text-muted-foreground mt-1">
          It may have been removed or never existed.
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/projects/$projectId/meetings" params={{ projectId: project.id }}>
            Back to meetings
          </Link>
        </Button>
      </div>
    );
  }

  const isLive = meeting.status === "Live";

  const handleNotesChange = (v: string) => {
    setNotesDraft(v);
    if (!isLive) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateMeetingNotes(project.id, meeting.id, v);
    }, 200);
  };

  return (
    <div className="px-6 py-5 max-w-7xl mx-auto flex flex-col gap-4 h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <Link
            to="/projects/$projectId/meetings"
            params={{ projectId: project.id }}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-1"
          >
            <ArrowLeft className="size-3" />
            All meetings
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <input
              value={meeting.title}
              onChange={(e) =>
                updateMeetingMeta(project.id, meeting.id, { title: e.target.value })
              }
              disabled={!isLive}
              className="text-2xl font-semibold tracking-tight bg-transparent outline-none focus:ring-1 focus:ring-ring rounded px-1 -mx-1 min-w-0 max-w-full disabled:opacity-100"
            />
            <StatusPill status={meeting.status} />
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <CalendarIcon className="size-3" />
              {format(new Date(meeting.date), "PPP")}
            </span>
            <div className="flex -space-x-1.5">
              {meeting.attendees.map((name) => (
                <Avatar key={name} className="size-5 ring-2 ring-background">
                  <AvatarFallback className="text-[9px] font-semibold bg-muted">
                    {name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <span>{meeting.attendees.length} attendees</span>
          </div>
        </div>

        {isLive && (
          <Button onClick={() => setEndOpen(true)} className="gap-2 shrink-0">
            <CheckCircle2 className="size-4" />
            End meeting
          </Button>
        )}
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 flex-1 min-h-0">
        <NotesPanel
          notes={notesDraft}
          onChange={handleNotesChange}
          readOnly={!isLive}
        />
        <ItemsPanel
          projectId={project.id}
          meetingId={meeting.id}
          items={meeting.items}
          readOnly={!isLive}
        />
      </div>

      <EndMeetingDialog
        meeting={meeting}
        open={endOpen}
        onOpenChange={setEndOpen}
        onCompleted={() =>
          navigate({ to: "/projects/$projectId/meetings", params: { projectId: project.id } })
        }
      />
    </div>
  );
}

const RE_ACTION = /^(\s*)(\[action(?:\s+@[^\]]+)?\])(\s*)(.*)$/i;
const RE_ISSUE = /^(\s*)(\[issue\])(\s*)(.*)$/i;
const RE_DECISION = /^(\s*)(\[decision\])(\s*)(.*)$/i;

type LineKind = "action" | "issue" | "decision" | null;

function classifyLine(line: string): LineKind {
  if (RE_ACTION.test(line)) return "action";
  if (RE_ISSUE.test(line)) return "issue";
  if (RE_DECISION.test(line)) return "decision";
  return null;
}

const LINE_STYLES: Record<Exclude<LineKind, null>, { bg: string; bar: string; tag: string }> = {
  action: {
    bg: "bg-primary/10",
    bar: "bg-primary",
    tag: "text-primary font-semibold",
  },
  issue: {
    bg: "bg-amber-500/10",
    bar: "bg-amber-500",
    tag: "text-amber-700 dark:text-amber-400 font-semibold",
  },
  decision: {
    bg: "bg-emerald-500/10",
    bar: "bg-emerald-500",
    tag: "text-emerald-700 dark:text-emerald-400 font-semibold",
  },
};

function NotesPanel({
  notes,
  onChange,
  readOnly,
}: {
  notes: string;
  onChange: (v: string) => void;
  readOnly: boolean;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (overlayRef.current && textareaRef.current) {
      overlayRef.current.scrollTop = textareaRef.current.scrollTop;
      overlayRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const lines = notes.length === 0 ? [""] : notes.split("\n");

  return (
    <section className="flex flex-col rounded-xl border border-border bg-card min-h-0">
      <header className="px-4 py-2.5 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-semibold">Notes</h2>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Info className="size-3" />
          <span>
            Use <code className="px-1 rounded bg-muted">[action]</code>,{" "}
            <code className="px-1 rounded bg-muted">[issue]</code>,{" "}
            <code className="px-1 rounded bg-muted">[decision]</code>
          </span>
        </div>
      </header>
      <div className="relative flex-1 min-h-0">
        {/* Highlight overlay — mirrors textarea content */}
        <div
          ref={overlayRef}
          aria-hidden
          className="absolute inset-0 overflow-hidden p-4 text-sm font-mono leading-relaxed whitespace-pre-wrap break-words pointer-events-none text-transparent selection:bg-transparent"
        >
          {lines.map((line, i) => {
            const kind = classifyLine(line);
            if (!kind) {
              return (
                <div key={i} className="min-h-[1.625rem]">
                  {line || "\u200B"}
                </div>
              );
            }
            const styles = LINE_STYLES[kind];
            const match =
              kind === "action"
                ? line.match(RE_ACTION)
                : kind === "issue"
                  ? line.match(RE_ISSUE)
                  : line.match(RE_DECISION);
            return (
              <div
                key={i}
                className={cn(
                  "relative min-h-[1.625rem] -mx-2 px-2 rounded-sm",
                  styles.bg,
                )}
              >
                <span className={cn("absolute left-0 top-0 bottom-0 w-0.5 rounded-r", styles.bar)} />
                {match ? (
                  <>
                    {match[1]}
                    <span className={styles.tag}>{match[2]}</span>
                    {match[3]}
                    {match[4] || "\u200B"}
                  </>
                ) : (
                  line
                )}
              </div>
            );
          })}
        </div>
        <textarea
          ref={textareaRef}
          value={notes}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          readOnly={readOnly}
          placeholder={`Type freely. Mark items with brackets, e.g.:\n\n[decision] Approve bid package #3\n[issue] Utility relocation delay on STA 12+50\n[action @Joey Cox] Send updated schedule by Friday\n[action] Confirm easement filing window`}
          className="relative w-full h-full resize-none p-4 text-sm font-mono leading-relaxed bg-transparent outline-none placeholder:text-muted-foreground/60 caret-foreground text-foreground"
          spellCheck={false}
        />
      </div>
    </section>
  );
}

function ItemsPanel({
  projectId,
  meetingId,
  items,
  readOnly,
}: {
  projectId: string;
  meetingId: string;
  items: import("@/lib/meetings/store").GeneratedItem[];
  readOnly: boolean;
}) {
  const [tab, setTab] = useState<ItemKind>("action");

  const groups = useMemo(
    () => ({
      action: items.filter((i) => i.kind === "action"),
      issue: items.filter((i) => i.kind === "issue"),
      decision: items.filter((i) => i.kind === "decision"),
    }),
    [items],
  );

  return (
    <section className="flex flex-col rounded-xl border border-border bg-card min-h-0">
      <header className="px-4 py-2.5 border-b border-border">
        <h2 className="text-sm font-semibold">Generated items</h2>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Updates as you type.
        </p>
      </header>

      <Tabs value={tab} onValueChange={(v) => setTab(v as ItemKind)} className="flex-1 flex flex-col min-h-0">
        <TabsList className="mx-3 mt-3 grid grid-cols-3">
          <TabsTrigger value="action" className="gap-1.5">
            <CheckSquare className="size-3.5" />
            <span>Actions</span>
            <Count n={groups.action.length} />
          </TabsTrigger>
          <TabsTrigger value="issue" className="gap-1.5">
            <AlertTriangle className="size-3.5" />
            <span>Issues</span>
            <Count n={groups.issue.length} />
          </TabsTrigger>
          <TabsTrigger value="decision" className="gap-1.5">
            <Gavel className="size-3.5" />
            <span>Decisions</span>
            <Count n={groups.decision.length} />
          </TabsTrigger>
        </TabsList>

        {(["action", "issue", "decision"] as const).map((k) => (
          <TabsContent key={k} value={k} className="flex-1 overflow-auto px-3 pb-3 mt-2 space-y-2">
            {groups[k].length === 0 ? (
              <EmptyHint kind={k} />
            ) : (
              groups[k].map((it) => (
                <ItemCard
                  key={it.id}
                  item={it}
                  readOnly={readOnly}
                  onRemove={() => removeItem(projectId, meetingId, it.id)}
                />
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}

function Count({ n }: { n: number }) {
  return (
    <span className={cn(
      "ml-1 text-[10px] font-semibold rounded-full px-1.5 py-0.5 min-w-[18px] text-center",
      n > 0 ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
    )}>
      {n}
    </span>
  );
}

function EmptyHint({ kind }: { kind: ItemKind }) {
  const examples: Record<ItemKind, string> = {
    action: "[action @Joey] Send updated schedule",
    issue: "[issue] Utility conflict on STA 12+50",
    decision: "[decision] Approve bid package #3",
  };
  return (
    <div className="text-center text-xs text-muted-foreground py-8 px-2">
      <p>No {kind}s captured yet.</p>
      <p className="mt-2 text-[11px] opacity-70">
        Try writing in notes:
        <br />
        <code className="text-[10.5px] bg-muted px-1.5 py-0.5 rounded mt-1 inline-block">
          {examples[kind]}
        </code>
      </p>
    </div>
  );
}

function StatusPill({ status }: { status: "Scheduled" | "Live" | "Completed" }) {
  const map = {
    Scheduled: "bg-muted text-foreground/70 border-border",
    Live: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
    Completed: "bg-success/15 text-success border-success/30",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-medium",
        map[status],
      )}
    >
      {status === "Live" && <span className="size-1.5 rounded-full bg-rose-500 animate-pulse" />}
      {status}
    </span>
  );
}
