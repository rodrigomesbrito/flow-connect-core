import { Link } from "@tanstack/react-router";
import { FolderKanban, AlertTriangle, ListChecks, CalendarClock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@/lib/mock/projects";

const statusStyles: Record<Project["status"], string> = {
  Active: "bg-success/15 text-success border-transparent",
  Planning: "bg-info/15 text-info border-transparent",
  "On Hold": "bg-muted text-muted-foreground border-transparent",
  Completed: "bg-muted text-muted-foreground border-transparent",
};

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      to="/projects/$projectId"
      params={{ projectId: project.id }}
      className="group flex flex-col bg-card border border-border rounded-xl p-5 hover:border-foreground/20 hover:shadow-sm transition-all"
    >
      <div
        className="size-10 rounded-lg grid place-items-center text-white mb-4"
        style={{ backgroundColor: project.color }}
      >
        <FolderKanban className="size-5" />
      </div>

      <h3 className="font-semibold text-base leading-snug">{project.name}</h3>
      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
        {project.description}
      </p>

      <div className="flex flex-wrap gap-1.5 mt-3">
        <Badge variant="outline" className={`text-[11px] font-medium ${statusStyles[project.status]}`}>
          {project.status}
        </Badge>
        <Badge variant="outline" className="text-[11px] font-medium text-muted-foreground">
          {project.phase}
        </Badge>
      </div>

      <div className="mt-5 pt-4 border-t border-border flex items-center gap-4 text-xs text-muted-foreground">
        <Stat icon={ListChecks} value={project.pendingTasks} label="Tasks" />
        <Stat icon={AlertTriangle} value={project.openIssues} label="Issues" />
        <Stat icon={CalendarClock} value={project.meetingsThisWeek} label="Meetings" />
      </div>
    </Link>
  );
}

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon className="size-3.5" />
      <span className="font-semibold text-foreground">{value}</span>
      <span>{label}</span>
    </span>
  );
}
