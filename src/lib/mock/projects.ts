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

export type FinancialData = {
  contractOriginalValue: number;
  totalPayAppApproved: number;
  addendumValue: number;
  totalProjectContract: number;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  color: string;
  status: ProjectStatus;
  phase: ProjectPhase;
  ownerOrg: OwnerOrg;
  owner: Person;
  members: number;
  participants: Person[];
  health: "On track" | "At risk" | "Off track";
  progress: number;
  lastUpdated: string;
  financial: FinancialData;
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
  { name: "Marcus Johnson", initials: "MJ" },
  { name: "Sarah Chen", initials: "SC" },
  { name: "David Kim", initials: "DK" },
  { name: "Emily Watson", initials: "EW" },
  { name: "Carlos Ruiz", initials: "CR" },
  { name: "Priya Patel", initials: "PP" },
  { name: "Lucas Vance", initials: "LV" },
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
    members: 6,
    participants: pickPeople(5, 0),
    health: "On track",
    progress: 65,
    lastUpdated: "2 hours ago",
    financial: {
      contractOriginalValue: 4_250_000,
      totalPayAppApproved: 2_762_500,
      addendumValue: 185_000,
      totalProjectContract: 4_435_000,
    },
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
    members: 9,
    participants: pickPeople(7, 1),
    health: "At risk",
    progress: 42,
    lastUpdated: "30 min ago",
    financial: {
      contractOriginalValue: 12_800_000,
      totalPayAppApproved: 5_376_000,
      addendumValue: 640_000,
      totalProjectContract: 13_440_000,
    },
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
    members: 4,
    participants: pickPeople(4, 2),
    health: "On track",
    progress: 78,
    lastUpdated: "Yesterday",
    financial: {
      contractOriginalValue: 1_950_000,
      totalPayAppApproved: 1_521_000,
      addendumValue: 0,
      totalProjectContract: 1_950_000,
    },
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
    members: 3,
    participants: pickPeople(3, 3),
    health: "On track",
    progress: 12,
    lastUpdated: "3 days ago",
    financial: {
      contractOriginalValue: 3_100_000,
      totalPayAppApproved: 0,
      addendumValue: 0,
      totalProjectContract: 3_100_000,
    },
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
    members: 7,
    participants: pickPeople(6, 4),
    health: "On track",
    progress: 55,
    lastUpdated: "5 hours ago",
    financial: {
      contractOriginalValue: 6_700_000,
      totalPayAppApproved: 3_685_000,
      addendumValue: 220_000,
      totalProjectContract: 6_920_000,
    },
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
    members: 5,
    participants: pickPeople(5, 5),
    health: "Off track",
    progress: 28,
    lastUpdated: "1 week ago",
    financial: {
      contractOriginalValue: 8_500_000,
      totalPayAppApproved: 2_380_000,
      addendumValue: 0,
      totalProjectContract: 8_500_000,
    },
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
    members: 5,
    participants: pickPeople(5, 6),
    health: "On track",
    progress: 33,
    lastUpdated: "Today",
    financial: {
      contractOriginalValue: 2_800_000,
      totalPayAppApproved: 924_000,
      addendumValue: 95_000,
      totalProjectContract: 2_895_000,
    },
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
    members: 4,
    participants: pickPeople(4, 7),
    health: "On track",
    progress: 100,
    lastUpdated: "2 weeks ago",
    financial: {
      contractOriginalValue: 5_100_000,
      totalPayAppApproved: 5_100_000,
      addendumValue: 310_000,
      totalProjectContract: 5_410_000,
    },
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
    members: 8,
    participants: pickPeople(7, 8),
    health: "At risk",
    progress: 48,
    lastUpdated: "4 hours ago",
    financial: {
      contractOriginalValue: 18_200_000,
      totalPayAppApproved: 8_736_000,
      addendumValue: 1_200_000,
      totalProjectContract: 19_400_000,
    },
  },
];

export const getProject = (id: string) => projects.find((p) => p.id === id);
