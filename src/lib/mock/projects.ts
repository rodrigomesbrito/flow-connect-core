export type ProjectStatus = "Active" | "Planning" | "On Hold" | "Completed";
export type ProjectPhase =
  | "Procurement"
  | "Design"
  | "Construction"
  | "Closeout"
  | "Planning"
  | "Discovery"
  | "Execution"
  | "Initiation";
export type OwnerOrg =
  | "City of Charlotte"
  | "Private"
  | "State"
  | "Federal";

export type Person = { name: string; initials: string };

export type Project = {
  id: string;
  name: string;
  description: string;
  color: string;
  status: ProjectStatus;
  phase: ProjectPhase;
  ownerOrg: OwnerOrg;
  owner: Person;
  openActionItems: number;
  openIssues: number;
  recentDecisions: number;
  upcomingMeetings: number;
  pendingTasks: number;
  meetingsThisWeek: number;
  members: number;
  participants: Person[];
  health: "On track" | "At risk" | "Off track";
  progress: number;
  lastUpdated: string;
};

const colorBlue = "oklch(0.62 0.18 250)";
const colorGreen = "oklch(0.65 0.18 152)";
const colorAmber = "oklch(0.78 0.16 75)";
const colorPurple = "oklch(0.62 0.22 300)";
const colorRed = "oklch(0.6 0.23 25)";
const colorTeal = "oklch(0.7 0.13 200)";
const colorIndigo = "oklch(0.55 0.18 275)";
const colorRose = "oklch(0.65 0.2 15)";
const colorLime = "oklch(0.78 0.18 130)";

const peoplePool: Person[] = [
  { name: "Joey Cox", initials: "JC" },
  { name: "Zeb Evans", initials: "ZE" },
  { name: "Brendan Reilly", initials: "BR" },
  { name: "Olga Ortiz", initials: "OO" },
  { name: "Ricardo Silva", initials: "RS" },
  { name: "Mei Tanaka", initials: "MT" },
  { name: "Aisha Khan", initials: "AK" },
  { name: "Diego Marin", initials: "DM" },
  { name: "Hannah Lee", initials: "HL" },
];

const pickPeople = (n: number, offset = 0): Person[] =>
  Array.from({ length: n }, (_, i) => peoplePool[(i + offset) % peoplePool.length]);

