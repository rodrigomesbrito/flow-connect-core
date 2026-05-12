import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, FolderSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectsOverview } from "@/components/projects/ProjectsOverview";
import {
  ProjectsToolbar,
  defaultFilters,
  type ProjectFilters,
} from "@/components/projects/ProjectsToolbar";
import { projects } from "@/lib/mock/projects";

export const Route = createFileRoute("/_app/projects/")({
  head: () => ({
    meta: [
      { title: "Projects — Mango Tech" },
      { name: "description", content: "Manage and track all active projects." },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const [filters, setFilters] = useState<ProjectFilters>(defaultFilters);

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return projects.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q)) return false;
      if (filters.status !== "All" && p.status !== filters.status) return false;
      if (filters.phase !== "All" && p.phase !== filters.phase) return false;
      if (filters.owner !== "All" && p.ownerOrg !== filters.owner) return false;
      return true;
    });
  }, [filters]);

  return (
    <div className="px-6 py-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and track all active projects.
          </p>
        </div>
        <Button>
          <Plus className="size-4" />
          New Project
        </Button>
      </div>

      <ProjectsToolbar filters={filters} onChange={setFilters} />

      <ProjectsOverview projects={filtered} />

      {filtered.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl py-16 px-6 text-center">
          <div className="size-12 rounded-full bg-muted grid place-items-center mx-auto mb-3 text-muted-foreground">
            <FolderSearch className="size-5" />
          </div>
          <h3 className="text-sm font-semibold">No projects match your filters</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Try adjusting search or clearing filters.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => setFilters(defaultFilters)}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}
