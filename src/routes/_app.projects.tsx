import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, FolderKanban, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/projects")({
  head: () => ({
    meta: [
      { title: "Projects — Mango Tech" },
      { name: "description", content: "All projects in your workspace." },
    ],
  }),
  component: ProjectsPage,
});

const projects = [
  {
    id: "marketing",
    name: "Marketing",
    description: "Q2 campaign and launch coordination",
    color: "oklch(0.62 0.24 350)",
    status: "Active",
    phase: "Execution",
    openItems: 12,
    members: 6,
  },
  {
    id: "product",
    name: "Product",
    description: "Roadmap, backlog and release planning",
    color: "oklch(0.62 0.18 245)",
    status: "Active",
    phase: "Discovery",
    openItems: 8,
    members: 9,
  },
  {
    id: "qe",
    name: "Quality Engineering",
    description: "Testing strategy and regression coverage",
    color: "oklch(0.65 0.18 152)",
    status: "Active",
    phase: "Initiation",
    openItems: 4,
    members: 3,
  },
  {
    id: "design",
    name: "Design System",
    description: "Component library and design tokens",
    color: "oklch(0.78 0.16 75)",
    status: "On hold",
    phase: "Planning",
    openItems: 2,
    members: 4,
  },
];

function ProjectsPage() {
  return (
    <div className="px-6 py-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pick a project to open its dashboard.
          </p>
        </div>
        <Button>
          <Plus className="size-4" />
          New project
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((p) => (
          <Link
            key={p.id}
            to="/projects"
            className="group relative bg-card border border-border rounded-xl p-5 hover:border-foreground/20 hover:shadow-sm transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="size-10 rounded-lg grid place-items-center text-white shrink-0"
                style={{ backgroundColor: p.color }}
              >
                <FolderKanban className="size-5" />
              </div>
              <button
                onClick={(e) => e.preventDefault()}
                className="size-7 rounded-md hover:bg-muted grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="size-4" />
              </button>
            </div>
            <h3 className="font-semibold text-base">{p.name}</h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{p.description}</p>

            <div className="flex items-center gap-2 mt-4">
              <Badge
                variant="secondary"
                className={
                  p.status === "Active"
                    ? "bg-success/15 text-success hover:bg-success/15"
                    : "bg-muted text-muted-foreground"
                }
              >
                {p.status}
              </Badge>
              <Badge variant="outline" className="font-normal">
                {p.phase}
              </Badge>
            </div>

            <div className="flex items-center justify-between mt-5 pt-4 border-t border-border text-xs text-muted-foreground">
              <span>
                <span className="font-medium text-foreground">{p.openItems}</span> open items
              </span>
              <span>
                <span className="font-medium text-foreground">{p.members}</span> members
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