export const projects: Project[] = [
  {
    id: "bryant-farms",
    name: "Bryant Farms Rd Ext Ph2",
    description: "Roadway extension and utility relocation, phase 2.",
    color: colorBlue,
    status: "Active",
    phase: "Procurement",
    ownerOrg: "City of Charlotte",
    owner: { name: "Joey Cox", initials: "JC" },
    openActionItems: 12,
    openIssues: 4,
    recentDecisions: 5,
    upcomingMeetings: 2,
    pendingTasks: 12,
    meetingsThisWeek: 2,
    members: 6,
    participants: pickPeople(5, 0),
    health: "On track",
    progress: 65,
    lastUpdated: "2 hours ago",
  },
  {
    id: "northlake-bridge",
    name: "Northlake Bridge Replacement",
    description: "Full bridge replacement with detour design.",
    color: colorPurple,
    status: "Active",
    phase: "Design",
    ownerOrg: "State",
    owner: { name: "Zeb Evans", initials: "ZE" },
    openActionItems: 8,
    openIssues: 6,
    recentDecisions: 9,
    upcomingMeetings: 3,
    pendingTasks: 18,
    meetingsThisWeek: 3,
    members: 9,
    participants: pickPeople(7, 1),
    health: "At risk",
    progress: 42,
    lastUpdated: "30 min ago",
  },
  {
    id: "stormwater-iv",
    name: "Stormwater Capacity IV",
    description: "Drainage improvements across four basins.",
    color: colorTeal,
    status: "Active",
    phase: "Construction",
    ownerOrg: "City of Charlotte",
    owner: { name: "Brendan Reilly", initials: "BR" },
    openActionItems: 4,
    openIssues: 1,
    recentDecisions: 2,
    upcomingMeetings: 1,
    pendingTasks: 9,
    meetingsThisWeek: 1,
    members: 4,
    participants: pickPeople(4, 2),
    health: "On track",
    progress: 78,
    lastUpdated: "Yesterday",
  },
  {
    id: "midtown-greenway",
    name: "Midtown Greenway",
    description: "Multi-use path connecting downtown corridors.",
    color: colorGreen,
    status: "Planning",
    phase: "Planning",
    ownerOrg: "City of Charlotte",
    owner: { name: "Olga Ortiz", initials: "OO" },
    openActionItems: 3,
    openIssues: 0,
    recentDecisions: 1,
    upcomingMeetings: 0,
    pendingTasks: 5,
    meetingsThisWeek: 0,
    members: 3,
    participants: pickPeople(3, 3),
    health: "On track",
    progress: 12,
    lastUpdated: "3 days ago",
  },
  {
    id: "airport-taxiway",
    name: "Airport Taxiway Resurfacing",
    description: "Night work resurfacing of taxiway A.",
    color: colorAmber,
    status: "Active",
    phase: "Construction",
    ownerOrg: "Federal",
    owner: { name: "Ricardo Silva", initials: "RS" },
    openActionItems: 11,
    openIssues: 3,
    recentDecisions: 6,
    upcomingMeetings: 2,
    pendingTasks: 14,
    meetingsThisWeek: 2,
    members: 7,
    participants: pickPeople(6, 4),
    health: "On track",
    progress: 55,
    lastUpdated: "5 hours ago",
  },
  {
    id: "hawthorne-mixed",
    name: "Hawthorne Mixed-Use",
    description: "Private mixed-use development site work.",
    color: colorRose,
    status: "On Hold",
    phase: "Design",
    ownerOrg: "Private",
    owner: { name: "Mei Tanaka", initials: "MT" },
    openActionItems: 2,
    openIssues: 5,
    recentDecisions: 1,
    upcomingMeetings: 0,
    pendingTasks: 3,
    meetingsThisWeek: 0,
    members: 5,
    participants: pickPeople(5, 5),
    health: "Off track",
    progress: 28,
    lastUpdated: "1 week ago",
  },
  {
    id: "westside-water",
    name: "Westside Water Main",
    description: "Pressure zone reconfiguration and main upgrade.",
    color: colorIndigo,
    status: "Active",
    phase: "Procurement",
    ownerOrg: "City of Charlotte",
    owner: { name: "Aisha Khan", initials: "AK" },
    openActionItems: 6,
    openIssues: 2,
    recentDecisions: 3,
    upcomingMeetings: 1,
    pendingTasks: 7,
    meetingsThisWeek: 1,
    members: 5,
    participants: pickPeople(5, 6),
    health: "On track",
    progress: 33,
    lastUpdated: "Today",
  },
  {
    id: "harbor-closeout",
    name: "Harbor District Closeout",
    description: "Project closeout and as-built submission.",
    color: colorLime,
    status: "Completed",
    phase: "Closeout",
    ownerOrg: "State",
    owner: { name: "Diego Marin", initials: "DM" },
    openActionItems: 1,
    openIssues: 0,
    recentDecisions: 4,
    upcomingMeetings: 0,
    pendingTasks: 1,
    meetingsThisWeek: 0,
    members: 4,
    participants: pickPeople(4, 7),
    health: "On track",
    progress: 100,
    lastUpdated: "2 weeks ago",
  },
  {
    id: "transit-hub",
    name: "Eastside Transit Hub",
    description: "Multi-modal transit hub feasibility & design.",
    color: colorRed,
    status: "Active",
    phase: "Design",
    ownerOrg: "Federal",
    owner: { name: "Hannah Lee", initials: "HL" },
    openActionItems: 9,
    openIssues: 4,
    recentDecisions: 7,
    upcomingMeetings: 2,
    pendingTasks: 11,
    meetingsThisWeek: 2,
    members: 8,
    participants: pickPeople(7, 8),
    health: "At risk",
    progress: 48,
    lastUpdated: "4 hours ago",
  },
];

export const getProject = (id: string) => projects.find((p) => p.id === id);

export type ActivityEvent = {
  id: string;
  type: "decision" | "action" | "issue" | "meeting" | "member";
  title: string;
  actor: Person;
  timestamp: string;
};

export const recentActivity: Record<string, ActivityEvent[]> = {
  "bryant-farms": [
    { id: "a1", type: "decision", title: "Approved bid package #3", actor: { name: "Joey Cox", initials: "JC" }, timestamp: "2h ago" },
    { id: "a2", type: "action", title: "Update easement schedule", actor: { name: "Olga Ortiz", initials: "OO" }, timestamp: "5h ago" },
    { id: "a3", type: "issue", title: "Utility conflict on STA 12+50", actor: { name: "Brendan Reilly", initials: "BR" }, timestamp: "Yesterday" },
    { id: "a4", type: "meeting", title: "Pre-construction kickoff", actor: { name: "Joey Cox", initials: "JC" }, timestamp: "Yesterday" },
  ],
};

export const upcomingMeetings: Record<string, { id: string; title: string; when: string; attendees: number }[]> = {
  "bryant-farms": [
    { id: "m1", title: "Owner sync", when: "Tomorrow, 10:00", attendees: 6 },
    { id: "m2", title: "Bid review", when: "Thu, 14:30", attendees: 4 },
  ],
};
