import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Building2, Plus, Users as UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Toolbar, ToolbarSearch } from "@/components/data/Toolbar";
import { EmptyState, NoResults } from "@/components/data/EmptyState";
import { workspaceOrganizations, type WorkspaceOrg } from "@/lib/mock/people";

export const Route = createFileRoute("/_app/organizations")({
  head: () => ({
    meta: [
      { title: "Organizations — Relay" },
      {
        name: "description",
        content:
          "Companies, agencies and partners contributing to your workspace.",
      },
    ],
  }),
  component: OrganizationsPage,
});

function OrganizationsPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return workspaceOrganizations;
    return workspaceOrganizations.filter((o) =>
      o.name.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Page Header */}
      <header className="flex-none px-8 py-6 border-b border-border/40">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight text-foreground">Organizations</h1>
            <p className="text-[14px] text-muted-foreground mt-1">
              Companies, agencies and partners across your workspace.
            </p>
          </div>
          <Button className="h-9 px-4 text-[13px] font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md">
            <Plus className="size-4 mr-2" /> New organization
          </Button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="flex-none px-8 py-3 border-b border-border/40 bg-muted/10">
        <Toolbar
          hasActiveFilters={query.trim().length > 0}
          onClear={() => setQuery("")}
          className="mb-0"
        >
          <ToolbarSearch
            value={query}
            onChange={setQuery}
            placeholder="Search organizations…"
          />
        </Toolbar>
      </div>

      <div className="flex-1 overflow-auto p-6 bg-muted/10">
        <div className="max-w-6xl mx-auto">
          {workspaceOrganizations.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No organizations yet"
              description="Add your first organization to start grouping people and projects."
            />
          ) : filtered.length === 0 ? (
            <NoResults onClear={() => setQuery("")} />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((org) => (
                <OrgCard key={org.id} org={org} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function OrgCard({ org }: { org: WorkspaceOrg }) {
  return (
    <div className="group rounded-[14px] border border-border/50 bg-card p-5 hover:border-border hover:bg-muted/20 transition-all cursor-pointer">
      <div className="flex items-start gap-4">
        <span
          className="size-11 rounded-xl flex items-center justify-center text-white shrink-0"
          style={{ backgroundColor: org.color }}
        >
          <Building2 className="size-5" strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="text-[15px] font-semibold text-foreground truncate leading-tight">{org.name}</div>
          <div className="flex items-center gap-3 text-[12px] text-muted-foreground mt-1.5 font-medium">
            <span className="inline-flex items-center gap-1">
              <UsersIcon className="size-3.5" />
              {org.people.length}
            </span>
            <span>·</span>
            <span>
              {org.projects.length}{" "}
              {org.projects.length === 1 ? "project" : "projects"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
