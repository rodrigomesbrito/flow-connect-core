import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Plus } from "lucide-react";
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
import { IssueRow, ISSUES_GRID } from "@/components/issues/IssueRow";
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
    if (tab === "blocking")
      list = list.filter((i) => i.blocking && i.status !== "Resolved");
    else if (tab === "open") list = list.filter((i) => i.status !== "Resolved");
    else if (tab === "resolved")
      list = list.filter((i) => i.status === "Resolved");

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
    <div className="px-6 py-6 max-w-7xl mx-auto">
      <PageHeader
        title="Issues"
        description="Risks, blockers, and open problems — track until resolved."
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-1.5 h-4 w-4" />
            New Issue
          </Button>
        }
      />

      <KpiRow>
        <KpiStat
          label="Blocking"
          value={stats.blocking}
          tone="destructive"
          active={tab === "blocking"}
          onClick={() => {
            setTab("blocking");
            setStatusFilter("all");
          }}
        />
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
          label="In Review"
          value={stats.inReview}
          tone="warning"
          active={tab === "all" && statusFilter === "In Review"}
          onClick={() => {
            setTab("all");
            setStatusFilter("In Review");
          }}
        />
        <KpiStat
          label="Resolved"
          value={stats.resolved}
          tone="success"
          active={tab === "resolved"}
          onClick={() => {
            setTab("resolved");
            setStatusFilter("all");
          }}
        />
      </KpiRow>

      {/* Tabs — underline style */}
      <div className="border-b border-border mb-4">
        <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
          <TabsList className="bg-transparent p-0 h-auto gap-6 rounded-none">
            {(["all", "open", "blocking", "resolved"] as const).map((t) => (
              <TabsTrigger
                key={t}
                value={t}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 pb-3 pt-0 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground capitalize"
              >
                {t === "all" ? "All" : t}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <Toolbar onClear={clearFilters} hasActiveFilters={filtersActive}>
        <ToolbarSearch
          value={query}
          onChange={setQuery}
          placeholder="Search issues..."
        />
        <ToolbarFilter
          label="Status"
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as IssueStatus | "all")}
          options={[
            { value: "all", label: "All status" },
            { value: "Open", label: "Open" },
            { value: "In Review", label: "In Review" },
            { value: "Resolved", label: "Resolved" },
          ]}
        />
        <ToolbarFilter
          label="Severity"
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
        <ToolbarFilter
          label="Owner"
          value={ownerFilter}
          onChange={setOwnerFilter}
          options={[
            { value: "all", label: "All owners" },
            ...owners.map((a) => ({ value: a, label: a })),
          ]}
        />
        <ToolbarFilter
          label="Origin"
          value={originFilter}
          onChange={(v) => setOriginFilter(v as IssueOrigin | "all")}
          options={[
            { value: "all", label: "All origins" },
            { value: "meeting", label: "Meeting" },
            { value: "manual", label: "Manual" },
          ]}
        />
      </Toolbar>

      {issues.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="No issues yet"
          description="Issues appear here automatically from meetings — or log one directly."
          action={
            <Button size="sm" onClick={openCreate}>
              <Plus className="mr-1.5 h-4 w-4" /> New Issue
            </Button>
          }
          hint={
            <>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
                Pro tip — meeting markers
              </p>
              <pre className="rounded-md border bg-muted/40 p-3 text-xs font-mono leading-relaxed overflow-x-auto">
                <span className="text-primary font-semibold">[issue]</span>{" "}
                Utility relocation delay risk on STA 12+50
              </pre>
              <p className="mt-2 text-xs text-muted-foreground">
                Type these in any meeting's notes — they'll show up here once
                you end the meeting.
              </p>
            </>
          }
        />
      ) : filtered.length === 0 ? (
        <TableShell>
          <NoResults
            message="No issues match your filters."
            onClear={clearFilters}
          />
        </TableShell>
      ) : (
        <TableShell>
          <TableHeader
            gridClassName={ISSUES_GRID}
            columns={[
              "Status",
              "Issue",
              "Owner",
              "Severity",
              "Mitigation",
              "Origin",
              "",
            ]}
          />
          <TableBody>
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
          </TableBody>
          <TableFooter>
            <span>
              {stats.blocking > 0 && (
                <span className="text-destructive font-medium">
                  {stats.blocking} blocking ·{" "}
                </span>
              )}
              Showing {filtered.length} of {issues.length}
            </span>
          </TableFooter>
        </TableShell>
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
