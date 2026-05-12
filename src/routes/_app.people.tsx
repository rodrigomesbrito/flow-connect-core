import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  UserPlus,
  Mail,
  Phone,
  MoreHorizontal,
  Crown,
  Shield,
  Eye,
  User as UserIcon,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/data/PageHeader";
import { Toolbar, ToolbarSearch, ToolbarFilter } from "@/components/data/Toolbar";
import {
  TableShell,
  TableHeader,
  TableBody,
} from "@/components/data/TableShell";
import { EmptyState, NoResults } from "@/components/data/EmptyState";
import { workspacePeople, type Role, type WorkspacePerson } from "@/lib/mock/people";

export const Route = createFileRoute("/_app/people")({
  head: () => ({
    meta: [
      { title: "People — Relay" },
      {
        name: "description",
        content: "All people across your workspace, with the projects they belong to.",
      },
    ],
  }),
  component: PeoplePage,
});

const roleConfig: Record<Role, { icon: typeof Crown; className: string }> = {
  Owner: {
    icon: Crown,
    className:
      "bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-amber-500/30",
  },
  Admin: {
    icon: Shield,
    className: "bg-primary/10 text-primary ring-primary/30",
  },
  Member: {
    icon: UserIcon,
    className: "bg-muted text-foreground/70 ring-border",
  },
  Viewer: {
    icon: Eye,
    className: "bg-muted text-muted-foreground ring-border",
  },
};

function PeoplePage() {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [orgFilter, setOrgFilter] = useState<string>("all");

  const orgs = useMemo(
    () =>
      Array.from(new Set(workspacePeople.map((p) => p.org))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return workspacePeople.filter((m) => {
      if (roleFilter !== "all" && m.role !== roleFilter) return false;
      if (orgFilter !== "all" && m.org !== orgFilter) return false;
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.org.toLowerCase().includes(q) ||
        m.title.toLowerCase().includes(q)
      );
    });
  }, [query, roleFilter, orgFilter]);

  const hasFilters =
    roleFilter !== "all" || orgFilter !== "all" || query.trim().length > 0;

  return (
    <div className="px-6 py-6 max-w-7xl mx-auto">
      <PageHeader
        title="People"
        description="Everyone across your workspace and the projects they belong to."
        actions={
          <Button size="sm" className="gap-2">
            <UserPlus className="size-4" /> Invite people
          </Button>
        }
      />

      <Toolbar
        hasActiveFilters={hasFilters}
        onClear={() => {
          setQuery("");
          setRoleFilter("all");
          setOrgFilter("all");
        }}
      >
        <ToolbarSearch
          value={query}
          onChange={setQuery}
          placeholder="Search name, email, org…"
        />
        <ToolbarFilter
          label="Role"
          value={roleFilter}
          options={[
            { value: "all", label: "All" },
            { value: "Owner", label: "Owner" },
            { value: "Admin", label: "Admin" },
            { value: "Member", label: "Member" },
            { value: "Viewer", label: "Viewer" },
          ]}
          onChange={setRoleFilter}
        />
        <ToolbarFilter
          label="Organization"
          value={orgFilter}
          options={[
            { value: "all", label: "All" },
            ...orgs.map((o) => ({ value: o, label: o })),
          ]}
          onChange={setOrgFilter}
        />
      </Toolbar>

      {workspacePeople.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No people yet"
          description="Invite your first teammates to start collaborating."
        />
      ) : (
        <TableShell>
          <TableHeader>
            <div className="grid grid-cols-12 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <div className="col-span-4">Name</div>
              <div className="col-span-3">Organization</div>
              <div className="col-span-2">Role</div>
              <div className="col-span-2">Projects</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>
          </TableHeader>

          {filtered.length === 0 ? (
            <NoResults
              onClear={() => {
                setQuery("");
                setRoleFilter("all");
                setOrgFilter("all");
              }}
            />
          ) : (
            <TableBody>
              {filtered.map((m) => (
                <PersonRow key={m.id} person={m} />
              ))}
            </TableBody>
          )}
        </TableShell>
      )}
    </div>
  );
}

function PersonRow({ person }: { person: WorkspacePerson }) {
  return (
    <li className="grid grid-cols-12 items-center px-4 py-3 hover:bg-muted/30 transition-colors group">
      <div className="col-span-4 flex items-center gap-3 min-w-0">
        <Avatar className="size-9 shrink-0">
          <AvatarFallback
            className="text-white text-[12px] font-semibold"
            style={{ backgroundColor: person.color }}
          >
            {person.initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="text-sm font-medium truncate flex items-center gap-2">
            {person.name}
            {person.status === "Pending" && (
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0 h-4"
              >
                Pending
              </Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {person.title}
          </div>
        </div>
      </div>

      <div className="col-span-3 flex items-center gap-2 min-w-0">
        <span
          className="size-2 rounded-full shrink-0"
          style={{ backgroundColor: person.color }}
        />
        <span className="text-sm truncate">{person.org}</span>
      </div>

      <div className="col-span-2">
        <RoleBadge role={person.role} />
      </div>

      <div className="col-span-2 flex items-center gap-1.5 min-w-0">
        <div className="flex items-center -space-x-1.5">
          {person.projects.slice(0, 3).map((p) => (
            <Link
              key={p.id}
              to="/projects/$projectId"
              params={{ projectId: p.id }}
              title={p.name}
              className="size-5 rounded-md ring-2 ring-card shrink-0 hover:scale-110 transition-transform"
              style={{ backgroundColor: p.color }}
            />
          ))}
          {person.projects.length > 3 && (
            <span className="size-5 rounded-md ring-2 ring-card bg-muted text-[9px] font-semibold grid place-items-center text-muted-foreground">
              +{person.projects.length - 3}
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground tabular-nums">
          {person.projects.length}
        </span>
      </div>

      <div className="col-span-1 flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <a
          href={`mailto:${person.email}`}
          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title={person.email}
        >
          <Mail className="size-3.5" />
        </a>
        <a
          href={`tel:${person.phone}`}
          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title={person.phone}
        >
          <Phone className="size-3.5" />
        </a>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <MoreHorizontal className="size-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View profile</DropdownMenuItem>
            <DropdownMenuItem>Change role</DropdownMenuItem>
            <DropdownMenuItem>Send message</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              Remove from workspace
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </li>
  );
}

function RoleBadge({ role }: { role: Role }) {
  const cfg = roleConfig[role];
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md ring-1 ring-inset text-[11px] font-medium ${cfg.className}`}
    >
      <Icon className="size-3" />
      {role}
    </span>
  );
}
