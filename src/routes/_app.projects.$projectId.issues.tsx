import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  sortIssues,
  useIssues,
  type Issue,
  type IssueOrigin,
  type IssueSeverity,
  type IssueStatus,
} from "@/lib/issues/store";
import { useActionItems } from "@/lib/action-items/store";
import { useMeetings } from "@/lib/meetings/store";
import { ensureSeeded } from "@/lib/meetings/seed";
import { IssueRow } from "@/components/issues/IssueRow";
import { IssueDialog } from "@/components/issues/IssueDialog";

export const Route = createFileRoute("/_app/projects/$projectId/issues")({
  component: IssuesPage,
});

type Tab = "all" | "blocking" | "open" | "resolved";

function IssuesPage() {
  const { projectId } = Route.useParams();

  useEffect(() => {
    ensureSeeded(projectId);
  }, [projectId]);

  const issues = useIssues(projectId);
  const meetings = useMeetings(projectId);
  const actionItems = useActionItems(projectId);

  const [tab, setTab] = useState<Tab>("all");
  const [statusFilter, setStatusFilter] = useState<IssueStatus | "all">("all");
  const [severityFilter, setSeverityFilter] = useState<IssueSeverity | "all">(
    "all",
  );
  const [ownerFilter, setOwnerFilter] = useState<string>("all");
  const [originFilter, setOriginFilter] = useState<IssueOrigin | "all">("all");
  const [query, setQuery] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Issue | null>(null);

  const stats = useMemo(
    () => ({
      open: issues.filter((i) => i.status === "Open").length,
      inReview: issues.filter((i) => i.status === "In Review").length,
      blocking: issues.filter((i) => i.blocking && i.status !== "Resolved")
        .length,
      resolved: issues.filter((i) => i.status === "Resolved").length,
    }),
    [issues],
  );

  const owners = useMemo(() => {
    const set = new Set<string>();
    issues.forEach((i) => i.owner && set.add(i.owner));
    return Array.from(set).sort();
  }, [issues]);

  const ownerSuggestions = useMemo(() => {
    const set = new Set<string>(owners);
    meetings.forEach((m) => m.attendees.forEach((a) => set.add(a)));
    return Array.from(set).sort();
  }, [meetings, owners]);

  const actionsById = useMemo(() => {
    const map = new Map<string, (typeof actionItems)[number]>();
    actionItems.forEach((a) => map.set(a.id, a));
    return map;
  }, [actionItems]);

  const filtered = useMemo(() => {
    let list = issues;

    if (tab === "blocking") list = list.filter((i) => i.blocking && i.status !== "Resolved");
    else if (tab === "open") list = list.filter((i) => i.status !== "Resolved");
    else if (tab === "resolved") list = list.filter((i) => i.status === "Resolved");

    if (statusFilter !== "all") list = list.filter((i) => i.status === statusFilter);
    if (severityFilter !== "all")
      list = list.filter((i) => i.severity === severityFilter);
    if (ownerFilter !== "all")
      list = list.filter((i) => (i.owner ?? "") === ownerFilter);
    if (originFilter !== "all")
      list = list.filter((i) => i.origin === originFilter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (i) =>
          i.text.toLowerCase().includes(q) ||
          (i.owner ?? "").toLowerCase().includes(q) ||
          (i.meetingTitle ?? "").toLowerCase().includes(q) ||
          (i.resolutionNotes ?? "").toLowerCase().includes(q),
      );
    }
    return sortIssues(list);
  }, [issues, tab, statusFilter, severityFilter, ownerFilter, originFilter, query]);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (item: Issue) => {
    setEditing(item);
    setDialogOpen(true);
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setSeverityFilter("all");
    setOwnerFilter("all");
    setOriginFilter("all");
    setQuery("");
  };

  const filtersActive =
    statusFilter !== "all" ||
    severityFilter !== "all" ||
    ownerFilter !== "all" ||
    originFilter !== "all" ||
    query.trim() !== "";

  return (
    <div className="px-6 py-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Issues</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Risks, blockers, and open problems — track until resolved.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={openCreate}>
          <Plus className="mr-1.5 h-4 w-4" />
          New Issue
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Blocking"
          value={stats.blocking}
          tone="destructive"
          active={tab === "blocking"}
          onClick={() => {
            setTab("blocking");
            setStatusFilter("all");
          }}
        />
        <StatCard
          label="Open"
          value={stats.open}
          active={tab === "all" && statusFilter === "Open"}
          onClick={() => {
            setTab("all");
            setStatusFilter("Open");
          }}
        />
        <StatCard
          label="In Review"
          value={stats.inReview}
          active={tab === "all" && statusFilter === "In Review"}
          onClick={() => {
            setTab("all");
            setStatusFilter("In Review");
          }}
        />
        <StatCard
          label="Resolved"
          value={stats.resolved}
          tone="success"
          active={tab === "resolved"}
          onClick={() => {
            setTab("resolved");
            setStatusFilter("all");
          }}
        />
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)} className="mb-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="blocking">Blocking</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
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
          onChange={(v) => setStatusFilter(v as IssueStatus | "all")}
          options={[
            { value: "all", label: "All status" },
            { value: "Open", label: "Open" },
            { value: "In Review", label: "In Review" },
            { value: "Resolved", label: "Resolved" },
          ]}
        />
        <FilterSelect
          value={severityFilter}
          onChange={(v) => setSeverityFilter(v as IssueSeverity | "all")}
          options={[
            { value: "all", label: "All severity" },
            { value: "Critical", label: "Critical" },
            { value: "High", label: "High" },
            { value: "Medium", label: "Medium" },
            { value: "Low", label: "Low" },
          ]}
        />
        <FilterSelect
          value={ownerFilter}
          onChange={setOwnerFilter}
          options={[
            { value: "all", label: "All owners" },
            ...owners.map((a) => ({ value: a, label: a })),
          ]}
        />
        <FilterSelect
          value={originFilter}
          onChange={(v) => setOriginFilter(v as IssueOrigin | "all")}
          options={[
            { value: "all", label: "All origins" },
            { value: "meeting", label: "Meeting" },
            { value: "manual", label: "Manual" },
          ]}
        />
        {filtersActive && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8">
            <X className="mr-1 h-3 w-3" /> Clear
          </Button>
        )}
      </div>

      {/* List */}
      {issues.length === 0 ? (
        <EmptyState onCreate={openCreate} />
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          No issues match your filters.
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="grid grid-cols-[110px_1fr_auto_auto_auto_auto_32px] gap-3 border-b border-border bg-muted/30 px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            <span>Status</span>
            <span>Issue</span>
            <span>Owner</span>
            <span>Severity</span>
            <span>Mitigation</span>
            <span>Origin</span>
            <span />
          </div>
          {filtered.map((item) => (
            <IssueRow
              key={item.id}
              issue={item}
              projectId={projectId}
              onEdit={openEdit}
              linkedAction={
                item.linkedActionItemId
                  ? actionsById.get(item.linkedActionItemId)
                  : undefined
              }
            />
          ))}
        </Card>
      )}

      {filtered.length > 0 && (
        <p className="mt-4 text-xs text-muted-foreground">
          {stats.blocking > 0 && (
            <span className="text-destructive font-medium">
              {stats.blocking} blocking ·{" "}
            </span>
          )}
          Showing {filtered.length} of {issues.length}
        </p>
      )}

      <IssueDialog
        projectId={projectId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        issue={editing}
        ownerSuggestions={ownerSuggestions}
        actionItems={actionItems}
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
  tone?: "destructive" | "success";
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
          tone === "destructive" && value > 0 && "text-destructive",
          tone === "success" && "text-emerald-600 dark:text-emerald-400",
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
      <SelectTrigger className="h-8 w-auto min-w-[130px] text-sm">
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

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <Card className="p-10 text-center">
      <h3 className="text-base font-medium">No issues yet</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Issues appear here automatically from meetings — or log one directly.
      </p>
      <Button variant="outline" size="sm" className="mt-4" onClick={onCreate}>
        <Plus className="mr-1.5 h-4 w-4" /> New Issue
      </Button>
      <div className="mt-8 mx-auto max-w-md text-left">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
          Pro tip — meeting markers
        </p>
        <pre className="rounded-md border bg-muted/40 p-3 text-xs font-mono leading-relaxed overflow-x-auto">
          <span className="text-primary font-semibold">[issue]</span> Utility
          relocation delay risk on STA 12+50
        </pre>
        <p className="mt-2 text-xs text-muted-foreground">
          Type these in any meeting's notes — they'll show up here once you end
          the meeting.
        </p>
      </div>
    </Card>
  );
}
