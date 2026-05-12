import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Gavel } from "lucide-react";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export const DECISIONS_GRID =
  "grid-cols-[120px_1fr_auto_auto_auto_32px]";

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
    <div className="px-6 py-6 max-w-7xl mx-auto">
      <PageHeader
        title="Decisions"
        description="The institutional record — what was decided, by whom, and whether it still stands."
      />

      <KpiRow>
        <KpiStat
          label="Proposed"
          value={stats.proposed}
          tone="warning"
          active={tab === "proposed"}
          onClick={() => {
            setTab("proposed");
            setStatusFilter("all");
          }}
        />
        <KpiStat
          label="Approved"
          value={stats.approved}
          tone="success"
          active={tab === "approved"}
          onClick={() => {
            setTab("approved");
            setStatusFilter("all");
          }}
        />
        <KpiStat
          label="Reverted"
          value={stats.reverted}
          tone="muted"
          active={tab === "reverted"}
          onClick={() => {
            setTab("reverted");
            setStatusFilter("all");
          }}
        />
      </KpiRow>

      <div className="border-b border-border mb-4">
        <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
          <TabsList className="bg-transparent p-0 h-auto gap-6 rounded-none">
            {(["all", "proposed", "approved", "reverted"] as const).map((t) => (
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
        <ToolbarSearch value={query} onChange={setQuery} placeholder="Search decisions..." />
        <ToolbarFilter
          label="Status"
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as DecisionStatus | "all")}
          options={[
            { value: "all", label: "All status" },
            { value: "Proposed", label: "Proposed" },
            { value: "Approved", label: "Approved" },
            { value: "Reverted", label: "Reverted" },
          ]}
        />
        <ToolbarFilter
          label="Decisor"
          value={decisorFilter}
          onChange={setDecisorFilter}
          options={[
            { value: "all", label: "All decisors" },
            ...decisors.map((a) => ({ value: a, label: a })),
          ]}
        />
        <ToolbarFilter
          label="Meeting"
          value={meetingFilter}
          onChange={setMeetingFilter}
          options={[
            { value: "all", label: "All meetings" },
            ...meetingOptions.map(([id, title]) => ({ value: id, label: title })),
          ]}
        />
      </Toolbar>

      {decisions.length === 0 ? (
        <EmptyState
          icon={Gavel}
          title="No decisions yet"
          description="Decisions appear here automatically when meetings with [decision] markers are completed."
          hint={
            <>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
                Pro tip — meeting markers
              </p>
              <pre className="rounded-md border bg-muted/40 p-3 text-xs font-mono leading-relaxed overflow-x-auto">
                <span className="text-primary font-semibold">[decision]</span>{" "}
                Approve bid package #3 with revised quantities
              </pre>
            </>
          }
        />
      ) : filtered.length === 0 ? (
        <TableShell>
          <NoResults message="No decisions match your filters." onClear={clearFilters} />
        </TableShell>
      ) : (
        <TableShell>
          <TableHeader
            gridClassName={DECISIONS_GRID}
            columns={["Status", "Decision", "Decided by", "Date", "Source", ""]}
          />
          <TableBody>
            {filtered.map((d) => (
              <DecisionRow
                key={d.id}
                decision={d}
                projectId={projectId}
                onEdit={openEdit}
              />
            ))}
          </TableBody>
          <TableFooter>
            <span>Showing {filtered.length} of {decisions.length}</span>
          </TableFooter>
        </TableShell>
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
