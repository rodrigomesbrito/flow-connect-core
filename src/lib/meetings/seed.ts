import type { Meeting, PublishedItem, ItemKind } from "./store";
import { parseNotes } from "./store";
import {
  seedActionItems,
  type ActionItem,
  type ActionPriority,
  type ActionStatus,
} from "@/lib/action-items/store";
import {
  seedDecisionMeta,
  type DecisionMeta,
  type DecisionStatus,
} from "@/lib/decisions/store";

const KEY = (projectId: string) => `mango.meetings.${projectId}`;
const PUB_KEY = (projectId: string, kind: ItemKind) => `mango.${kind}s.${projectId}`;
const SEED_FLAG = (projectId: string) => `mango.meetings.${projectId}.seeded.v3`;
const ACTIONS_KEY = (projectId: string) => `mango.actionItems.${projectId}`;
const DECISION_META_KEY = (projectId: string) => `mango.decisionMeta.${projectId}`;

const daysAgo = (n: number, h = 9, m = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};
const daysFromNow = (n: number, h = 10, m = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

const mid = (slug: string) => `m_seed_${slug}`;

type Seed = Omit<Meeting, "items"> & { _publish?: boolean };

const SEEDS: Record<string, Seed[]> = {
  "bryant-farms": [
    {
      id: mid("bf-kickoff"),
      projectId: "bryant-farms",
      title: "Pre-construction kickoff",
      date: daysAgo(9, 9, 0),
      attendees: ["Joey Cox", "Olga Ortiz", "Brendan Reilly", "Ricardo Silva", "Mei Tanaka"],
      status: "Completed",
      createdAt: daysAgo(9, 8, 45),
      completedAt: daysAgo(9, 10, 30),
      _publish: true,
      notes: `Pre-construction kickoff — Bryant Farms Rd Ext Ph2

Agenda
- Scope confirmation
- Schedule baseline
- Permits & easements
- Risks & open items

Scope
- Roadway extension from STA 10+00 to STA 18+50
- Utility relocation along south ROW
- Two driveway tie-ins for adjacent parcels

[decision] Approve bid package #3 with revised quantities for asphalt
[decision] Use phased traffic control plan rev. C as baseline
[issue] Utility relocation delay risk on STA 12+50 (Duke Energy alignment)
[action @Olga Ortiz] Send updated easement schedule by Friday
[action @Brendan Reilly] Coordinate with Duke Energy on relocation window
[action] Confirm easement filing window with city clerk

Next steps
- Weekly owner sync starting next Tuesday
- Bid package #3 award targeted for next Wednesday`,
    },
    {
      id: mid("bf-owner-1"),
      projectId: "bryant-farms",
      title: "Owner sync — week 1",
      date: daysAgo(2, 14, 0),
      attendees: ["Joey Cox", "Olga Ortiz", "Brendan Reilly"],
      status: "Completed",
      createdAt: daysAgo(2, 13, 55),
      completedAt: daysAgo(2, 14, 50),
      _publish: true,
      notes: `Owner sync — week 1

Status
- Bid package #3 awarded Monday
- Easement filings submitted; awaiting confirmation
- Duke Energy site walk scheduled

Discussion
- Owner asked about contingency for utility delay
- Reviewed two-week look-ahead

[decision] Hold 5% schedule contingency for Q3 utility risk
[issue] Driveway tie-in #2 needs revised grading per owner request
[action @Joey Cox] Share two-week look-ahead by EOD
[action @Olga Ortiz] Update grading sheet for driveway tie-in #2
[action] Draft change order narrative for tie-in scope`,
    },
    {
      id: mid("bf-live"),
      projectId: "bryant-farms",
      title: "Field coordination — utility walkdown",
      date: daysAgo(0, 10, 30),
      attendees: ["Joey Cox", "Brendan Reilly", "Ricardo Silva"],
      status: "Live",
      createdAt: daysAgo(0, 10, 25),
      notes: `Utility walkdown — STA 11+00 to 13+50

Observations
- Existing 12" water main shallower than record drawing (~3.2 ft cover)
- Duke Energy duct bank confirmed on south side, 6 ft offset
- Communications conduit present, owner unknown

[issue] Water main cover below standard at STA 12+10
[decision] Pothole at three locations before relocation design freeze
[action @Brendan Reilly] Schedule potholing crew for Thursday
[action] Identify owner of unknown comms conduit`,
    },
    {
      id: mid("bf-bidreview"),
      projectId: "bryant-farms",
      title: "Bid review — package #4",
      date: daysFromNow(2, 14, 30),
      attendees: ["Joey Cox", "Zeb Evans", "Olga Ortiz", "Aisha Khan"],
      status: "Scheduled",
      createdAt: daysAgo(0, 8, 0),
      notes: "",
    },
    {
      id: mid("bf-owner-2"),
      projectId: "bryant-farms",
      title: "Owner sync — week 2",
      date: daysFromNow(5, 10, 0),
      attendees: ["Joey Cox", "Olga Ortiz", "Brendan Reilly"],
      status: "Scheduled",
      createdAt: daysAgo(0, 8, 5),
      notes: "",
    },
  ],
  "northlake-bridge": [
    {
      id: mid("nb-design-review"),
      projectId: "northlake-bridge",
      title: "30% design review",
      date: daysAgo(6, 13, 0),
      attendees: ["Zeb Evans", "Hannah Lee", "Diego Marin", "Mei Tanaka", "Aisha Khan"],
      status: "Completed",
      createdAt: daysAgo(6, 12, 50),
      completedAt: daysAgo(6, 14, 45),
      _publish: true,
      notes: `30% design review — Northlake Bridge Replacement

Highlights
- Span configuration: 3 spans @ 120 ft (steel plate girder)
- Detour routing finalized along Old Mill Rd
- Geotech recommends micropile foundations at Pier 2

[decision] Adopt 3-span steel plate girder configuration
[decision] Detour via Old Mill Rd with temporary signal at Hwy 9
[issue] Right-of-way acquisition risk at Pier 2 abutment
[issue] Environmental review pending for stream impact
[action @Zeb Evans] Submit ROW exhibits to legal by next Friday
[action @Hannah Lee] Coordinate stream impact memo with USACE
[action] Update construction cost estimate to reflect micropile change`,
    },
    {
      id: mid("nb-detour"),
      projectId: "northlake-bridge",
      title: "Detour signage workshop",
      date: daysAgo(1, 9, 30),
      attendees: ["Zeb Evans", "Diego Marin"],
      status: "Completed",
      createdAt: daysAgo(1, 9, 20),
      completedAt: daysAgo(1, 10, 30),
      _publish: true,
      notes: `Detour signage workshop

[decision] Use type C advance warning signs at all four approaches
[issue] Sight distance concern at Old Mill / Cedar intersection
[action @Diego Marin] Run sight-distance analysis at Old Mill / Cedar
[action] Coordinate with NCDOT on signage approval timeline`,
    },
    {
      id: mid("nb-stakeholder"),
      projectId: "northlake-bridge",
      title: "Stakeholder briefing — public works",
      date: daysFromNow(3, 11, 0),
      attendees: ["Zeb Evans", "Hannah Lee", "Joey Cox"],
      status: "Scheduled",
      createdAt: daysAgo(0, 8, 0),
      notes: "",
    },
  ],
  "airport-taxiway": [
    {
      id: mid("at-night-ops"),
      projectId: "airport-taxiway",
      title: "Night work operations plan",
      date: daysAgo(4, 19, 0),
      attendees: ["Ricardo Silva", "Hannah Lee", "Diego Marin", "Mei Tanaka"],
      status: "Completed",
      createdAt: daysAgo(4, 18, 55),
      completedAt: daysAgo(4, 20, 30),
      _publish: true,
      notes: `Night work operations plan — Taxiway A resurfacing

Window
- 22:00 to 05:00 nightly, Mon–Thu
- FAA NOTAM submitted for 6-week window

Logistics
- Mill & overlay crew, two pavers
- Lighting plan: portable towers + perimeter cones
- Aircraft tow path coordination with airfield ops

[decision] Lock 22:00–05:00 work window for 6 consecutive weeks
[decision] Stage materials at south apron, not east hangar
[issue] Conflict risk with cargo operations on Tue/Thu
[action @Ricardo Silva] Confirm NOTAM dates with FAA
[action @Diego Marin] Publish nightly briefing template
[action] Coordinate cargo carrier exception schedule`,
    },
    {
      id: mid("at-safety"),
      projectId: "airport-taxiway",
      title: "Airfield safety briefing",
      date: daysFromNow(1, 16, 0),
      attendees: ["Ricardo Silva", "Hannah Lee", "Joey Cox"],
      status: "Scheduled",
      createdAt: daysAgo(0, 8, 0),
      notes: "",
    },
  ],
  "stormwater-iv": [
    {
      id: mid("sw-basin-c"),
      projectId: "stormwater-iv",
      title: "Basin C construction sync",
      date: daysAgo(3, 9, 0),
      attendees: ["Brendan Reilly", "Olga Ortiz", "Aisha Khan"],
      status: "Completed",
      createdAt: daysAgo(3, 8, 55),
      completedAt: daysAgo(3, 10, 0),
      _publish: true,
      notes: `Basin C construction sync

Progress
- Excavation 70% complete
- Outlet structure formwork in place

[decision] Pour outlet structure on Friday weather permitting
[issue] Soft subgrade at northeast corner requires undercut
[action @Brendan Reilly] Order additional #57 stone for undercut
[action] Confirm concrete delivery slot for Friday`,
    },
  ],
  "westside-water": [
    {
      id: mid("ww-procurement"),
      projectId: "westside-water",
      title: "Procurement strategy",
      date: daysAgo(5, 10, 0),
      attendees: ["Aisha Khan", "Joey Cox", "Hannah Lee"],
      status: "Completed",
      createdAt: daysAgo(5, 9, 55),
      completedAt: daysAgo(5, 11, 15),
      _publish: true,
      notes: `Procurement strategy — Westside Water Main

[decision] Single-prime contract with allowance for valves
[issue] Long-lead time on 24" butterfly valves (16 weeks)
[action @Aisha Khan] Issue early-order package for valves
[action] Validate budget impact of long-lead items`,
    },
    {
      id: mid("ww-coord"),
      projectId: "westside-water",
      title: "Pressure zone coordination",
      date: daysFromNow(4, 13, 0),
      attendees: ["Aisha Khan", "Brendan Reilly"],
      status: "Scheduled",
      createdAt: daysAgo(0, 8, 0),
      notes: "",
    },
  ],
};

const seeded = new Set<string>();

export const ensureSeeded = (projectId: string) => {
  if (typeof window === "undefined") return;
  if (seeded.has(projectId)) return;
  seeded.add(projectId);

  // Don't reseed if v2 seed flag is set
  if (localStorage.getItem(SEED_FLAG(projectId))) return;

  const raw = SEEDS[projectId];
  if (!raw || raw.length === 0) {
    localStorage.setItem(SEED_FLAG(projectId), "1");
    return;
  }

  // Fresh seed v3: wipe any pre-existing meetings/actions/decision meta for this project.
  localStorage.removeItem(KEY(projectId));
  localStorage.removeItem(ACTIONS_KEY(projectId));
  localStorage.removeItem(DECISION_META_KEY(projectId));
  (["action", "issue", "decision"] as const).forEach((kind) => {
    localStorage.removeItem(PUB_KEY(projectId, kind));
  });

  const meetings: Meeting[] = raw
    .map(({ _publish: _p, ...m }) => ({
      ...m,
      items: parseNotes(m.notes),
    }))
    // Most recent first (matches createMeeting behavior)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  localStorage.setItem(KEY(projectId), JSON.stringify(meetings));

  // Publish items from completed meetings flagged for publish
  const toPublish = raw.filter((m) => m._publish && m.status === "Completed");
  (["action", "issue", "decision"] as const).forEach((kind) => {
    const published: PublishedItem[] = [];
    toPublish.forEach((m) => {
      const items = parseNotes(m.notes);
      items
        .filter((it) => it.kind === kind)
        .forEach((it) => {
          published.push({
            ...it,
            meetingId: m.id,
            meetingTitle: m.title,
            publishedAt: m.completedAt ?? m.date,
          });
        });
    });
    if (published.length > 0) {
      localStorage.setItem(PUB_KEY(projectId, kind), JSON.stringify(published));
    }
  });

  // Seed action items from completed/published meetings + a couple of manual entries.
  // Vary status / priority / dueDate to make the Action Items screen feel realistic.
  const STATUS_CYCLE: ActionStatus[] = ["Open", "In Progress", "Open", "Done", "Open"];
  const PRIORITY_CYCLE: ActionPriority[] = ["High", "Medium", "Low", "Medium", "High"];
  const DUE_OFFSETS = [-3, 0, 2, 7, -1, 5, 1, 14, -7, 3]; // negative = overdue, 0 = today

  const isoDate = (offsetDays: number) => {
    const d = new Date();
    d.setHours(17, 0, 0, 0);
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString();
  };

  const actionItems: ActionItem[] = [];
  let cursor = 0;
  toPublish.forEach((m) => {
    const items = parseNotes(m.notes).filter((it) => it.kind === "action");
    items.forEach((it) => {
      const status = STATUS_CYCLE[cursor % STATUS_CYCLE.length];
      const priority = PRIORITY_CYCLE[cursor % PRIORITY_CYCLE.length];
      const due = DUE_OFFSETS[cursor % DUE_OFFSETS.length];
      cursor++;
      actionItems.push({
        id: it.id,
        projectId,
        text: it.text,
        assignee: it.assignee,
        status,
        priority,
        dueDate: status === "Done" ? undefined : isoDate(due),
        origin: "meeting",
        meetingId: m.id,
        meetingTitle: m.title,
        sourceLine: it.sourceLine,
        createdAt: m.completedAt ?? m.date,
        completedAt: status === "Done" ? m.completedAt : undefined,
      });
    });
  });

  // A richer set of manual items per project to make the Action Items screen
  // feel like a real working environment (varied status, priority, due dates,
  // assignees including "Me" so the My Tasks tab is populated).
  const projectAttendees = Array.from(
    new Set(raw.flatMap((m) => m.attendees)),
  );
  const pick = (i: number) => projectAttendees[i % projectAttendees.length];

  type ManualSeed = Omit<ActionItem, "id" | "projectId" | "origin" | "createdAt">;

  const MANUAL_BY_PROJECT: Record<string, ManualSeed[]> = {
    "bryant-farms": [
      { text: "Review weekly safety report and circulate to crew leads", assignee: "Me", status: "Open", priority: "High", dueDate: isoDate(0) },
      { text: "Update project risk register with utility delay scenarios", assignee: pick(1), status: "In Progress", priority: "High", dueDate: isoDate(-2) },
      { text: "Submit monthly progress invoice to owner", assignee: "Me", status: "Open", priority: "Medium", dueDate: isoDate(3) },
      { text: "Schedule survey crew for STA 14+00 layout check", assignee: pick(3), status: "Open", priority: "Medium", dueDate: isoDate(1) },
      { text: "Collect signed easement from parcel #214", assignee: pick(0), status: "In Progress", priority: "High", dueDate: isoDate(-5) },
      { text: "Order traffic control devices for phase 2", assignee: pick(2), status: "Done", priority: "Medium" },
      { text: "Verify asphalt mix design submittal #18", assignee: pick(4), status: "Open", priority: "Low", dueDate: isoDate(7) },
      { text: "Update look-ahead schedule in P6", assignee: "Me", status: "Open", priority: "Medium", dueDate: isoDate(2) },
      { text: "Close out RFI #042 — driveway grading", assignee: pick(1), status: "Done", priority: "Low" },
    ],
    "northlake-bridge": [
      { text: "Compile 60% design review package", assignee: "Me", status: "In Progress", priority: "High", dueDate: isoDate(4) },
      { text: "Coordinate USACE pre-application meeting", assignee: pick(2), status: "Open", priority: "High", dueDate: isoDate(-1) },
      { text: "Reconcile micropile cost delta with estimating", assignee: pick(4), status: "Open", priority: "Medium", dueDate: isoDate(5) },
      { text: "Draft public notice for detour rollout", assignee: "Me", status: "Open", priority: "Medium", dueDate: isoDate(8) },
      { text: "Review hydraulic report appendix C", assignee: pick(1), status: "Done", priority: "Low" },
      { text: "Confirm survey baseline at Pier 2 abutment", assignee: pick(3), status: "In Progress", priority: "Medium", dueDate: isoDate(0) },
      { text: "File ROW exhibits with county recorder", assignee: pick(0), status: "Open", priority: "High", dueDate: isoDate(-3) },
    ],
    "airport-taxiway": [
      { text: "Submit revised NOTAM dates to FAA", assignee: pick(0), status: "Open", priority: "High", dueDate: isoDate(-1) },
      { text: "Brief night crew on perimeter lighting plan", assignee: "Me", status: "Open", priority: "Medium", dueDate: isoDate(0) },
      { text: "Confirm cargo carrier exception window", assignee: pick(1), status: "In Progress", priority: "High", dueDate: isoDate(2) },
      { text: "Procure additional reflective cones (250 ct)", assignee: pick(2), status: "Done", priority: "Medium" },
      { text: "Update FOD walk checklist for night ops", assignee: "Me", status: "Open", priority: "Low", dueDate: isoDate(6) },
      { text: "Coordinate fuel truck staging with airfield ops", assignee: pick(3), status: "Open", priority: "Medium", dueDate: isoDate(1) },
    ],
    "stormwater-iv": [
      { text: "Order #57 stone for northeast undercut", assignee: pick(0), status: "In Progress", priority: "High", dueDate: isoDate(-1) },
      { text: "Schedule concrete pour for outlet structure", assignee: "Me", status: "Open", priority: "High", dueDate: isoDate(2) },
      { text: "Update SWPPP for Basin C grading change", assignee: pick(2), status: "Open", priority: "Medium", dueDate: isoDate(4) },
      { text: "Coordinate erosion control inspection", assignee: pick(1), status: "Done", priority: "Low" },
      { text: "Submit weekly stormwater monitoring report", assignee: "Me", status: "Open", priority: "Medium", dueDate: isoDate(0) },
    ],
    "westside-water": [
      { text: "Issue early-order PO for 24\" butterfly valves", assignee: pick(0), status: "In Progress", priority: "High", dueDate: isoDate(-2) },
      { text: "Validate budget impact of long-lead items", assignee: "Me", status: "Open", priority: "High", dueDate: isoDate(1) },
      { text: "Review pressure zone hydraulic model", assignee: pick(2), status: "Open", priority: "Medium", dueDate: isoDate(5) },
      { text: "Coordinate water shutdown notice with utility", assignee: pick(1), status: "Open", priority: "Medium", dueDate: isoDate(7) },
      { text: "Finalize procurement matrix for board approval", assignee: "Me", status: "Done", priority: "Medium" },
      { text: "Walk down tie-in location at Cedar/9th", assignee: pick(0), status: "Open", priority: "Low", dueDate: isoDate(3) },
    ],
  };

  const manualSeeds: ManualSeed[] = MANUAL_BY_PROJECT[projectId] ?? [
    { text: "Review weekly safety report", assignee: pick(0), status: "Open", priority: "Medium", dueDate: isoDate(1) },
    { text: "Update project risk register", assignee: pick(1), status: "In Progress", priority: "High", dueDate: isoDate(-2) },
  ];

  manualSeeds.forEach((m, i) => {
    actionItems.unshift({
      id: `a_seed_manual_${projectId}_${i}`,
      projectId,
      origin: "manual",
      createdAt: isoDate(-5 - i),
      completedAt: m.status === "Done" ? isoDate(-1 - i) : undefined,
      ...m,
    });
  });

  if (actionItems.length > 0) {
    seedActionItems(projectId, actionItems);
  }

  // Seed Decision metadata for published decisions — vary status & decisor
  // so the Decisions screen feels populated and realistic.
  const STATUS_CYCLE: DecisionStatus[] = [
    "Approved",
    "Approved",
    "Proposed",
    "Approved",
    "Reverted",
    "Approved",
    "Proposed",
  ];
  const decisionMeta: Record<string, DecisionMeta> = {};
  let dCursor = 0;
  toPublish.forEach((m) => {
    const items = parseNotes(m.notes).filter((it) => it.kind === "decision");
    items.forEach((it) => {
      const status = STATUS_CYCLE[dCursor % STATUS_CYCLE.length];
      const decidedBy = m.attendees[dCursor % Math.max(1, m.attendees.length)];
      dCursor++;
      decisionMeta[it.id] = {
        status,
        decidedBy: status === "Proposed" ? undefined : decidedBy,
        decidedAt: status === "Approved" ? m.completedAt : undefined,
        notes:
          status === "Reverted"
            ? "Superseded after follow-up review."
            : undefined,
        updatedAt: m.completedAt ?? m.date,
      };
    });
  });
  if (Object.keys(decisionMeta).length > 0) {
    seedDecisionMeta(projectId, decisionMeta);
  }

  localStorage.setItem(SEED_FLAG(projectId), "1");
};
