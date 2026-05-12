import { projects, type Person, type Project } from "./projects";

export type Role = "Owner" | "Admin" | "Member" | "Viewer";

export const orgPalette: Record<string, string> = {
  "City of Charlotte": "oklch(0.62 0.18 250)",
  "Reilly Engineering": "oklch(0.65 0.18 152)",
  "Apex Construction": "oklch(0.78 0.16 75)",
  "Stantec": "oklch(0.62 0.22 300)",
  "External Consultant": "oklch(0.65 0.2 15)",
  "Private": "oklch(0.65 0.2 15)",
  "State": "oklch(0.55 0.18 275)",
  "Federal": "oklch(0.7 0.13 200)",
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

const orgs = [
  "City of Charlotte",
  "Reilly Engineering",
  "Apex Construction",
  "Stantec",
  "External Consultant",
];

export type WorkspacePerson = {
  id: string;
  name: string;
  initials: string;
  title: string;
  org: string;
  email: string;
  phone: string;
  role: Role;
  status: "Active" | "Pending" | "Inactive";
  color: string;
  projects: { id: string; name: string; color: string }[];
};

export type WorkspaceOrg = {
  id: string;
  name: string;
  color: string;
  people: WorkspacePerson[];
  projects: { id: string; name: string; color: string }[];
};

function deterministicOrg(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return orgs[Math.abs(h) % orgs.length];
}

function deterministicTitle(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 17 + name.charCodeAt(i)) | 0;
  return titles[Math.abs(h) % titles.length];
}

function buildPeople(): WorkspacePerson[] {
  const map = new Map<string, WorkspacePerson>();

  const register = (
    person: Person,
    project: Project,
    isOwner: boolean,
  ) => {
    const key = person.name;
    const org = isOwner ? project.ownerOrg : deterministicOrg(person.name);
    const color = orgPalette[org] ?? "oklch(0.62 0.18 250)";
    const projRef = {
      id: project.id,
      name: project.name,
      color: project.color,
    };

    const existing = map.get(key);
    if (existing) {
      if (!existing.projects.some((p) => p.id === project.id)) {
        existing.projects.push(projRef);
      }
      if (isOwner && existing.role !== "Owner") existing.role = "Owner";
      return;
    }

    map.set(key, {
      id: person.name.toLowerCase().replace(/\s+/g, "-"),
      name: person.name,
      initials: person.initials,
      title: isOwner ? "Project Owner" : deterministicTitle(person.name),
      org,
      email: `${person.name.toLowerCase().replace(/\s+/g, ".")}@${org
        .toLowerCase()
        .split(" ")[0]}.com`,
      phone: `+1 (704) 555-${(100 + map.size * 17).toString().padStart(4, "0")}`,
      role: isOwner ? "Owner" : "Member",
      status: "Active",
      color,
      projects: [projRef],
    });
  };

  for (const p of projects) {
    register(p.owner, p, true);
    p.participants.forEach((person) => register(person, p, false));
  }

  return Array.from(map.values());
}

export const workspacePeople: WorkspacePerson[] = buildPeople();

export function getWorkspaceOrganizations(): WorkspaceOrg[] {
  const map = new Map<string, WorkspaceOrg>();

  for (const person of workspacePeople) {
    const existing = map.get(person.org);
    if (existing) {
      existing.people.push(person);
      for (const proj of person.projects) {
        if (!existing.projects.some((p) => p.id === proj.id)) {
          existing.projects.push(proj);
        }
      }
      continue;
    }
    map.set(person.org, {
      id: person.org.toLowerCase().replace(/\s+/g, "-"),
      name: person.org,
      color: orgPalette[person.org] ?? "oklch(0.62 0.18 250)",
      people: [person],
      projects: [...person.projects],
    });
  }

  return Array.from(map.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

export const workspaceOrganizations: WorkspaceOrg[] =
  getWorkspaceOrganizations();
