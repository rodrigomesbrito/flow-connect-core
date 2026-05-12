import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  sortDecisions,
  useDecisions,
  type Decision,
  type DecisionStatus,
} from "@/lib/decisions/store";
import { useMeetings } from "@/lib/meetings/store";
import { ensureSeeded } from "@/lib/meetings/seed";
import { DecisionRow } from "@/components/decisions/DecisionRow";
import { DecisionDialog } from "@/components/decisions/DecisionDialog";

export const Route = createFileRoute("/_app/projects/$projectId/decisions")({
  component: DecisionsPage,
});

type Tab = "all" | "proposed" | "approved" | "reverted";

function DecisionsPage() {
  const { projectId } = Route.useParams();

  useEffect(() => {
    ensureSeeded(projectId);
  }, [projectId]);

  const decisions = useDecisions(projectId);
  const meetings = useMeetings(projectId);

  const [tab, setTab] = useState<Tab>("all");
  const [statusFilter, setStatusFilter] = useState<DecisionStatus | "all">("all");
  const [decisorFilter, setDecisorFilter] = useState<string>("all");
  const [meetingFilter, setMeetingFilter] = useState<string>("all");
  const [query, setQuery] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Decision | null>(null);

  const stats = useMemo(
    () => ({
      proposed: decisions.filter((d) => d.status === "Proposed").length,
      approved: decisions.filter((d) => d.status === "Approved").length,
      reverted: decisions.filter((d) => d.status === "Reverted").length,
    }),
    [decisions],
  );

  const decisors = useMemo(() => {
    const set = new Set<string>();
    decisions.forEach((d) => d.decidedBy && set.add(d.decidedBy));
    return Array.from(set).sort();
  }, [decisions]);

  const decisorSuggestions = useMemo(() => {
    const set = new Set<string>(decisors);
    meetings.forEach((m) => m.attendees.forEach((a) => set.add(a)));
    return Array.from(set).sort();
  }, [meetings, decisors]);

  const meetingOptions = useMemo(() => {
    const map = new Map<string, string>();
    decisions.forEach((d) => map.set(d.meetingId, d.meetingTitle));
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [decisions]);

  const filtered = useMemo(() => {
    let list = decisions;

    if (tab === "proposed") list = list.filter((d) => d.status === "Proposed");
    else if (tab === "approved") list = list.filter((d) => d.status === "Approved");
    else if (tab === "reverted") list = list.filter((d) => d.status === "Reverted");

    if (statusFilter !== "all") list = list.filter((d) => d.status === statusFilter);
    if (decisorFilter !== "all")
      list = list.filter((d) => (d.decidedBy ?? "") === decisorFilter);
    if (meetingFilter !== "all")
      list = list.filter((d) => d.meetingId === meetingFilter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (d) =>
          d.text.toLowerCase().includes(q) ||
          (d.decidedBy ?? "").toLowerCase().includes(q) ||
          d.meetingTitle.toLowerCase().includes(q) ||
          (d.notes ?? "").toLowerCase().includes(q),
      );
    }
    return sortDecisions(list);
  }, [decisions, tab, statusFilter, decisorFilter, meetingFilter, query]);

  const openEdit = (d: Decision) => {
    setEditing(d);
    setDialogOpen(true);
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setDecisorFilter("all");
    setMeetingFilter("all");
    setQuery("");
  };

  const filtersActive =
    statusFilter !== "all" ||
    decisorFilter !== "all" ||
    meetingFilter !== "all" ||
    query.trim() !== "";

  return (
    <div className="px-6 py-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Decisions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            The institutional record — what was decided, by whom, and whether
            it still stands.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard
          label="Proposed"
          value={stats.proposed}
          tone="warning"
          active={tab === "proposed"}
          onClick={() => {
            setTab("proposed");
            setStatusFilter("all");
          }}
        />
        <StatCard
          label="Approved"
          value={stats.approved}
          tone="success"
          active={tab === "approved"}
          onClick={() => {
            setTab("approved");
            setStatusFilter("all");
          }}
        />
        <StatCard
          label="Reverted"
          value={stats.reverted}
          tone="muted"
          active={tab === "reverted"}
          onClick={() => {
            setTab("reverted");
            setStatusFilter("all");
          }}
        />
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)} className="mb-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="proposed">Proposed</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="reverted">Reverted</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="h-8 pl-8 text-sm"
          />
        </div>
        <FilterSelect
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as DecisionStatus | "all")}
          options={[
            { value: "all", label: "All status" },
            { value: "Proposed", label: "Proposed" },
            { value: "Approved", label: "Approved" },
            { value: "Reverted", label: "Reverted" },
          ]}
        />
        <FilterSelect
          value={decisorFilter}
          onChange={setDecisorFilter}
          options={[
            { value: "all", label: "All decisors" },
            ...decisors.map((a) => ({ value: a, label: a })),
          ]}
        />
        <FilterSelect
          value={meetingFilter}
          onChange={setMeetingFilter}
          options={[
            { value: "all", label: "All meetings" },
            ...meetingOptions.map(([id, title]) => ({ value: id, label: title })),
          ]}
        />
        {filtersActive && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8">
            <X className="mr-1 h-3 w-3" /> Clear
          </Button>
        )}
      </div>

      {/* List */}
      {decisions.length === 0 ? (
        <EmptyState />
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          No decisions match your filters.
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="grid grid-cols-[120px_1fr_auto_auto_auto_32px] gap-3 border-b border-border bg-muted/30 px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            <span>Status</span>
            <span>Decision</span>
            <span>Decided by</span>
            <span>Date</span>
            <span>Source</span>
            <span />
          </div>
          {filtered.map((d) => (
            <DecisionRow
              key={d.id}
              decision={d}
              projectId={projectId}
              onEdit={openEdit}
            />
          ))}
        </Card>
      )}

      {filtered.length > 0 && (
        <p className="mt-4 text-xs text-muted-foreground">
          Showing {filtered.length} of {decisions.length}
        </p>
      )}

      <DecisionDialog
        projectId={projectId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        decision={editing}
        decisorSuggestions={decisorSuggestions}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
  active,
  onClick,
}: {
  label: string;
  value: number;
  tone?: "warning" | "success" | "muted";
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border bg-card p-3 text-left transition-colors hover:border-foreground/30",
        active && "border-primary ring-1 ring-primary/30",
      )}
    >
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-1 text-2xl font-semibold tabular-nums",
          tone === "warning" && value > 0 && "text-amber-700 dark:text-amber-400",
          tone === "success" && "text-emerald-600 dark:text-emerald-400",
          tone === "muted" && "text-muted-foreground",
        )}
      >
        {value}
      </div>
    </button>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-8 w-auto min-w-[140px] text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function EmptyState() {
  return (
    <Card className="p-10 text-center">
      <h3 className="text-base font-medium">No decisions yet</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Decisions appear here automatically when meetings with{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-xs">[decision]</code>{" "}
        markers are completed.
      </p>
      <div className="mt-8 mx-auto max-w-md text-left">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
          Pro tip — meeting markers
        </p>
        <pre className="rounded-md border bg-muted/40 p-3 text-xs font-mono leading-relaxed overflow-x-auto">
          <span className="text-primary font-semibold">[decision]</span> Approve
          bid package #3 with revised quantities
        </pre>
        <p className="mt-2 text-xs text-muted-foreground">
          Type these in any meeting's notes — they'll show up here once you end
          the meeting.
        </p>
      </div>
    </Card>
  );
}
