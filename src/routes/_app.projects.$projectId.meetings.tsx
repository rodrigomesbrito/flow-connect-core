import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import {
  Plus,
  Search,
  CalendarClock,
  Radio,
  CheckCircle2,
  Calendar as CalendarIcon,
  CheckSquare,
  Gavel,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getProject } from "@/lib/mock/projects";
import { useMeetings, type Meeting, type MeetingStatus } from "@/lib/meetings/store";
import { NewMeetingDialog } from "@/components/meetings/NewMeetingDialog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/projects/$projectId/meetings")({
  loader: ({ params }) => {
    const project = getProject(params.projectId);
    if (!project) throw notFound();
    return { project };
  },
  head: ({ params }) => {
    const project = getProject(params.projectId);
    return {
      meta: [
        { title: `Meetings — ${project?.name ?? "Project"}` },
        { name: "description", content: "Meetings, notes and follow-up items." },
      ],
    };
  },
  component: MeetingsListPage,
});

const statusFilters: Array<{ value: MeetingStatus | "All"; label: string }> = [
  { value: "All", label: "All" },
  { value: "Scheduled", label: "Scheduled" },
  { value: "Live", label: "Live" },
  { value: "Completed", label: "Completed" },
];

function MeetingsListPage() {
  const { project } = Route.useLoaderData();
  const meetings = useMeetings(project.id);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<MeetingStatus | "All">("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return meetings.filter((m) => {
      if (status !== "All" && m.status !== status) return false;
      if (!q) return true;
      return (
        m.title.toLowerCase().includes(q) ||
        m.attendees.some((a) => a.toLowerCase().includes(q))
      );
    });
  }, [meetings, query, status]);

  const counts = {
    total: meetings.length,
    Scheduled: meetings.filter((m) => m.status === "Scheduled").length,
    Live: meetings.filter((m) => m.status === "Live").length,
    Completed: meetings.filter((m) => m.status === "Completed").length,
  };

  return (
    <div className="px-6 py-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Meetings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Capture decisions, issues and action items as you go.
          </p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2">
          <Plus className="size-4" />
          New meeting
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat label="Total" value={counts.total} icon={CalendarIcon} />
        <Stat label="Scheduled" value={counts.Scheduled} icon={CalendarClock} />
        <Stat label="Live" value={counts.Live} icon={Radio} accent="text-rose-500" />
        <Stat label="Completed" value={counts.Completed} icon={CheckCircle2} accent="text-success" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <Tabs value={status} onValueChange={(v) => setStatus(v as MeetingStatus | "All")}>
          <TabsList>
            {statusFilters.map((f) => (
              <TabsTrigger key={f.value} value={f.value}>
                {f.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search meetings…"
            className="pl-8 w-64"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState onCreate={() => setOpen(true)} hasMeetings={meetings.length > 0} />
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <ul className="divide-y divide-border">
            {filtered.map((m) => (
              <MeetingRow key={m.id} meeting={m} projectId={project.id} />
            ))}
          </ul>
        </div>
      )}

      <NewMeetingDialog project={project} open={open} onOpenChange={setOpen} />
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  icon: typeof CalendarIcon;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 flex items-center gap-3">
      <span className={cn("size-9 rounded-lg bg-muted grid place-items-center", accent)}>
        <Icon className="size-4" />
      </span>
      <div>
        <div className="text-xl font-semibold leading-none">{value}</div>
        <div className="text-xs text-muted-foreground mt-1">{label}</div>
      </div>
    </div>
  );
}

function MeetingRow({ meeting, projectId }: { meeting: Meeting; projectId: string }) {
  const counts = {
    action: meeting.items.filter((i) => i.kind === "action").length,
    issue: meeting.items.filter((i) => i.kind === "issue").length,
    decision: meeting.items.filter((i) => i.kind === "decision").length,
  };

  return (
    <li>
      <Link
        to="/projects/$projectId/meetings/$meetingId"
        params={{ projectId, meetingId: meeting.id }}
        className="grid grid-cols-12 items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors"
      >
        <div className="col-span-5 min-w-0">
          <div className="text-sm font-medium truncate">{meeting.title}</div>
          <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
            <CalendarIcon className="size-3" />
            {format(new Date(meeting.date), "PP")}
          </div>
        </div>

        <div className="col-span-2">
          <StatusBadge status={meeting.status} />
        </div>

        <div className="col-span-2 flex -space-x-1.5">
          {meeting.attendees.slice(0, 4).map((name) => (
            <Avatar key={name} className="size-6 ring-2 ring-card">
              <AvatarFallback className="text-[9px] font-semibold bg-muted">
                {name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </AvatarFallback>
            </Avatar>
          ))}
          {meeting.attendees.length > 4 && (
            <span className="size-6 rounded-full bg-muted ring-2 ring-card text-[9px] font-semibold grid place-items-center text-muted-foreground">
              +{meeting.attendees.length - 4}
            </span>
          )}
        </div>

        <div className="col-span-3 flex items-center justify-end gap-3 text-xs text-muted-foreground">
          <ItemCount icon={Gavel} count={counts.decision} />
          <ItemCount icon={AlertTriangle} count={counts.issue} />
          <ItemCount icon={CheckSquare} count={counts.action} />
        </div>
      </Link>
    </li>
  );
}

function ItemCount({ icon: Icon, count }: { icon: typeof CheckSquare; count: number }) {
  return (
    <span className={cn("inline-flex items-center gap-1", count === 0 && "opacity-40")}>
      <Icon className="size-3.5" />
      {count}
    </span>
  );
}

function StatusBadge({ status }: { status: MeetingStatus }) {
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

function EmptyState({ onCreate, hasMeetings }: { onCreate: () => void; hasMeetings: boolean }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
      <CalendarClock className="size-10 text-muted-foreground mx-auto mb-3" />
      <h2 className="text-base font-semibold">
        {hasMeetings ? "No meetings match your filters" : "No meetings yet"}
      </h2>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
        {hasMeetings
          ? "Try a different status or clear the search."
          : "Start your first meeting to capture decisions, issues and action items in real time."}
      </p>
      {!hasMeetings && (
        <Button onClick={onCreate} className="mt-4 gap-2">
          <Plus className="size-4" />
          New meeting
        </Button>
      )}
    </div>
  );
}
