import { FolderKanban } from "lucide-react";
import type { Project } from "@/lib/mock/projects";

export function ProjectsOverview({ projects }: { projects: Project[] }) {
  const active = projects.filter((p) => p.status === "Active").length;
  const planning = projects.filter((p) => p.status === "Planning").length;
  const onHold = projects.filter((p) => p.status === "On Hold").length;
  const completed = projects.filter((p) => p.status === "Completed").length;

  const cards = [
    { label: "Active", value: active, color: "text-emerald-600 bg-emerald-500/10" },
    { label: "Planning", value: planning, color: "text-blue-600 bg-blue-500/10" },
    { label: "On Hold", value: onHold, color: "text-amber-600 bg-amber-500/10" },
    { label: "Completed", value: completed, color: "text-muted-foreground bg-muted" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {cards.map((c) => (
        <div
          key={c.label}
          className="bg-card border border-border/80 rounded-xl p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="text-[13px] font-medium text-muted-foreground">{c.label}</div>
            <div className={`size-8 rounded-md grid place-items-center ${c.color}`}>
              <FolderKanban className="size-4" strokeWidth={2.5} />
            </div>
          </div>
          <div className="text-3xl font-bold tracking-tight text-foreground">{c.value}</div>
        </div>
      ))}
    </div>
  );
}
