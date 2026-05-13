import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { format } from "date-fns";
import {
  Plus,
  CalendarClock,
  Calendar as CalendarIcon,
  CheckSquare,
  Gavel,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  EmptyState,
  KpiRow,
  KpiStat,
  NoResults,
  PageHeader,
  Toolbar,
  ToolbarFilter,
  ToolbarSearch,
} from "@/components/data";
import { getProject } from "@/lib/mock/projects";
import {
  useMeetings,
  type Meeting,
  type MeetingStatus,
} from "@/lib/meetings/store";
import { NewMeetingDialog } from "@/components/meetings/NewMeetingDialog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/projects/$projectId/meetings/")({
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

function MeetingsListPage() {
  const { project } = Route.useLoaderData();
  const meetings = useMeetings(project.id);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<MeetingStatus | "all">("all");
  const [query, setQuery] = useState("");

  const stats = useMemo(
    () => ({
      total: meetings.length,
      scheduled: meetings.filter((m) => m.status === "Scheduled").length,
      live: meetings.filter((m) => m.status === "Live").length,
      completed: meetings.filter((m) => m.status === "Completed").length,
    }),
    [meetings],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return meetings
      .filter((m) => {
        if (statusFilter !== "all" && m.status !== statusFilter) return false;
        if (!q) return true;
        return (
          m.title.toLowerCase().includes(q) ||
          m.attendees.some((a) => a.toLowerCase().includes(q))
        );
      })
      .sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
  }, [meetings, query, statusFilter]);

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => {
    setPage(1);
  }, [query, statusFilter]);

  const paginated = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page],
  );

  const clearFilters = () => {
    setStatusFilter("all");
    setQuery("");
  };

  const filtersActive = statusFilter !== "all" || query.trim() !== "";

  return (
    <div className="px-6 py-6 max-w-7xl mx-auto">
      <PageHeader
        title="Meetings"
        description="Capture decisions, issues and action items as you go."
        actions={
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            New meeting
          </Button>
        }
      />

      <KpiRow>
        <KpiStat
          label="Total"
          value={stats.total}
          active={statusFilter === "all"}
          onClick={() => setStatusFilter("all")}
        />
        <KpiStat
          label="Scheduled"
          value={stats.scheduled}
          active={statusFilter === "Scheduled"}
          onClick={() => setStatusFilter("Scheduled")}
        />
        <KpiStat
          label="Live"
          value={stats.live}
          tone="destructive"
          active={statusFilter === "Live"}
          onClick={() => setStatusFilter("Live")}
        />
        <KpiStat
          label="Completed"
          value={stats.completed}
          tone="success"
          active={statusFilter === "Completed"}
          onClick={() => setStatusFilter("Completed")}
        />
      </KpiRow>

      <Toolbar onClear={clearFilters} hasActiveFilters={filtersActive}>
        <ToolbarSearch
          value={query}
          onChange={setQuery}
          placeholder="Search meetings..."
        />
        <ToolbarFilter
          label="Status"
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as MeetingStatus | "all")}
          options={[
            { value: "all", label: "All status" },
            { value: "Scheduled", label: "Scheduled" },
            { value: "Live", label: "Live" },
            { value: "Completed", label: "Completed" },
          ]}
        />
      </Toolbar>

      {meetings.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No meetings yet"
          description="Start your first meeting to capture decisions, issues and action items in real time."
          action={
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" /> New meeting
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-border/50 rounded-[14px] overflow-hidden">
          <NoResults
            message="No meetings match your filters."
            onClear={clearFilters}
          />
        </div>
      ) : (
        <div className="bg-card border border-border/50 rounded-[14px] overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40 hover:bg-muted/40">
              <TableRow className="border-border/40 hover:bg-transparent">
                <TableHead className="h-10 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider pl-5">
                  Meeting
                </TableHead>
                <TableHead className="h-10 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-[140px]">
                  Status
                </TableHead>
                <TableHead className="h-10 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-[160px]">
                  Attendees
                </TableHead>
                <TableHead className="h-10 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-right pr-5 w-[180px]">
                  Items
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((m) => (
                <MeetingRow
                  key={m.id}
                  meeting={m}
                  projectId={project.id}
                />
              ))}
            </TableBody>
          </Table>

          {filtered.length > pageSize && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-border/40 bg-muted/10">
              <div className="text-[12px] text-muted-foreground">
                Showing{" "}
                <span className="font-medium text-foreground">
                  {(page - 1) * pageSize + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium text-foreground">
                  {Math.min(page * pageSize, filtered.length)}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">
                  {filtered.length}
                </span>{" "}
                results
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-8 w-8 p-0 border-border/60 hover:bg-muted/50 rounded-md"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <div className="text-[12px] font-medium text-muted-foreground min-w-[3rem] text-center">
                  {page} / {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="h-8 w-8 p-0 border-border/60 hover:bg-muted/50 rounded-md"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <NewMeetingDialog
        project={project}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}

function MeetingRow({
  meeting,
  projectId,
}: {
  meeting: Meeting;
  projectId: string;
}) {
  const navigate = useNavigate();
  const counts = {
    action: meeting.items.filter((i) => i.kind === "action").length,
    issue: meeting.items.filter((i) => i.kind === "issue").length,
    decision: meeting.items.filter((i) => i.kind === "decision").length,
  };

  return (
    <TableRow
      onClick={() =>
        navigate({
          to: "/projects/$projectId/meetings/$meetingId",
          params: { projectId, meetingId: meeting.id },
        })
      }
      className="group hover:bg-muted/20 border-border/40 transition-colors cursor-pointer"
    >
      <TableCell className="pl-5 py-3 align-middle">
        <div className="min-w-0">
          <div className="text-[14px] font-medium truncate group-hover:text-primary transition-colors">
            {meeting.title}
          </div>
          <div className="text-[12px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
            <CalendarIcon className="size-3" />
            {format(new Date(meeting.date), "PP")}
          </div>
        </div>
      </TableCell>

      <TableCell className="py-3 align-middle">
        <StatusBadge status={meeting.status} />
      </TableCell>

      <TableCell className="py-3 align-middle">
        <div className="flex -space-x-1.5">
          {meeting.attendees.slice(0, 4).map((name) => (
            <Avatar key={name} className="size-6 ring-2 ring-card">
              <AvatarFallback className="text-[9px] font-semibold bg-muted">
                {name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </AvatarFallback>
            </Avatar>
          ))}
          {meeting.attendees.length > 4 && (
            <span className="size-6 rounded-full bg-muted ring-2 ring-card text-[9px] font-semibold grid place-items-center text-muted-foreground">
              +{meeting.attendees.length - 4}
            </span>
          )}
        </div>
      </TableCell>

      <TableCell className="pr-5 py-3 align-middle text-right">
        <div className="flex items-center justify-end gap-3 text-[12px] text-muted-foreground tabular-nums">
          <ItemCount icon={Gavel} count={counts.decision} />
          <ItemCount icon={AlertTriangle} count={counts.issue} />
          <ItemCount icon={CheckSquare} count={counts.action} />
        </div>
      </TableCell>
    </TableRow>
  );
}

function ItemCount({
  icon: Icon,
  count,
}: {
  icon: typeof CheckSquare;
  count: number;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1",
        count === 0 && "opacity-40",
      )}
    >
      <Icon className="size-3.5" />
      {count}
    </span>
  );
}

function StatusBadge({ status }: { status: MeetingStatus }) {
  const map = {
    Scheduled:
      "bg-blue-500/10 text-blue-700 dark:text-blue-400 ring-blue-500/20",
    Live: "bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-rose-500/30",
    Completed:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-emerald-500/20",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full ring-1 ring-inset",
        map[status],
      )}
    >
      {status === "Live" ? (
        <span className="size-1.5 rounded-full bg-rose-500 animate-pulse" />
      ) : (
        <span className="size-1.5 rounded-full bg-current" />
      )}
      {status}
    </span>
  );
}
