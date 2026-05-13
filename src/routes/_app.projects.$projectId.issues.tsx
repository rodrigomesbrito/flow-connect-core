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

  // Pagination logic
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(filtered.length / pageSize);

  useEffect(() => {
    setPage(1);
  }, [tab, statusFilter, severityFilter, ownerFilter, originFilter, query]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

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
        <div className="bg-card border border-border/50 rounded-[14px] overflow-hidden">
          <NoResults
            message="No issues match your filters."
            onClear={clearFilters}
          />
        </div>
      ) : (
        <div className="bg-card border border-border/50 rounded-[14px] overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40 hover:bg-muted/40">
              <TableRow className="border-border/40 hover:bg-transparent">
                <TableHead className="h-10 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider pl-5 w-[130px]">Status</TableHead>
                <TableHead className="h-10 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Issue</TableHead>
                <TableHead className="h-10 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-[140px]">Owner</TableHead>
                <TableHead className="h-10 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-[120px]">Severity</TableHead>
                <TableHead className="h-10 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-[140px]">Mitigation</TableHead>
                <TableHead className="h-10 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-[100px]">Origin</TableHead>
                <TableHead className="h-10 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-right pr-5 w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((item) => (
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
