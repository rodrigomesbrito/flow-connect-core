import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  EmptyState,
  KpiRow,
  KpiStat,
  NoResults,
  PageHeader,
  Toolbar,
  ToolbarFilter,
  ToolbarSearch,
} from "@/components/data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
const ME = "Me";

export const ACTION_ITEMS_GRID = ""; // Deprecated

function ActionItemsPage() {
  const { projectId } = Route.useParams();

  useEffect(() => {
    ensureSeeded(projectId);
  }, [projectId]);

  const items = useActionItems(projectId);
  const meetings = useMeetings(projectId);

  const [tab, setTab] = useState<Tab>("all");
  const [statusFilter, setStatusFilter] = useState<ActionStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<ActionPriority | "all">(
    "all",
  );
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [originFilter, setOriginFilter] = useState<ActionOrigin | "all">("all");
  const [query, setQuery] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ActionItem | null>(null);

  const stats = useMemo(
    () => ({
      open: items.filter((i) => i.status === "Open").length,
      inProgress: items.filter((i) => i.status === "In Progress").length,
      overdue: items.filter(isOverdue).length,
      done: items.filter((i) => i.status === "Done").length,
    }),
    [items],
  );

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

  // Pagination logic
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(filtered.length / pageSize);

  useEffect(() => {
    setPage(1);
  }, [tab, statusFilter, priorityFilter, assigneeFilter, originFilter, query]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

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
    <div className="px-6 py-6 max-w-7xl mx-auto">
      <PageHeader
        title="Action Items"
        description="Operational layer — track everything that needs to get done."
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-1.5 h-4 w-4" />
            New Action Item
          </Button>
        }
      />

      <KpiRow>
        <KpiStat
          label="Open"
          value={stats.open}
          active={tab === "all" && statusFilter === "Open"}
          onClick={() => {
            setTab("all");
            setStatusFilter("Open");
          }}
        />
        <KpiStat
          label="In Progress"
          value={stats.inProgress}
          active={tab === "all" && statusFilter === "In Progress"}
          onClick={() => {
            setTab("all");
            setStatusFilter("In Progress");
          }}
        />
        <KpiStat
          label="Overdue"
          value={stats.overdue}
          tone="destructive"
          active={tab === "overdue"}
          onClick={() => {
            setTab("overdue");
            setStatusFilter("all");
          }}
        />
        <KpiStat
          label="Done"
          value={stats.done}
          tone="success"
          active={tab === "completed"}
          onClick={() => {
            setTab("completed");
            setStatusFilter("all");
          }}
        />
      </KpiRow>

      <Toolbar onClear={clearFilters} hasActiveFilters={filtersActive}>
        <ToolbarSearch value={query} onChange={setQuery} placeholder="Search action items..." />
        <ToolbarFilter
          label="Status"
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as ActionStatus | "all")}
          options={[
            { value: "all", label: "All status" },
            { value: "Open", label: "Open" },
            { value: "In Progress", label: "In Progress" },
            { value: "Done", label: "Done" },
          ]}
        />
        <ToolbarFilter
          label="Priority"
          value={priorityFilter}
          onChange={(v) => setPriorityFilter(v as ActionPriority | "all")}
          options={[
            { value: "all", label: "All priorities" },
            { value: "High", label: "High" },
            { value: "Medium", label: "Medium" },
            { value: "Low", label: "Low" },
          ]}
        />
        <ToolbarFilter
          label="Assignee"
          value={assigneeFilter}
          onChange={setAssigneeFilter}
          options={[
            { value: "all", label: "All assignees" },
            ...assignees.map((a) => ({ value: a, label: a })),
          ]}
        />
        <ToolbarFilter
          label="Origin"
          value={originFilter}
          onChange={(v) => setOriginFilter(v as ActionOrigin | "all")}
          options={[
            { value: "all", label: "All origins" },
            { value: "meeting", label: "Meeting" },
            { value: "manual", label: "Manual" },
          ]}
        />
      </Toolbar>

      {items.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No action items yet"
          description="Action items appear here automatically when you publish meetings — or you can add one directly."
          action={
            <Button size="sm" onClick={openCreate}>
              <Plus className="mr-1.5 h-4 w-4" /> New Action Item
            </Button>
          }
          hint={
            <>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
                Pro tip — meeting markers
              </p>
              <pre className="rounded-md border bg-muted/40 p-3 text-xs font-mono leading-relaxed overflow-x-auto">
                <span className="text-primary font-semibold">[action @John]</span>{" "}
                Send revised schedule by Friday
              </pre>
            </>
          }
        />
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-border/50 rounded-[14px] overflow-hidden">
          <NoResults message="No action items match your filters." onClear={clearFilters} />
        </div>
      ) : (
        <div className="bg-card border border-border/50 rounded-[14px] overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40 hover:bg-muted/40">
              <TableRow className="border-border/40 hover:bg-transparent">
                <TableHead className="h-10 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider pl-5 w-[130px]">Status</TableHead>
                <TableHead className="h-10 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Action</TableHead>
                <TableHead className="h-10 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-[150px]">Assignee</TableHead>
                <TableHead className="h-10 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-[120px]">Due</TableHead>
                <TableHead className="h-10 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-[120px]">Priority</TableHead>
                <TableHead className="h-10 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-[180px]">Origin</TableHead>
                <TableHead className="h-10 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-right pr-5 w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((item) => (
                <ActionItemRow
                  key={item.id}
                  item={item}
                  projectId={projectId}
                  onEdit={openEdit}
                />
              ))}
            </TableBody>
          </Table>

          {/* Pagination Footer */}
          {filtered.length > pageSize && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-border/40 bg-muted/10">
              <div className="text-[12px] text-muted-foreground">
                Showing <span className="font-medium text-foreground">{(page - 1) * pageSize + 1}</span> to <span className="font-medium text-foreground">{Math.min(page * pageSize, filtered.length)}</span> of <span className="font-medium text-foreground">{filtered.length}</span> results
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-8 w-8 p-0 border-border/60 hover:bg-muted/50 rounded-md"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <div className="text-[12px] font-medium text-muted-foreground min-w-[3rem] text-center">
                  {page} / {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="h-8 w-8 p-0 border-border/60 hover:bg-muted/50 rounded-md"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
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
