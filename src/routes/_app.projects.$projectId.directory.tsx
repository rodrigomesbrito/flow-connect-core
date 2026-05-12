import { createFileRoute, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Search,
  UserPlus,
  Mail,
  Phone,
  Building2,
  Filter,
  MoreHorizontal,
  Crown,
  Shield,
  Eye,
  User as UserIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { getProject } from "@/lib/mock/projects";

type Role = "Owner" | "Admin" | "Member" | "Viewer";
type Member = {
  name: string;
  initials: string;
  role: Role;
  title: string;
  org: string;
  email: string;
  phone: string;
  status: "Active" | "Pending" | "Inactive";
  color: string;
};

const orgPalette: Record<string, string> = {
  "City of Charlotte": "oklch(0.62 0.18 250)",
  "Reilly Engineering": "oklch(0.65 0.18 152)",
  "Apex Construction": "oklch(0.78 0.16 75)",
  "Stantec": "oklch(0.62 0.22 300)",
  "External Consultant": "oklch(0.65 0.2 15)",
};

const titles = [
  "Project Manager",
  "Civil Engineer",
  "Field Supervisor",
  "Procurement Lead",
  "Surveyor",
  "Designer",
  "Estimator",
  "Inspector",
];

const orgs = Object.keys(orgPalette);

export const Route = createFileRoute("/_app/projects/$projectId/directory")({
  loader: ({ params }) => {
    const project = getProject(params.projectId);
    if (!project) throw notFound();

    const members: Member[] = [
      {
        name: project.owner.name,
        initials: project.owner.initials,
        role: "Owner",
        title: "Project Owner",
        org: project.ownerOrg,
        email: `${project.owner.name.toLowerCase().replace(/\s+/g, ".")}@mango.tech`,
        phone: "+1 (704) 555-0142",
        status: "Active",
        color: orgPalette[project.ownerOrg] ?? "oklch(0.62 0.18 250)",
      },
      ...project.participants.map((p, i): Member => {
        const org = orgs[i % orgs.length];
        return {
          name: p.name,
          initials: p.initials,
          role: i === 0 ? "Admin" : i < 3 ? "Member" : "Viewer",
          title: titles[i % titles.length],
          org,
          email: `${p.name.toLowerCase().replace(/\s+/g, ".")}@${org.toLowerCase().split(" ")[0]}.com`,
          phone: `+1 (704) 555-${(100 + i * 17).toString().padStart(4, "0")}`,
          status: i === 4 ? "Pending" : "Active",
          color: orgPalette[org] ?? "oklch(0.62 0.18 250)",
        };
      }),
    ];

    return { project, members };
  },
  head: ({ params }) => {
    const project = getProject(params.projectId);
    return {
      meta: [
        { title: `Directory — ${project?.name ?? "Project"}` },
        {
          name: "description",
          content: "People, organizations, and contacts for this project.",
        },
      ],
    };
  },
  component: DirectoryPage,
});

const roleConfig: Record<Role, { icon: typeof Crown; className: string }> = {
  Owner: { icon: Crown, className: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30" },
  Admin: { icon: Shield, className: "bg-primary/10 text-primary border-primary/30" },
  Member: { icon: UserIcon, className: "bg-muted text-foreground/70 border-border" },
  Viewer: { icon: Eye, className: "bg-muted text-muted-foreground border-border" },
};

function DirectoryPage() {
  const { project, members } = Route.useLoaderData();
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "All">("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((m: Member) => {
      if (roleFilter !== "All" && m.role !== roleFilter) return false;
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.org.toLowerCase().includes(q) ||
        m.title.toLowerCase().includes(q)
      );
    });
  }, [members, query, roleFilter]);

  const orgGroups = useMemo(() => {
    const map = new Map<string, Member[]>();
    members.forEach((m: Member) => {
      const arr = map.get(m.org) ?? [];
      arr.push(m);
      map.set(m.org, arr);
    });
    return Array.from(map.entries());
  }, [members]);

  return (
    <div className="px-6 py-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Directory</h1>
          <p className="text-sm text-muted-foreground mt-1">
            People, organizations, and roles in {project.name}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="size-4" />
            Export
          </Button>
          <Button size="sm" className="gap-2">
            <UserPlus className="size-4" />
            Invite people
          </Button>
        </div>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Members" value={members.length} />
        <StatCard label="Organizations" value={orgGroups.length} />
        <StatCard
          label="Active"
          value={members.filter((m: Member) => m.status === "Active").length}
        />
        <StatCard
          label="Pending invites"
          value={members.filter((m: Member) => m.status === "Pending").length}
        />
      </div>

      <Tabs defaultValue="people" className="w-full">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <TabsList>
            <TabsTrigger value="people">People</TabsTrigger>
            <TabsTrigger value="organizations">Organizations</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, email, org…"
                className="pl-8 w-64"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="size-4" />
                  {roleFilter === "All" ? "All roles" : roleFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {(["All", "Owner", "Admin", "Member", "Viewer"] as const).map((r) => (
                  <DropdownMenuItem key={r} onClick={() => setRoleFilter(r)}>
                    {r}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <TabsContent value="people" className="mt-0">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="grid grid-cols-12 px-4 py-2.5 border-b border-border bg-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <div className="col-span-4">Name</div>
              <div className="col-span-3">Organization</div>
              <div className="col-span-2">Role</div>
              <div className="col-span-2">Contact</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>

            {filtered.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-muted-foreground">
                No people match your filters.
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {filtered.map((m: Member) => (
                  <li
                    key={m.email}
                    className="grid grid-cols-12 items-center px-4 py-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="col-span-4 flex items-center gap-3 min-w-0">
                      <Avatar className="size-9 shrink-0">
                        <AvatarFallback
                          className="text-white text-[12px] font-semibold"
                          style={{ backgroundColor: m.color }}
                        >
                          {m.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate flex items-center gap-2">
                          {m.name}
                          {m.status === "Pending" && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                              Pending
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {m.title}
                        </div>
                      </div>
                    </div>

                    <div className="col-span-3 flex items-center gap-2 min-w-0">
                      <span
                        className="size-2 rounded-full shrink-0"
                        style={{ backgroundColor: m.color }}
                      />
                      <span className="text-sm truncate">{m.org}</span>
                    </div>

                    <div className="col-span-2">
                      <RoleBadge role={m.role} />
                    </div>

                    <div className="col-span-2 flex items-center gap-1.5 text-muted-foreground">
                      <a
                        href={`mailto:${m.email}`}
                        className="p-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors"
                        title={m.email}
                      >
                        <Mail className="size-4" />
                      </a>
                      <a
                        href={`tel:${m.phone}`}
                        className="p-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors"
                        title={m.phone}
                      >
                        <Phone className="size-4" />
                      </a>
                    </div>

                    <div className="col-span-1 flex justify-end">
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
                            Remove from project
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </TabsContent>

        <TabsContent value="organizations" className="mt-0">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {orgGroups.map(([org, people]) => (
              <div
                key={org}
                className="rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <span
                    className="size-10 rounded-lg grid place-items-center text-white shrink-0"
                    style={{ backgroundColor: orgPalette[org] ?? "oklch(0.62 0.18 250)" }}
                  >
                    <Building2 className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold truncate">{org}</div>
                    <div className="text-xs text-muted-foreground">
                      {people.length} {people.length === 1 ? "person" : "people"}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex -space-x-2">
                  {people.slice(0, 5).map((p) => (
                    <Avatar key={p.email} className="size-7 ring-2 ring-card">
                      <AvatarFallback
                        className="text-white text-[10px] font-semibold"
                        style={{ backgroundColor: p.color }}
                      >
                        {p.initials}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {people.length > 5 && (
                    <span className="size-7 rounded-full bg-muted ring-2 ring-card text-[10px] font-semibold grid place-items-center text-muted-foreground">
                      +{people.length - 5}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3">
      <div className="text-2xl font-semibold tracking-tight">{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

function RoleBadge({ role }: { role: Role }) {
  const cfg = roleConfig[role];
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-medium ${cfg.className}`}
    >
      <Icon className="size-3" />
      {role}
    </span>
  );
}
