import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  CheckSquare,
  AlertTriangle,
  Gavel,
  CalendarClock,
  ArrowLeft,
  Users,
  Settings,
  Plus,
  Activity,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  getProject,
  recentActivity,
  upcomingMeetings,
  type ActivityEvent,
} from "@/lib/mock/projects";

export const Route = createFileRoute("/_app/projects/$projectId")({
  head: ({ params }) => {
    const project = getProject(params.projectId);
    const title = project ? `${project.name} — Dashboard` : "Project — Dashboard";
    return {
      meta: [
        { title },
        {
          name: "description",
          content: project?.description ?? "Project dashboard",
        },
      ],
    };
  },
  loader: ({ params }) => {
    const project = getProject(params.projectId);
    if (!project) throw notFound();
    return { project };
  },
  notFoundComponent: () => (
    <div className="px-6 py-10 max-w-3xl mx-auto text-center">
      <h1 className="text-xl font-semibold">Project not found</h1>
      <p className="text-sm text-muted-foreground mt-1">
        This project doesn't exist or was removed.
      </p>
      <Link
        to="/projects"
        className="inline-flex items-center gap-2 mt-4 text-sm text-primary hover:underline"
      >
        <ArrowLeft className="size-4" /> Back to projects
      </Link>
    </div>
  ),
  errorComponent: ({ error, reset }) => (
    <div className="px-6 py-10 max-w-3xl mx-auto text-center">
      <h1 className="text-xl font-semibold">Couldn't load project</h1>
      <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
      <Button onClick={reset} className="mt-4">Try again</Button>
    </div>
  ),
  component: ProjectDashboard,
});

