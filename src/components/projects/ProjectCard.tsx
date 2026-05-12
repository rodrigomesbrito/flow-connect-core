import { Link } from "@tanstack/react-router";
import { FolderKanban } from "lucide-react";
import type { Project } from "@/lib/mock/projects";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      to="/projects/$projectId"
      params={{ projectId: project.id }}
      className="group flex flex-col bg-card border border-border/60 rounded-xl p-6 hover:border-border hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      <div
        className="size-9 rounded-lg grid place-items-center text-white mb-6"
        style={{ backgroundColor: project.color }}
      >
        <FolderKanban className="size-4.5" />
      </div>

      <h3 className="font-semibold text-base leading-snug tracking-tight">
        {project.name}
      </h3>
      <p className="text-xs text-muted-foreground mt-1">
        {project.phase} Phase
      </p>

      <p className="text-xs text-muted-foreground/70 mt-8">
        Updated {project.lastUpdated.toLowerCase()}
      </p>
    </Link>
  );
}
