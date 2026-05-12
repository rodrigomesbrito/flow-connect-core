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
  isDueToday,
  isOverdue,
  sortActionItems,
  useActionItems,
  type ActionItem,
  type ActionPriority,
  type ActionStatus,
  type ActionOrigin,
} from "@/lib/action-items/store";
import { useMeetings } from "@/lib/meetings/store";
import { ensureSeeded } from "@/lib/meetings/seed";
import { ActionItemRow } from "@/components/action-items/ActionItemRow";
import { ActionItemDialog } from "@/components/action-items/ActionItemDialog";

export const Route = createFileRoute("/_app/projects/$projectId/action-items")({
  component: ActionItemsPage,
});

type Tab = "all" | "mine" | "overdue" | "completed";
const ME = "Me"; // TODO: replace with authenticated user when auth lands

function ActionItemsPage() {
  const { projectId } = Route.useParams();

  // Make sure seed (which also seeds action items) has run.
  useEffect(() => {
    ensureSeeded(projectId);
  }, [projectId]);

  const items = useActionItems(projectId);
  const meetings = useMeetings(projectId);

  const [tab, setTab] = useState<Tab>("all");
  const [statusFilter, setStatusFilter] = useState<ActionStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<ActionPriority | "all">("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [originFilter, setOriginFilter] = useState<ActionOrigin | "all">("all");
  const [query, setQuery] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ActionItem | null>(null);

  const stats = useMemo(() => {
    return {
      open: items.filter((i) => i.status === "Open").length,
      inProgress: items.filter((i) => i.status === "In Progress").length,
      overdue: items.filter(isOverdue).length,
      done: items.filter((i) => i.status === "Done").length,
    };
  }, [items]);

  const assignees = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => i.assignee && set.add(i.assignee));
    return Array.from(set).sort();
  }, [items]);

  const attendeeSuggestions = useMemo(() => {
    const set = new Set<string>(assignees);
    meetings.forEach((m) => m.attendees.forEach((a) => set.add(a)));
    return Array.from(set).sort();
  }, [meetings, assignees]);

  const filtered = useMemo(() => {
    let list = items;

    // Tab
    if (tab === "mine") list = list.filter((i) => i.assignee === ME);
    else if (tab === "overdue") list = list.filter(isOverdue);
    else if (tab === "completed") list = list.filter((i) => i.status === "Done");

    if (statusFilter !== "all") list = list.filter((i) => i.status === statusFilter);
    if (priorityFilter !== "all")
      list = list.filter((i) => i.priority === priorityFilter);
    if (assigneeFilter !== "all")
      list = list.filter((i) => (i.assignee ?? "") === assigneeFilter);
    if (originFilter !== "all")
      list = list.filter((i) => i.origin === originFilter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (i) =>
          i.text.toLowerCase().includes(q) ||
          (i.assignee ?? "").toLowerCase().includes(q) ||
          (i.meetingTitle ?? "").toLowerCase().includes(q),
      );
    }
    return sortActionItems(list);
  }, [items, tab, statusFilter, priorityFilter, assigneeFilter, originFilter, query]);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (item: ActionItem) => {
    setEditing(item);
    setDialogOpen(true);
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setPriorityFilter("all");
    setAssigneeFilter("all");
    setOriginFilter("all");
    setQuery("");
  };

  const filtersActive =
    statusFilter !== "all" ||
    priorityFilter !== "all" ||
    assigneeFilter !== "all" ||
    originFilter !== "all" ||
    query.trim() !== "";

  return (
    <div className="px-6 py-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Action Items</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Operational layer — track everything that needs to get done.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={openCreate}>
          <Plus className="mr-1.5 h-4 w-4" />
          New Action Item
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
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
          label="In Progress"
          value={stats.inProgress}
          active={tab === "all" && statusFilter === "In Progress"}
          onClick={() => {
            setTab("all");
            setStatusFilter("In Progress");
          }}
        />
        <StatCard
          label="Overdue"
          value={stats.overdue}
          tone="destructive"
          active={tab === "overdue"}
          onClick={() => {
            setTab("overdue");
            setStatusFilter("all");
          }}
        />
        <StatCard
          label="Done"
          value={stats.done}
          tone="success"
          active={tab === "completed"}
          onClick={() => {
            setTab("completed");
            setStatusFilter("all");
          }}
        />
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)} className="mb-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="mine">My Tasks</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
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
          onChange={(v) => setStatusFilter(v as ActionStatus | "all")}
          placeholder="Status"
          options={[
            { value: "all", label: "All status" },
            { value: "Open", label: "Open" },
            { value: "In Progress", label: "In Progress" },
            { value: "Done", label: "Done" },
          ]}
        />
        <FilterSelect
          value={priorityFilter}
          onChange={(v) => setPriorityFilter(v as ActionPriority | "all")}
          placeholder="Priority"
          options={[
            { value: "all", label: "All priorities" },
            { value: "High", label: "High" },
            { value: "Medium", label: "Medium" },
            { value: "Low", label: "Low" },
          ]}
        />
        <FilterSelect
          value={assigneeFilter}
          onChange={setAssigneeFilter}
          placeholder="Assignee"
          options={[
            { value: "all", label: "All assignees" },
            ...assignees.map((a) => ({ value: a, label: a })),
          ]}
        />
        <FilterSelect
          value={originFilter}
          onChange={(v) => setOriginFilter(v as ActionOrigin | "all")}
          placeholder="Origin"
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
      {items.length === 0 ? (
        <EmptyState onCreate={openCreate} />
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          No action items match your filters.
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="grid grid-cols-[120px_1fr_auto_auto_auto_auto_32px] gap-3 border-b border-border bg-muted/30 px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            <span>Status</span>
            <span>Action</span>
            <span>Assignee</span>
            <span>Due</span>
            <span>Priority</span>
            <span>Origin</span>
            <span />
          </div>
          {filtered.map((item) => (
            <ActionItemRow
              key={item.id}
              item={item}
              projectId={projectId}
              onEdit={openEdit}
            />
          ))}
        </Card>
      )}

      {/* Helper hints below list */}
      {filtered.length > 0 && (
        <p className="mt-4 text-xs text-muted-foreground">
          {filtered.filter(isDueToday).length > 0 && (
            <span className="text-amber-700 dark:text-amber-400">
              {filtered.filter(isDueToday).length} due today ·{" "}
            </span>
          )}
          {filtered.filter(isOverdue).length > 0 && (
            <span className="text-destructive">
              {filtered.filter(isOverdue).length} overdue ·{" "}
            </span>
          )}
          Showing {filtered.length} of {items.length}
        </p>
      )}

      <ActionItemDialog
        projectId={projectId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={editing}
        attendeeSuggestions={attendeeSuggestions}
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
  placeholder,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-8 w-auto min-w-[120px] text-sm">
        <SelectValue placeholder={placeholder} />
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
      <h3 className="text-base font-medium">No action items yet</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Action items appear here automatically when you publish meetings — or you can add one directly.
      </p>
      <Button variant="outline" size="sm" className="mt-4" onClick={onCreate}>
        <Plus className="mr-1.5 h-4 w-4" /> New Action Item
      </Button>

      <div className="mt-8 mx-auto max-w-md text-left">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
          Pro tip — meeting markers
        </p>
        <pre className="rounded-md border bg-muted/40 p-3 text-xs font-mono leading-relaxed overflow-x-auto">
          <span className="text-primary font-semibold">[action @John]</span> Send revised schedule by Friday{"\n"}
          <span className="text-primary font-semibold">[action]</span> Review punch list
        </pre>
        <p className="mt-2 text-xs text-muted-foreground">
          Type these in any meeting's notes — they'll show up here once you end the meeting.
        </p>
      </div>
    </Card>
  );
}
