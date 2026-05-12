import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Building2, Plus, Users as UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/data/PageHeader";
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
    <div className="px-6 py-6 max-w-7xl mx-auto">
      <PageHeader
        title="Organizations"
        description="Companies, agencies and partners across your workspace."
        actions={
          <Button size="sm" className="gap-2">
            <Plus className="size-4" /> New organization
          </Button>
        }
      />

      <Toolbar
        hasActiveFilters={query.trim().length > 0}
        onClear={() => setQuery("")}
      >
        <ToolbarSearch
          value={query}
          onChange={setQuery}
          placeholder="Search organizations…"
        />
      </Toolbar>

      {workspaceOrganizations.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No organizations yet"
          description="Add your first organization to start grouping people and projects."
        />
      ) : filtered.length === 0 ? (
        <NoResults onClear={() => setQuery("")} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((org) => (
            <OrgCard key={org.id} org={org} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrgCard({ org }: { org: WorkspaceOrg }) {
  return (
    <div className="group rounded-xl border border-border bg-card p-4 hover:border-foreground/20 hover:shadow-sm transition-all">
      <div className="flex items-start gap-3">
        <span
          className="size-9 rounded-lg grid place-items-center text-white shrink-0"
          style={{ backgroundColor: org.color }}
        >
          <Building2 className="size-4.5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold truncate">{org.name}</div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
            <span className="inline-flex items-center gap-1">
              <UsersIcon className="size-3" />
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

      <div className="mt-3 flex items-center justify-between">
        <div className="flex -space-x-1.5">
          {org.people.slice(0, 5).map((p) => (
            <Avatar key={p.id} className="size-6 ring-2 ring-card">
              <AvatarFallback
                className="text-white text-[10px] font-semibold"
                style={{ backgroundColor: p.color }}
              >
                {p.initials}
              </AvatarFallback>
            </Avatar>
          ))}
          {org.people.length > 5 && (
            <span className="size-6 rounded-full bg-muted ring-2 ring-card text-[10px] font-semibold grid place-items-center text-muted-foreground">
              +{org.people.length - 5}
            </span>
          )}
        </div>

        {org.projects.length > 0 && (
          <div className="flex items-center -space-x-1">
            {org.projects.slice(0, 3).map((p) => (
              <Link
                key={p.id}
                to="/projects/$projectId"
                params={{ projectId: p.id }}
                title={p.name}
                className="size-4 rounded-sm ring-2 ring-card hover:scale-110 transition-transform"
                style={{ backgroundColor: p.color }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
