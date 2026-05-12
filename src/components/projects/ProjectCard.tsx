import { Link } from "@tanstack/react-router";
import { MoreHorizontal, AlertTriangle, ListChecks, CalendarClock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/status-badge";
import { AvatarStack } from "./AvatarStack";
import type { Project } from "@/lib/mock/projects";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      to="/projects/$projectId"
      params={{ projectId: project.id }}
      className="group relative flex flex-col bg-card border border-border rounded-xl p-5 hover:border-foreground/20 hover:shadow-sm transition-all"
    >
      {/* Top: status + menu */}
      <div className="flex items-center justify-between mb-3">
        <StatusBadge status={project.status} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="size-7 rounded-md hover:bg-muted grid place-items-center text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Project actions"
            >
              <MoreHorizontal className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenuItem>Open Project</DropdownMenuItem>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              Archive
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Identity */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className="size-9 rounded-lg grid place-items-center text-white shrink-0 text-sm font-semibold"
          style={{ backgroundColor: project.color }}
        >
          {project.name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-base leading-snug line-clamp-2">
            {project.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {project.ownerOrg} <span className="opacity-50">•</span> {project.phase}
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <Kpi icon={ListChecks} label={`${project.pendingTasks} Tasks`} />
        <Kpi icon={AlertTriangle} label={`${project.openIssues} Issues`} tone="destructive" />
        <Kpi icon={CalendarClock} label={`${project.meetingsThisWeek} Meetings`} />
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{project.progress}%</span>
        </div>
        <Progress value={project.progress} className="h-1.5" />
      </div>

      {/* Footer */}
      <div className="mt-auto pt-3 border-t border-border flex items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground truncate">
          Last updated {project.lastUpdated}
        </span>
        <AvatarStack people={project.participants} max={3} />
      </div>
    </Link>
  );
}

function Kpi({
  icon: Icon,
  label,
  tone = "default",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  tone?: "default" | "destructive";
}) {
  const cls =
    tone === "destructive"
      ? "bg-destructive/10 text-destructive"
      : "bg-muted text-foreground/80";
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium ${cls}`}>
      <Icon className="size-3" />
      {label}
    </span>
  );
}
