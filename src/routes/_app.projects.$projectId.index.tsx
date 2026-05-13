import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  CheckSquare,
  AlertTriangle,
  Gavel,
  CalendarClock,
  Users,
  Plus,
  Activity,
  ArrowRight,
  ChevronRight,
  DollarSign,
  TrendingUp,
  FileText,
  Receipt,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { AvatarStack } from "@/components/projects/AvatarStack";
import { KpiRow, KpiStat } from "@/components/data/KpiStat";
import { EmptyState } from "@/components/data/EmptyState";
import { getProject } from "@/lib/mock/projects";
import { useActionItemStats } from "@/lib/action-items/store";
import { useIssueStats } from "@/lib/issues/store";
import { useDecisionStats } from "@/lib/decisions/store";
import { useMeetings } from "@/lib/meetings/store";
import { ensureSeeded } from "@/lib/meetings/seed";
import { useActivity, seedAllActivity, type ActivityEvent } from "@/lib/activity/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/projects/$projectId/")(
  {
    loader: ({ params }) => {
      const project = getProject(params.projectId);
      if (!project) throw notFound();
      return { project };
    },
    component: ProjectDashboard,
  },
);

/* ------------------------------------------------------------------ */
/*  Currency formatter                                                  */
/* ------------------------------------------------------------------ */

const fmtCurrency = (value: number) => {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
};

/* ------------------------------------------------------------------ */
/*  Dashboard                                                          */
/* ------------------------------------------------------------------ */

