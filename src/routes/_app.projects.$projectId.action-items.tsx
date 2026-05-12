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
  TableBody,
  TableFooter,
  TableHeader,
  TableShell,
  Toolbar,
  ToolbarFilter,
  ToolbarSearch,
} from "@/components/data";
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

export const ACTION_ITEMS_GRID =
  "grid-cols-[120px_1fr_auto_auto_auto_auto_32px]";

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

      <div className="border-b border-border mb-4">
        <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
          <TabsList className="bg-transparent p-0 h-auto gap-6 rounded-none">
            {(["all", "mine", "overdue", "completed"] as const).map((t) => (
              <TabsTrigger
                key={t}
                value={t}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 pb-3 pt-0 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground"
              >
                {t === "all"
                  ? "All"
                  : t === "mine"
                    ? "My Tasks"
                    : t === "overdue"
                      ? "Overdue"
                      : "Completed"}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

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
        <TableShell>
          <NoResults message="No action items match your filters." onClear={clearFilters} />
        </TableShell>
      ) : (
        <TableShell>
          <TableHeader
            gridClassName={ACTION_ITEMS_GRID}
            columns={["Status", "Action", "Assignee", "Due", "Priority", "Origin", ""]}
          />
          <TableBody>
            {filtered.map((item) => (
              <ActionItemRow
                key={item.id}
                item={item}
                projectId={projectId}
                onEdit={openEdit}
              />
            ))}
          </TableBody>
          <TableFooter>
            <span>
              {filtered.filter(isDueToday).length > 0 && (
                <span className="text-amber-700 dark:text-amber-400 font-medium">
                  {filtered.filter(isDueToday).length} due today ·{" "}
                </span>
              )}
              {filtered.filter(isOverdue).length > 0 && (
                <span className="text-destructive font-medium">
                  {filtered.filter(isOverdue).length} overdue ·{" "}
                </span>
              )}
              Showing {filtered.length} of {items.length}
            </span>
          </TableFooter>
        </TableShell>
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
