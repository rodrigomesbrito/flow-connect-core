import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  CheckSquare,
  AlertTriangle,
  Gavel,
  CalendarClock,
  Users,
  Settings,
  Plus,
  Activity,
  ArrowRight,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { AvatarStack } from "@/components/projects/AvatarStack";
import { KpiRow, KpiStat } from "@/components/data/KpiStat";
import { EmptyState } from "@/components/data/EmptyState";
import {
  getProject,
  recentActivity,
  upcomingMeetings,
  type ActivityEvent,
} from "@/lib/mock/projects";

export const Route = createFileRoute("/_app/projects/$projectId/")({
  loader: ({ params }) => {
    const project = getProject(params.projectId);
    if (!project) throw notFound();
    return { project };
  },
  component: ProjectDashboard,
});

function ProjectDashboard() {
  const { project } = Route.useLoaderData();
  const activity = recentActivity[project.id] ?? [];
  const meetings = upcomingMeetings[project.id] ?? [];

  return (
    <div className="px-6 py-6 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-5">
        <Link to="/projects" className="hover:text-foreground transition-colors">
          Projects
        </Link>
        <ChevronRight className="size-3" />
        <span className="text-foreground font-medium">{project.name}</span>
      </nav>

      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className="size-11 rounded-xl grid place-items-center text-white shrink-0 shadow-sm"
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
              <StatusPill status={project.status} />
              <Badge
                variant="outline"
                className="font-normal text-xs h-5"
              >
                {project.phase}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              {project.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link to="/people">
            <Button variant="outline" size="sm" className="h-8">
              <Users className="size-3.5" /> People
            </Button>
          </Link>
          <Link
            to="/projects/$projectId/settings"
            params={{ projectId: project.id }}
          >
            <Button variant="outline" size="sm" className="h-8">
              <Settings className="size-3.5" />
            </Button>
          </Link>
          <Button size="sm" className="h-8">
            <Plus className="size-3.5" /> New
          </Button>
        </div>
      </header>

      {/* KPIs - now interactive (deep-link to lists) */}
      <KpiRow>
        <Link
          to="/projects/$projectId/action-items"
          params={{ projectId: project.id }}
        >
          <KpiStat
            label="Open Action Items"
            value={project.openActionItems}
            tone="default"
            onClick={() => {}}
          />
        </Link>
        <Link
          to="/projects/$projectId/issues"
          params={{ projectId: project.id }}
        >
          <KpiStat
            label="Open Issues"
            value={project.openIssues}
            tone="destructive"
            onClick={() => {}}
          />
        </Link>
        <Link
          to="/projects/$projectId/decisions"
          params={{ projectId: project.id }}
        >
          <KpiStat
            label="Recent Decisions"
            value={project.recentDecisions}
            tone="success"
            onClick={() => {}}
          />
        </Link>
        <Link
          to="/projects/$projectId/meetings"
          params={{ projectId: project.id }}
        >
          <KpiStat
            label="Upcoming Meetings"
            value={project.upcomingMeetings}
            tone="warning"
            onClick={() => {}}
          />
        </Link>
      </KpiRow>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent activity */}
        <section className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
          <header className="flex items-center justify-between px-5 h-11 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <Activity className="size-3.5 text-muted-foreground" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Recent activity
              </h2>
            </div>
            <button className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
              View all <ArrowRight className="size-3" />
            </button>
          </header>
          {activity.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="No activity yet"
              description="Decisions, issues and tasks will appear here as the team works."
              className="border-0 rounded-none"
            />
          ) : (
            <ol className="divide-y divide-border">
              {activity.map((e) => (
                <ActivityRow key={e.id} event={e} />
              ))}
            </ol>
          )}
        </section>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Project status */}
          <section className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Project status
              </h2>
              <HealthBadge health={project.health} />
            </div>

            <div className="flex items-baseline justify-between mb-2">
              <span className="text-xs text-muted-foreground">Progress</span>
              <span className="text-sm font-semibold tabular-nums">
                {project.progress}%
              </span>
            </div>
            <Progress value={project.progress} className="h-1.5" />

            <div className="mt-5 pt-4 border-t border-border space-y-3">
              <SidebarRow label="Owner">
                <div className="flex items-center gap-2">
                  <Avatar className="size-5">
                    <AvatarFallback className="text-[10px] bg-muted">
                      {project.owner.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium truncate">
                    {project.owner.name}
                  </span>
                </div>
              </SidebarRow>
              <SidebarRow label="Team">
                <div className="flex items-center gap-2">
                  <AvatarStack people={project.participants} max={4} />
                  <span className="text-xs text-muted-foreground">
                    {project.members} members
                  </span>
                </div>
              </SidebarRow>
              <SidebarRow label="Phase">
                <span className="text-sm font-medium">{project.phase}</span>
              </SidebarRow>
              <SidebarRow label="Updated">
                <span className="text-sm text-muted-foreground">
                  {project.lastUpdated}
                </span>
              </SidebarRow>
            </div>
          </section>

          {/* Upcoming meetings */}
          <section className="bg-card border border-border rounded-xl overflow-hidden">
            <header className="flex items-center justify-between px-5 h-11 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <CalendarClock className="size-3.5 text-muted-foreground" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Upcoming meetings
                </h2>
              </div>
              <Link
                to="/projects/$projectId/meetings"
                params={{ projectId: project.id }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
              >
                All <ArrowRight className="size-3" />
              </Link>
            </header>
            {meetings.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No meetings scheduled.
                </p>
                <Link
                  to="/projects/$projectId/meetings"
                  params={{ projectId: project.id }}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  <Plus className="size-3" /> New meeting
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {meetings.map((m) => (
                  <li
                    key={m.id}
                    className="group px-5 py-3 hover:bg-muted/40 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-medium truncate">
                        {m.title}
                      </div>
                      <ArrowRight className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex items-center justify-between mt-0.5 text-xs text-muted-foreground">
                      <span>{m.when}</span>
                      <span className="tabular-nums">
                        {m.attendees} attendees
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Quick actions */}
          <section className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="size-3.5 text-muted-foreground" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Quick actions
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <QuickAction
                to="/projects/$projectId/action-items"
                projectId={project.id}
                icon={CheckSquare}
                label="New action"
              />
              <QuickAction
                to="/projects/$projectId/issues"
                projectId={project.id}
                icon={AlertTriangle}
                label="Log issue"
              />
              <QuickAction
                to="/projects/$projectId/decisions"
                projectId={project.id}
                icon={Gavel}
                label="Decision"
              />
              <QuickAction
                to="/projects/$projectId/meetings"
                projectId={project.id}
                icon={CalendarClock}
                label="Meeting"
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    Active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-emerald-500/20",
    Planning: "bg-blue-500/10 text-blue-700 dark:text-blue-400 ring-blue-500/20",
    "On Hold": "bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-amber-500/20",
    Completed: "bg-muted text-muted-foreground ring-border",
  };
  const cls = map[status] ?? "bg-muted text-muted-foreground ring-border";
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full ring-1 ring-inset ${cls}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

function HealthBadge({
  health,
}: {
  health: "On track" | "At risk" | "Off track";
}) {
  const map = {
    "On track": "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    "At risk": "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    "Off track": "bg-rose-500/10 text-rose-700 dark:text-rose-400",
  } as const;
  return (
    <span
      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${map[health]}`}
    >
      {health}
    </span>
  );
}

function SidebarRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function QuickAction({
  to,
  projectId,
  icon: Icon,
  label,
}: {
  to: string;
  projectId: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      to={to as "/projects/$projectId"}
      params={{ projectId }}
      className="group flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:border-foreground/20 hover:bg-muted/40 transition-all"
    >
      <Icon className="size-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
      <span className="text-xs font-medium truncate">{label}</span>
    </Link>
  );
}

function ActivityRow({ event }: { event: ActivityEvent }) {
  const meta = activityMeta(event.type);
  return (
    <li className="px-5 py-3 flex items-start gap-3 hover:bg-muted/30 transition-colors">
      <span
        className={`size-7 rounded-full grid place-items-center shrink-0 ${meta.bg} ${meta.fg}`}
      >
        <meta.icon className="size-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm leading-snug">
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
      return {
        icon: Gavel,
        bg: "bg-emerald-500/10",
        fg: "text-emerald-600 dark:text-emerald-400",
        verb: "decided",
      };
    case "action":
      return {
        icon: CheckSquare,
        bg: "bg-blue-500/10",
        fg: "text-blue-600 dark:text-blue-400",
        verb: "added action",
      };
    case "issue":
      return {
        icon: AlertTriangle,
        bg: "bg-rose-500/10",
        fg: "text-rose-600 dark:text-rose-400",
        verb: "raised issue",
      };
    case "meeting":
      return {
        icon: CalendarClock,
        bg: "bg-amber-500/10",
        fg: "text-amber-700 dark:text-amber-400",
        verb: "scheduled",
      };
    case "member":
      return {
        icon: Users,
        bg: "bg-muted",
        fg: "text-foreground",
        verb: "",
      };
  }
}
