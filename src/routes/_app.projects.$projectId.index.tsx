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
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const fmtCurrency = (value: number) => {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
};

const fmtMeetingDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

/* ------------------------------------------------------------------ */
/*  Dashboard                                                          */
/* ------------------------------------------------------------------ */

function ProjectDashboard() {
  const { project } = Route.useLoaderData();

  useEffect(() => {
    ensureSeeded(project.id);
    seedAllActivity();
  }, [project.id]);

  const actionStats = useActionItemStats(project.id);
  const issueStats = useIssueStats(project.id);
  const decisionStats = useDecisionStats(project.id);
  const meetings = useMeetings(project.id);
  const activity = useActivity(project.id);

  const upcomingMeetings = meetings.filter((m) => m.status === "Scheduled");

  const openActions = actionStats.open + actionStats.inProgress;
  const openIssues = issueStats.open + issueStats.inReview;

  const contractRatio =
    project.financial.contractOriginalValue > 0
      ? Math.round(
          (project.financial.totalPayAppApproved /
            project.financial.contractOriginalValue) *
            100,
        )
      : 0;

  return (
    <div className="px-6 py-6 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
        <Link to="/projects" className="hover:text-foreground transition-colors">
          Projects
        </Link>
        <ChevronRight className="size-3" />
        <span className="text-foreground font-medium">{project.name}</span>
      </nav>

      {/* Header — slim, dense */}
      <header className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-3.5 min-w-0">
          <div
            className="size-11 rounded-xl grid place-items-center text-white shrink-0 shadow-sm ring-1 ring-black/5 dark:ring-white/10"
            style={{ backgroundColor: project.color }}
          >
            <span className="text-base font-bold">
              {project.name.charAt(0)}
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-[22px] font-semibold tracking-tight leading-none text-foreground">
                {project.name}
              </h1>
              <StatusPill status={project.status} />
              <Badge
                variant="outline"
                className="font-medium text-[11px] h-5 px-2 rounded-full border-border/60 bg-muted/10 text-muted-foreground"
              >
                {project.phase}
              </Badge>
              <HealthBadge health={project.health} />
            </div>
            <p className="text-[13px] text-muted-foreground mt-1.5 max-w-2xl leading-snug line-clamp-1">
              {project.description}
            </p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <QuickAction
            to="/projects/$projectId/meetings"
            params={{ projectId: project.id }}
            icon={CalendarClock}
            label="Meeting"
          />
          <QuickAction
            to="/projects/$projectId/action-items"
            params={{ projectId: project.id }}
            icon={CheckSquare}
            label="Action"
          />
          <QuickAction
            to="/projects/$projectId/issues"
            params={{ projectId: project.id }}
            icon={AlertTriangle}
            label="Issue"
          />
        </div>
      </header>

      {/* Operational KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <OpKpi
          to="/projects/$projectId/action-items"
          projectId={project.id}
          icon={CheckSquare}
          label="Open Actions"
          value={openActions}
          breakdown={`${actionStats.inProgress} in progress · ${actionStats.overdue} overdue`}
          tone={actionStats.overdue > 0 ? "warning" : "default"}
        />
        <OpKpi
          to="/projects/$projectId/issues"
          projectId={project.id}
          icon={AlertTriangle}
          label="Open Issues"
          value={openIssues}
          breakdown={`${issueStats.blocking} blocking · ${issueStats.inReview} in review`}
          tone={issueStats.blocking > 0 ? "destructive" : "default"}
        />
        <OpKpi
          to="/projects/$projectId/decisions"
          projectId={project.id}
          icon={Gavel}
          label="Decisions"
          value={decisionStats.total}
          breakdown={`${decisionStats.approved} approved · ${decisionStats.proposed} proposed`}
          tone="default"
        />
        <OpKpi
          to="/projects/$projectId/meetings"
          projectId={project.id}
          icon={CalendarClock}
          label="Upcoming Meetings"
          value={upcomingMeetings.length}
          breakdown={
            upcomingMeetings[0]
              ? `Next: ${fmtMeetingDate(upcomingMeetings[0].date)}`
              : "Nothing scheduled"
          }
          tone="default"
        />
      </div>

      {/* Financial summary */}
      <SectionHeader
        title="Financials"
        hint={`${contractRatio}% of contract approved`}
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
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
              ? `${contractRatio}% of contract`
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
          <header className="flex items-center justify-between px-5 h-11 border-b border-border/40">
            <div className="flex items-center gap-2">
              <Activity className="size-3.5 text-muted-foreground" />
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
            <ol className="divide-y divide-border/60">
              {activity.slice(0, 7).map((e) => (
                <ActivityRow key={e.id} event={e} />
              ))}
            </ol>
          )}
        </section>

        {/* Sidebar */}
        <aside className="space-y-4">
          {/* Progress + meta */}
          <section className="bg-card border border-border/40 rounded-[14px] shadow-sm p-5">
            <div className="flex items-baseline justify-between mb-2">
              <h2 className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                Progress
              </h2>
              <span className="text-[13px] font-semibold text-foreground tabular-nums">
                {project.progress}%
              </span>
            </div>
            <Progress value={project.progress} className="h-1.5 bg-muted/50" />

            <div className="mt-5 pt-4 border-t border-border/40 space-y-3">
              <SidebarRow label="Owner">
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar className="size-5">
                    <AvatarFallback className="text-[10px] bg-muted">
                      {project.owner.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-[13px] font-medium truncate">
                    {project.owner.name}
                  </span>
                </div>
              </SidebarRow>
              <SidebarRow label="Team">
                <div className="flex items-center gap-2">
                  <AvatarStack people={project.participants} max={4} />
                  <span className="text-[12px] text-muted-foreground tabular-nums">
                    {project.members}
                  </span>
                </div>
              </SidebarRow>
              <SidebarRow label="Updated">
                <span className="text-[13px] text-muted-foreground">
                  {project.lastUpdated}
                </span>
              </SidebarRow>
            </div>
          </section>

          {/* Upcoming meetings */}
          <section className="bg-card border border-border/40 rounded-[14px] shadow-sm overflow-hidden">
            <header className="flex items-center justify-between px-5 h-11 border-b border-border/40">
              <div className="flex items-center gap-2">
                <CalendarClock className="size-3.5 text-muted-foreground" />
                <h2 className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Upcoming
                </h2>
              </div>
              <Link
                to="/projects/$projectId/meetings"
                params={{ projectId: project.id }}
                className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-0.5"
              >
                All <ArrowRight className="size-3" />
              </Link>
            </header>
            {upcomingMeetings.length === 0 ? (
              <div className="px-5 py-6 text-center">
                <p className="text-[13px] text-muted-foreground">
                  Nothing scheduled.
                </p>
                <Link
                  to="/projects/$projectId/meetings"
                  params={{ projectId: project.id }}
                  className="mt-2 inline-flex items-center gap-1 text-[12px] font-medium text-primary hover:underline"
                >
                  <Plus className="size-3" /> Schedule meeting
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-border/60">
                {upcomingMeetings.slice(0, 3).map((m) => (
                  <li key={m.id}>
                    <Link
                      to="/projects/$projectId/meetings/$meetingId"
                      params={{ projectId: project.id, meetingId: m.id }}
                      className="group block px-5 py-3 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-[13px] font-semibold truncate group-hover:text-primary transition-colors">
                          {m.title}
                        </div>
                        <ArrowRight className="size-3.5 text-muted-foreground/0 group-hover:text-muted-foreground transition-all -translate-x-1 group-hover:translate-x-0" />
                      </div>
                      <div className="flex items-center justify-between mt-0.5 text-[11px] text-muted-foreground font-medium">
                        <span>{fmtMeetingDate(m.date)}</span>
                        <span className="tabular-nums opacity-70">
                          {m.attendees.length} attendees
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function SectionHeader({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between mb-3">
      <h2 className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      {hint && (
        <span className="text-[11px] text-muted-foreground tabular-nums">
          {hint}
        </span>
      )}
    </div>
  );
}

function QuickAction({
  to,
  params,
  icon: Icon,
  label,
}: {
  to: string;
  params: Record<string, string>;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      to={to as never}
      params={params as never}
      className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-[12px] font-medium text-foreground bg-card border border-border/60 hover:bg-muted/40 hover:border-border transition-colors"
    >
      <Plus className="size-3" />
      <Icon className="size-3.5 text-muted-foreground" />
      <span>{label}</span>
    </Link>
  );
}

function OpKpi({
  to,
  projectId,
  icon: Icon,
  label,
  value,
  breakdown,
  tone = "default",
}: {
  to: string;
  projectId: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  breakdown: string;
  tone?: "default" | "destructive" | "warning";
}) {
  return (
    <Link
      to={to as never}
      params={{ projectId } as never}
      className="group bg-card border border-border/50 rounded-[14px] p-4 hover:border-foreground/20 hover:shadow-md transition-all"
    >
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        <Icon className="size-3.5 text-muted-foreground/70 group-hover:text-foreground transition-colors" />
      </div>
      <div
        className={cn(
          "text-[26px] font-semibold tracking-tight tabular-nums leading-none",
          tone === "destructive" && value > 0 && "text-rose-600 dark:text-rose-400",
          tone === "warning" && value > 0 && "text-amber-700 dark:text-amber-400",
        )}
      >
        {value}
      </div>
      <div className="text-[11px] text-muted-foreground mt-2 font-medium truncate">
        {breakdown}
      </div>
    </Link>
  );
}

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
        "bg-card border rounded-[14px] p-4 transition-all duration-200",
        highlight
          ? "border-primary/20 bg-gradient-to-br from-primary/[0.03] to-transparent shadow-sm"
          : "border-border/50",
      )}
    >
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
          {label}
        </span>
        <Icon
          className={cn(
            "size-3.5",
            highlight ? "text-primary" : "text-muted-foreground/70",
          )}
        />
      </div>
      <div
        className={cn(
          "text-[22px] font-semibold tracking-tight tabular-nums leading-none",
          highlight ? "text-primary" : "text-foreground",
        )}
      >
        {value}
      </div>
      {subtext && (
        <div className="text-[11px] text-muted-foreground mt-2 font-medium">
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
      <span className="text-[12px] font-medium text-muted-foreground">{label}</span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function ActivityRow({ event }: { event: ActivityEvent }) {
  const meta = activityMeta(event.type);
  return (
    <li className="px-5 py-3 flex items-start gap-3 hover:bg-muted/20 transition-colors">
      <span
        className={`size-7 rounded-full grid place-items-center shrink-0 ${meta.bg} ${meta.fg}`}
      >
        <meta.icon className="size-3.5" />
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="text-[13px] leading-snug text-foreground/80 truncate">
          <span className="font-semibold text-foreground">{event.actor.name}</span>{" "}
          <span className="text-muted-foreground">{meta.verb}</span>{" "}
          <span className="font-medium text-foreground">{event.title}</span>
        </div>
        <div className="text-[11px] text-muted-foreground mt-0.5 font-medium">
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
