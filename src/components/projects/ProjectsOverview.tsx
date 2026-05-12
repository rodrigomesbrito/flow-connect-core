import { FolderKanban, AlertTriangle, ListChecks, CalendarClock } from "lucide-react";
import type { Project } from "@/lib/mock/projects";

export function ProjectsOverview({ projects }: { projects: Project[] }) {
  const active = projects.filter((p) => p.status === "Active").length;
  const issues = projects.reduce((s, p) => s + p.openIssues, 0);
  const tasks = projects.reduce((s, p) => s + p.pendingTasks, 0);
  const meetings = projects.reduce((s, p) => s + p.meetingsThisWeek, 0);

  const cards = [
    { label: "Active Projects", value: active, icon: FolderKanban, iconClass: "bg-info/15 text-info" },
    { label: "Open Issues", value: issues, icon: AlertTriangle, iconClass: "bg-destructive/15 text-destructive" },
    { label: "Pending Tasks", value: tasks, icon: ListChecks, iconClass: "bg-success/15 text-success" },
    { label: "Meetings This Week", value: meetings, icon: CalendarClock, iconClass: "bg-warning/20 text-warning-foreground" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {cards.map((c) => (
        <div
          key={c.label}
          className="bg-card border border-border rounded-xl p-4 hover:border-foreground/20 transition-colors"
        >
          <div className={`size-9 rounded-lg grid place-items-center ${c.iconClass}`}>
            <c.icon className="size-4" />
          </div>
          <div className="mt-3 text-2xl font-semibold leading-tight">{c.value}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{c.label}</div>
        </div>
      ))}
    </div>
  );
}
