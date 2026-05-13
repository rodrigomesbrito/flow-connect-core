import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
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
  ChevronLeft,
  ChevronRight,
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
import { Toolbar, ToolbarSearch, ToolbarFilter } from "@/components/data/Toolbar";
import { EmptyState, NoResults } from "@/components/data/EmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

  // Pagination logic
  const [page, setPage] = useState(1);
  const pageSize = 8; // Small page size to demonstrate pagination with mock data
  const totalPages = Math.ceil(filtered.length / pageSize);

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [query, roleFilter, orgFilter]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Page Header */}
      <header className="flex-none px-8 py-6 border-b border-border/40">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight text-foreground">People</h1>
            <p className="text-[14px] text-muted-foreground mt-1">
              Everyone across your workspace and the projects they belong to.
            </p>
          </div>
          <Button className="h-9 px-4 text-[13px] font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md">
            <UserPlus className="size-4 mr-2" /> Invite people
          </Button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="flex-none px-8 py-3 border-b border-border/40 bg-muted/10">
        <Toolbar
          hasActiveFilters={hasFilters}
          onClear={() => {
            setQuery("");
            setRoleFilter("all");
            setOrgFilter("all");
          }}
          className="mb-0"
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
      </div>

      <div className="flex-1 overflow-auto p-6 bg-muted/10">
        <div className="max-w-6xl mx-auto">
          {workspacePeople.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No people yet"
              description="Invite your first teammates to start collaborating."
            />
          ) : (
            <div className="bg-card border border-border/50 rounded-[14px] overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/40 hover:bg-muted/40">
                  <TableRow className="border-border/40 hover:bg-transparent">
                    <TableHead className="h-10 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider pl-5">Name</TableHead>
                    <TableHead className="h-10 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Email</TableHead>
                    <TableHead className="h-10 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Organization</TableHead>
                    <TableHead className="h-10 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Role</TableHead>
                    <TableHead className="h-10 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Projects</TableHead>
                    <TableHead className="h-10 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-right pr-5">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((m) => (
                    <PersonRow key={m.id} person={m} />
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
        </div>
      </div>
    </div>
  );
}

function PersonRow({ person }: { person: WorkspacePerson }) {
  return (
    <TableRow className="group hover:bg-muted/20 border-border/40 transition-colors">
      {/* Name Column */}
      <TableCell className="pl-5 py-3 align-middle">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="size-9 shrink-0">
            <AvatarFallback
              className="text-white text-[12px] font-semibold"
              style={{ backgroundColor: person.color }}
            >
              {person.initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="text-[14px] font-medium truncate flex items-center gap-2 text-foreground">
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
            <div className="text-[12px] text-muted-foreground truncate mt-0.5">
              {person.title}
            </div>
          </div>
        </div>
      </TableCell>

      {/* Email Column */}
      <TableCell className="py-3 align-middle">
        <div className="text-[13px] text-muted-foreground truncate max-w-[180px]">
          {person.email}
        </div>
      </TableCell>

      {/* Organization Column */}
      <TableCell className="py-3 align-middle">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="size-2 rounded-full shrink-0"
            style={{ backgroundColor: person.color }}
          />
          <span className="text-[13px] truncate text-muted-foreground font-medium">{person.org}</span>
        </div>
      </TableCell>

      {/* Role Column */}
      <TableCell className="py-3 align-middle">
        <RoleBadge role={person.role} />
      </TableCell>

      {/* Projects Column */}
      <TableCell className="py-3 align-middle">
        <div className="flex items-center gap-1.5 min-w-0">
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
          <span className="text-[12px] text-muted-foreground font-medium tabular-nums ml-1">
            {person.projects.length}
          </span>
        </div>
      </TableCell>

      {/* Actions Column */}
      <TableCell className="pr-5 py-3 align-middle text-right">
        <div className="flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                <MoreHorizontal className="size-4" />
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
      </TableCell>
    </TableRow>
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
