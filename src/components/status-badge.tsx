import type { ProjectStatus } from "@/lib/mock/projects";

const styles: Record<ProjectStatus, string> = {
  Active: "bg-success/15 text-success",
  Planning: "bg-info/15 text-info",
  "On Hold": "bg-warning/20 text-warning-foreground",
  Completed: "bg-muted text-muted-foreground",
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${styles[status]}`}
    >
      <span className="size-1.5 rounded-full bg-current opacity-80" />
      {status}
    </span>
  );
}