function ProjectDashboard() {
  const { project } = Route.useLoaderData();

  // Ensure seed data is loaded
  useEffect(() => {
    ensureSeeded(project.id);
    seedAllActivity();
  }, [project.id]);

  // Live stats from stores
  const actionStats = useActionItemStats(project.id);
  const issueStats = useIssueStats(project.id);
  const decisionStats = useDecisionStats(project.id);
  const meetings = useMeetings(project.id);
  const activity = useActivity(project.id);

  // Upcoming meetings = scheduled ones
  const upcomingMeetings = meetings.filter((m) => m.status === "Scheduled");

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
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4 min-w-0">
          <div
            className="size-14 rounded-2xl grid place-items-center text-white shrink-0 shadow-sm ring-1 ring-black/5 dark:ring-white/10"
            style={{ backgroundColor: project.color }}
          >
            <span className="text-xl font-bold">
              {project.name.charAt(0)}
            </span>
          </div>
          <div className="min-w-0 flex flex-col justify-center">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-[28px] font-bold tracking-tight leading-none text-foreground">
                {project.name}
              </h1>
              <StatusPill status={project.status} />
              <Badge
                variant="outline"
                className="font-medium text-[11px] h-6 px-2.5 rounded-full border-border/60 bg-muted/10 text-muted-foreground"
              >
                {project.phase}
              </Badge>
            </div>
            <p className="text-[14px] text-muted-foreground mt-2 max-w-2xl leading-snug">
              {project.description}
            </p>
          </div>
        </div>
      </header>

      {/* Operational KPIs — live from stores */}
      <KpiRow>
        <Link
          to="/projects/$projectId/action-items"
          params={{ projectId: project.id }}
        >
          <KpiStat
            label="Open Actions"
            value={actionStats.open + actionStats.inProgress}
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
            value={issueStats.open + issueStats.inReview}
            tone="destructive"
            onClick={() => {}}
          />
        </Link>
        <Link
          to="/projects/$projectId/decisions"
          params={{ projectId: project.id }}
        >
          <KpiStat
            label="Decisions"
            value={decisionStats.total}
            tone="success"
            onClick={() => {}}
          />
        </Link>
        <Link
          to="/projects/$projectId/meetings"
          params={{ projectId: project.id }}
        >
          <KpiStat
            label="Upcoming"
            value={upcomingMeetings.length}
            tone="warning"
            onClick={() => {}}
          />
        </Link>
      </KpiRow>

      {/* Financial KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <FinancialCard
          icon={FileText}
          label="Contract Original"
          value={fmtCurrency(project.financial.contractOriginalValue)}
        />
        <FinancialCard
          icon={Receipt}
          label="Pay App Approved"
          value={fmtCurrency(project.financial.totalPayAppApproved)}
          subtext={
            project.financial.contractOriginalValue > 0
              ? `${Math.round((project.financial.totalPayAppApproved / project.financial.contractOriginalValue) * 100)}% of contract`
              : undefined
          }
        />
        <FinancialCard
          icon={TrendingUp}
          label="Addendum Value"
          value={fmtCurrency(project.financial.addendumValue)}
        />
        <FinancialCard
          icon={DollarSign}
          label="Total Contract"
          value={fmtCurrency(project.financial.totalProjectContract)}
          highlight
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent activity */}
        <section className="lg:col-span-2 bg-card border border-border/40 rounded-[14px] shadow-sm overflow-hidden flex flex-col">
          <header className="flex items-center justify-between px-5 h-12 border-b border-border/40 bg-muted/10">
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-md bg-background border border-border/50 grid place-items-center">
                <Activity className="size-3.5 text-muted-foreground" />
              </div>
              <h2 className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                Recent activity
              </h2>
            </div>
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
              {activity.slice(0, 6).map((e) => (
                <ActivityRow key={e.id} event={e} />
              ))}
            </ol>
          )}
        </section>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Project status */}
          <section className="bg-card border border-border/40 rounded-[14px] shadow-sm overflow-hidden">
            <div className="p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Project health
                </h2>
                <HealthBadge health={project.health} />
              </div>

              <div className="bg-muted/20 border border-border/40 rounded-lg p-3.5 mb-2">
                <div className="flex items-baseline justify-between mb-2.5">
                  <span className="text-[13px] font-medium text-foreground">Progress</span>
                  <span className="text-[14px] font-bold text-foreground tabular-nums tracking-tight">
                    {project.progress}%
                  </span>
                </div>
                <Progress value={project.progress} className="h-2 bg-muted/50" />
              </div>

              <div className="mt-6 pt-5 border-t border-border/40 space-y-4">
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
            </div>
          </section>

          {/* Upcoming meetings — live from store */}
          <section className="bg-card border border-border/40 rounded-[14px] shadow-sm overflow-hidden">
            <header className="flex items-center justify-between px-5 h-12 border-b border-border/40 bg-muted/10">
              <div className="flex items-center gap-2">
                <div className="size-6 rounded-md bg-background border border-border/50 grid place-items-center">
                  <CalendarClock className="size-3.5 text-muted-foreground" />
                </div>
                <h2 className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
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
            {upcomingMeetings.length === 0 ? (
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
                {upcomingMeetings.slice(0, 3).map((m) => (
                  <li
                    key={m.id}
                    className="group px-5 py-3.5 hover:bg-muted/30 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-[13px] font-semibold truncate group-hover:text-primary transition-colors">
                        {m.title}
                      </div>
                      <ArrowRight className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-1 group-hover:translate-x-0" />
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[12px] text-muted-foreground font-medium">
                      <span>{new Date(m.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
                      <span className="tabular-nums opacity-70">
                        {m.attendees.length} attendees
                      </span>
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

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function FinancialCard({
  icon: Icon,
  label,
  value,
  subtext,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  subtext?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "bg-card border rounded-[14px] p-5 transition-all duration-200 group hover:shadow-sm",
        highlight ? "border-primary/20 bg-gradient-to-br from-primary/[0.03] to-transparent shadow-sm" : "border-border/50"
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className={cn(
          "size-7 rounded-lg grid place-items-center",
          highlight ? "bg-primary/10 text-primary" : "bg-muted/50 text-muted-foreground"
        )}>
          <Icon className="size-3.5" />
        </div>
        <span className="text-[12px] text-muted-foreground font-semibold uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div
        className={cn(
          "text-[22px] font-bold tracking-tight tabular-nums mt-1",
          highlight ? "text-primary" : "text-foreground"
        )}
      >
        {value}
      </div>
      {subtext && (
        <div className="text-[12px] text-muted-foreground mt-1.5 font-medium">
          {subtext}
        </div>
      )}
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
      <span className="text-[13px] font-medium text-muted-foreground">{label}</span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function ActivityRow({ event }: { event: ActivityEvent }) {
  const meta = activityMeta(event.type);
  return (
    <li className="px-5 py-4 flex items-start gap-4 hover:bg-muted/20 transition-colors">
      <span
        className={`size-8 rounded-full grid place-items-center shrink-0 border border-border/50 ${meta.bg} ${meta.fg}`}
      >
        <meta.icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="text-[13px] leading-snug text-foreground/80">
          <span className="font-semibold text-foreground">{event.actor.name}</span>{" "}
          <span className="text-muted-foreground">{meta.verb}</span>{" "}
          <span className="font-medium text-foreground">{event.title}</span>
        </div>
        <div className="text-[11px] text-muted-foreground mt-1 font-medium tracking-wide">
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