function ProjectDashboard() {
  const { project } = Route.useLoaderData();
  const activity = recentActivity[project.id] ?? [];
  const meetings = upcomingMeetings[project.id] ?? [];

  const metrics = [
    {
      label: "Open Action Items",
      value: project.openActionItems,
      icon: CheckSquare,
      iconClass: "bg-info/15 text-info",
    },
    {
      label: "Open Issues",
      value: project.openIssues,
      icon: AlertTriangle,
      iconClass: "bg-destructive/15 text-destructive",
    },
    {
      label: "Recent Decisions",
      value: project.recentDecisions,
      icon: Gavel,
      iconClass: "bg-success/15 text-success",
    },
    {
      label: "Upcoming Meetings",
      value: project.upcomingMeetings,
      icon: CalendarClock,
      iconClass: "bg-warning/20 text-warning-foreground",
    },
  ];

  return (
    <div className="px-6 py-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Link to="/projects" className="hover:text-foreground transition-colors">
          Projects
        </Link>
        <span>/</span>
        <span className="text-foreground">{project.name}</span>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div className="flex items-start gap-3">
          <div
            className="size-12 rounded-xl grid place-items-center text-white shrink-0"
            style={{ backgroundColor: project.color }}
          >
            <span className="text-base font-semibold">
              {project.name.charAt(0)}
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-semibold tracking-tight">
                {project.name}
              </h1>
              <Badge
                variant="secondary"
                className={
                  project.status === "Active"
                    ? "bg-success/15 text-success hover:bg-success/15"
                    : "bg-muted text-muted-foreground"
                }
              >
                {project.status}
              </Badge>
              <Badge variant="outline" className="font-normal">
                {project.phase}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {project.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 pr-3 border-r border-border">
            <Avatar className="size-7">
              <AvatarFallback className="text-[11px] bg-muted">
                {project.owner.initials}
              </AvatarFallback>
            </Avatar>
            <div className="text-xs">
              <div className="text-muted-foreground">Owner</div>
              <div className="font-medium">{project.owner.name}</div>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Users className="size-4" /> Directory
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="size-4" /> Settings
          </Button>
          <Button size="sm">
            <Plus className="size-4" /> New
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="bg-card border border-border rounded-xl p-4 hover:border-foreground/20 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span
                className={`size-8 rounded-lg grid place-items-center bg-${m.tone}/10 text-${m.tone}`}
              >
                <m.icon className="size-4" />
              </span>
            </div>
            <div className="mt-3 text-2xl font-semibold">{m.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Two-column body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Activity timeline */}
        <section className="lg:col-span-2 bg-card border border-border rounded-xl">
          <header className="flex items-center justify-between px-5 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Activity className="size-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Recent activity</h2>
            </div>
            <button className="text-xs text-muted-foreground hover:text-foreground">
              View all
            </button>
          </header>
          {activity.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No activity yet for this project.
            </div>
          ) : (
            <ol className="divide-y divide-border">
              {activity.map((e) => (
                <ActivityRow key={e.id} event={e} />
              ))}
            </ol>
          )}
        </section>

        {/* Status + meetings */}
        <div className="space-y-4">
          <section className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="size-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">Project status</h2>
              </div>
              <HealthBadge health={project.health} />
            </div>
            <div className="text-xs text-muted-foreground mb-1.5">
              Progress
            </div>
            <Progress value={project.progress} className="h-2" />
            <div className="mt-1 text-xs font-medium">{project.progress}%</div>

            <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-border text-xs">
              <Stat label="Phase" value={project.phase} />
              <Stat label="Members" value={String(project.members)} />
              <Stat label="Decisions" value={String(project.recentDecisions)} />
              <Stat label="Issues" value={String(project.openIssues)} />
            </div>
          </section>

          <section className="bg-card border border-border rounded-xl">
            <header className="flex items-center justify-between px-5 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <CalendarClock className="size-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">Upcoming meetings</h2>
              </div>
            </header>
            {meetings.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No meetings scheduled.
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {meetings.map((m) => (
                  <li key={m.id} className="px-5 py-3 hover:bg-muted/40 cursor-pointer">
                    <div className="text-sm font-medium">{m.title}</div>
                    <div className="flex items-center justify-between mt-0.5 text-xs text-muted-foreground">
                      <span>{m.when}</span>
                      <span>{m.attendees} attendees</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function HealthBadge({ health }: { health: "On track" | "At risk" | "Off track" }) {
  const cls =
    health === "On track"
      ? "bg-success/15 text-success"
      : health === "At risk"
        ? "bg-warning/20 text-warning-foreground"
        : "bg-destructive/15 text-destructive";
  return (
    <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${cls}`}>
      {health}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-muted-foreground">{label}</div>
      <div className="font-medium text-foreground mt-0.5 truncate">{value}</div>
    </div>
  );
}

function ActivityRow({ event }: { event: ActivityEvent }) {
  const meta = activityMeta(event.type);
  return (
    <li className="px-5 py-3 flex items-start gap-3">
      <span
        className={`size-7 rounded-full grid place-items-center shrink-0 ${meta.bg} ${meta.fg}`}
      >
        <meta.icon className="size-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm">
          <span className="font-medium">{event.actor.name}</span>{" "}
          <span className="text-muted-foreground">{meta.verb}</span>{" "}
          <span>{event.title}</span>
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {event.timestamp}
        </div>
      </div>
    </li>
  );
}

function activityMeta(type: ActivityEvent["type"]) {
  switch (type) {
    case "decision":
      return { icon: Gavel, bg: "bg-success/15", fg: "text-success", verb: "decided" };
    case "action":
      return { icon: CheckSquare, bg: "bg-info/15", fg: "text-info", verb: "added action" };
    case "issue":
      return { icon: AlertTriangle, bg: "bg-destructive/15", fg: "text-destructive", verb: "raised issue" };
    case "meeting":
      return { icon: CalendarClock, bg: "bg-warning/20", fg: "text-warning-foreground", verb: "scheduled" };
    case "member":
      return { icon: Users, bg: "bg-muted", fg: "text-foreground", verb: "" };
  }
}
