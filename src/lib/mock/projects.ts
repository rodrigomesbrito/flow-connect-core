export type ProjectStatus = "Active" | "On hold" | "Completed";

export type Project = {
  id: string;
  name: string;
  description: string;
  color: string;
  status: ProjectStatus;
  phase: string;
  owner: { name: string; initials: string };
  openActionItems: number;
  openIssues: number;
  recentDecisions: number;
  upcomingMeetings: number;
  members: number;
  health: "On track" | "At risk" | "Off track";
  progress: number;
};

export const projects: Project[] = [
  {
    id: "marketing",
    name: "Marketing",
    description: "Q2 campaign and launch coordination",
    color: "oklch(0.62 0.18 250)",
    status: "Active",
    phase: "Execution",
    owner: { name: "Joey Cox", initials: "JC" },
    openActionItems: 12,
    openIssues: 3,
    recentDecisions: 5,
    upcomingMeetings: 2,
    members: 6,
    health: "On track",
    progress: 62,
  },
  {
    id: "product",
    name: "Product",
    description: "Roadmap, backlog and release planning",
    color: "oklch(0.62 0.22 300)",
    status: "Active",
    phase: "Discovery",
    owner: { name: "Zeb Evans", initials: "ZE" },
    openActionItems: 8,
    openIssues: 6,
    recentDecisions: 9,
    upcomingMeetings: 3,
    members: 9,
    health: "At risk",
    progress: 34,
  },
  {
    id: "qe",
    name: "Quality Engineering",
    description: "Testing strategy and regression coverage",
    color: "oklch(0.65 0.18 152)",
    status: "Active",
    phase: "Initiation",
    owner: { name: "Brendan Reilly", initials: "BR" },
    openActionItems: 4,
    openIssues: 1,
    recentDecisions: 2,
    upcomingMeetings: 1,
    members: 3,
    health: "On track",
    progress: 18,
  },
  {
    id: "design",
    name: "Design System",
    description: "Component library and design tokens",
    color: "oklch(0.78 0.16 75)",
    status: "On hold",
    phase: "Planning",
    owner: { name: "Olga Ortiz", initials: "OO" },
    openActionItems: 2,
    openIssues: 0,
    recentDecisions: 1,
    upcomingMeetings: 0,
    members: 4,
    health: "Off track",
    progress: 8,
  },
];

export const getProject = (id: string) => projects.find((p) => p.id === id);

export type ActivityEvent = {
  id: string;
  type: "decision" | "action" | "issue" | "meeting" | "member";
  title: string;
  actor: { name: string; initials: string };
  timestamp: string;
};

export const recentActivity: Record<string, ActivityEvent[]> = {
  marketing: [
    { id: "a1", type: "decision", title: "Approved launch date for Q2 campaign", actor: { name: "Joey Cox", initials: "JC" }, timestamp: "2h ago" },
    { id: "a2", type: "action", title: "Draft social media calendar", actor: { name: "Olga Ortiz", initials: "OO" }, timestamp: "5h ago" },
    { id: "a3", type: "issue", title: "Landing page copy missing legal review", actor: { name: "Brendan Reilly", initials: "BR" }, timestamp: "Yesterday" },
    { id: "a4", type: "meeting", title: "Weekly sync — campaign owners", actor: { name: "Joey Cox", initials: "JC" }, timestamp: "Yesterday" },
    { id: "a5", type: "member", title: "Ricardo joined the project", actor: { name: "Joey Cox", initials: "JC" }, timestamp: "2 days ago" },
  ],
};

export const upcomingMeetings: Record<string, { id: string; title: string; when: string; attendees: number }[]> = {
  marketing: [
    { id: "m1", title: "Campaign owners weekly", when: "Tomorrow, 10:00", attendees: 6 },
    { id: "m2", title: "Creative review", when: "Thu, 14:30", attendees: 4 },
  ],
};
