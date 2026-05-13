import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OwnerOrg, ProjectPhase, ProjectStatus } from "@/lib/mock/projects";

export type StatusFilter = ProjectStatus | "All";
export type PhaseFilter = ProjectPhase | "All";
export type OwnerFilter = OwnerOrg | "All";

export type ProjectFilters = {
  query: string;
  status: StatusFilter;
  phase: PhaseFilter;
  owner: OwnerFilter;
};

export const defaultFilters: ProjectFilters = {
  query: "",
  status: "All",
  phase: "All",
  owner: "All",
};

const statusOptions: StatusFilter[] = ["All", "Active", "Planning", "On Hold", "Completed"];
const phaseOptions: PhaseFilter[] = ["All", "Procurement", "Design", "Construction", "Closeout"];
const ownerOptions: OwnerFilter[] = ["All", "City of Charlotte", "Private", "State", "Federal"];

export function ProjectsToolbar({
  filters,
  onChange,
}: {
  filters: ProjectFilters;
  onChange: (next: ProjectFilters) => void;
}) {
  const set = <K extends keyof ProjectFilters>(key: K, value: ProjectFilters[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className="flex flex-col lg:flex-row gap-3 mb-6 items-start lg:items-center">
      <div className="relative w-full lg:max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
        <Input
          value={filters.query}
          onChange={(e) => set("query", e.target.value)}
          placeholder="Search projects..."
          className="pl-8 h-8 text-xs bg-transparent shadow-sm"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <FilterSelect
          label="Status"
          value={filters.status}
          options={statusOptions}
          onChange={(v) => set("status", v as StatusFilter)}
        />
        <FilterSelect
          label="Phase"
          value={filters.phase}
          options={phaseOptions}
          onChange={(v) => set("phase", v as PhaseFilter)}
        />
        <FilterSelect
          label="Owner"
          value={filters.owner}
          options={ownerOptions}
          onChange={(v) => set("owner", v as OwnerFilter)}
          placeholderForAll="All Owners"
        />
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
  placeholderForAll,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  placeholderForAll?: string;
}) {
  const isAll = value === "All";
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger 
        className={`h-8 text-xs font-medium border-dashed transition-colors ${!isAll ? 'border-primary/40 bg-primary/5 text-primary' : 'bg-transparent text-foreground hover:bg-muted/50'}`}
      >
        <span className={!isAll ? "text-primary/70 mr-1.5" : "text-muted-foreground mr-1.5"}>{label}</span>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o} className="text-xs">
            {o === "All" && placeholderForAll ? placeholderForAll : o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
