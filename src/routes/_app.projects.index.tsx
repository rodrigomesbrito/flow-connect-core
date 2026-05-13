import { useState, useMemo } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Plus, Search, Filter, ArrowUpDown, ChevronRight, MoreHorizontal, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { projects, type Project, type ProjectStatus } from "@/lib/mock/projects";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/projects/")({
  head: () => ({
    meta: [
      { title: "Projects — Relay" },
      { name: "description", content: "Manage and track all active projects." },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "All">("All");

  const filteredProjects = useMemo(() => {
    let list = projects;
    if (statusFilter !== "All") {
      list = list.filter((p) => p.status === statusFilter);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.phase.toLowerCase().includes(q));
    }
    return list;
  }, [query, statusFilter]);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Page Header */}
      <header className="flex-none px-8 py-6 border-b border-border/40">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight text-foreground">Projects</h1>
            <p className="text-[14px] text-muted-foreground mt-1">
              Manage and track all active projects across the organization.
            </p>
          </div>
          <Button asChild className="h-9 px-4 text-[13px] font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md">
            <Link to="/projects/new">
              <Plus className="size-4 mr-2" />
              New Project
            </Link>
          </Button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="flex-none px-8 py-3 border-b border-border/40 bg-muted/10 flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects..."
            className="h-9 w-72 pl-9 text-[13px] bg-background border-border shadow-none focus-visible:ring-1 focus-visible:ring-primary/40 rounded-md"
          />
        </div>
        
        <div className="h-5 w-px bg-border/60 mx-1" />
        
        <div className="flex items-center gap-1">
          {(["All", "Active", "Planning", "On Hold", "Completed"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors",
                statusFilter === status
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Data Grid */}
      <div className="flex-1 overflow-auto p-6 bg-muted/10">
        {filteredProjects.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-[13px]">
            No projects found. Try adjusting your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate({ to: "/projects/$projectId", params: { projectId: project.id } })}
                className="group flex flex-col bg-card border border-border/50 rounded-[14px] p-5 hover:border-border hover:bg-muted/20 cursor-pointer transition-all duration-200"
              >
                {/* Header: Icon + Name + Status + Phase + Menu */}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-start gap-4">
                    <div 
                      className="size-11 rounded-xl flex items-center justify-center text-white shrink-0" 
                      style={{ backgroundColor: project.color }}
                    >
                      <FolderKanban className="size-5" strokeWidth={2} />
                    </div>
                    <div className="flex flex-col gap-1.5 pt-0.5">
                      <h3 className="font-semibold text-[15px] leading-none text-foreground line-clamp-1">
                        {project.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={project.status} />
                        <span className="text-[12px] text-muted-foreground font-medium">{project.phase}</span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button 
                        className="text-muted-foreground/50 hover:text-foreground p-1 -mr-2 -mt-1 rounded-md hover:bg-muted/50 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="size-5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem asChild>
                        <Link 
                          to="/projects/$projectId/edit" 
                          params={{ projectId: project.id }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          Edit Project
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Footer: Owner and Value */}
                <div className="flex items-end justify-between mt-auto pt-4 border-t border-border/40">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Owner</span>
                    <div className="flex items-center gap-2">
                      <Avatar className="size-6 rounded-full bg-muted border border-border/40">
                        <AvatarFallback className="text-[10px] text-muted-foreground font-medium">
                          {project.owner.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-[13px] font-medium text-foreground">{project.owner.name}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 text-right">
                    <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Value</span>
                    <span className="text-[14px] font-semibold text-foreground">
                      {formatCurrency(project.financial?.totalProjectContract ?? 0)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ProjectStatus }) {
  // DESIGN.md: Active: blue, Planning: purple, On Hold: amber, Completed: green
  const styles = {
    Active: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    Planning: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    "On Hold": "bg-amber-500/10 text-amber-600 border-amber-500/20",
    Completed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  };

  return (
    <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded-md text-[11px] font-medium border", styles[status])}>
      {status}
    </span>
  );
}



function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}
