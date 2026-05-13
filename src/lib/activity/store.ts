import { useSyncExternalStore } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type ActivityType =
  | "decision"
  | "action"
  | "issue"
  | "meeting"
  | "member";

export type ActivityEvent = {
  id: string;
  projectId: string;
  type: ActivityType;
  title: string;
  actor: { name: string; initials: string };
  timestamp: string; // human-readable relative time
  createdAt: string; // ISO
};

/* ------------------------------------------------------------------ */
/*  localStorage helpers                                               */
/* ------------------------------------------------------------------ */

const KEY = (projectId: string) => `relay.activity.${projectId}`;

const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
const emit = () => listeners.forEach((cb) => cb());

const safeParse = <T,>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const read = (projectId: string): ActivityEvent[] => {
  if (typeof window === "undefined") return [];
  return safeParse<ActivityEvent[]>(localStorage.getItem(KEY(projectId)), []);
};

const write = (projectId: string, list: ActivityEvent[]) => {
  localStorage.setItem(KEY(projectId), JSON.stringify(list));
  emit();
};

/* ------------------------------------------------------------------ */
/*  Mutations                                                          */
/* ------------------------------------------------------------------ */

const MAX_EVENTS = 50;

const newId = () =>
  `ev_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const relativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return "Yesterday";
  if (diffD < 7) return `${diffD} days ago`;
  if (diffD < 30) return `${Math.floor(diffD / 7)} weeks ago`;
  return date.toLocaleDateString();
};

export const logActivity = (input: {
  projectId: string;
  type: ActivityType;
  title: string;
  actorName: string;
}) => {
  const initials = input.actorName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const event: ActivityEvent = {
    id: newId(),
    projectId: input.projectId,
    type: input.type,
    title: input.title,
    actor: { name: input.actorName, initials },
    timestamp: relativeTime(new Date()),
    createdAt: new Date().toISOString(),
  };

  const list = read(input.projectId);
  write(input.projectId, [event, ...list].slice(0, MAX_EVENTS));
};

/* ------------------------------------------------------------------ */
/*  Seed                                                               */
/* ------------------------------------------------------------------ */

const SEED_FLAG = (projectId: string) =>
  `relay.activity.${projectId}.seeded.v1`;

export const seedActivity = (
  projectId: string,
  events: ActivityEvent[],
) => {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(SEED_FLAG(projectId))) return;
  if (read(projectId).length > 0) {
    localStorage.setItem(SEED_FLAG(projectId), "1");
    return;
  }
  write(projectId, events);
  localStorage.setItem(SEED_FLAG(projectId), "1");
};

/** Pre-built seed events for bryant-farms — migrated from the old hardcoded mock. */
export const ACTIVITY_SEEDS: Record<string, ActivityEvent[]> = {
  "bryant-farms": [
    {
      id: "ev_seed_1",
      projectId: "bryant-farms",
      type: "decision",
      title: "Approved bid package #3",
      actor: { name: "Joey Cox", initials: "JC" },
      timestamp: "2h ago",
      createdAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
    },
    {
      id: "ev_seed_2",
      projectId: "bryant-farms",
      type: "action",
      title: "Update easement schedule",
      actor: { name: "Olga Ortiz", initials: "OO" },
      timestamp: "5h ago",
      createdAt: new Date(Date.now() - 5 * 3600_000).toISOString(),
    },
    {
      id: "ev_seed_3",
      projectId: "bryant-farms",
      type: "issue",
      title: "Utility conflict on STA 12+50",
      actor: { name: "Brendan Reilly", initials: "BR" },
      timestamp: "Yesterday",
      createdAt: new Date(Date.now() - 24 * 3600_000).toISOString(),
    },
    {
      id: "ev_seed_4",
      projectId: "bryant-farms",
      type: "meeting",
      title: "Pre-construction kickoff",
      actor: { name: "Joey Cox", initials: "JC" },
      timestamp: "Yesterday",
      createdAt: new Date(Date.now() - 26 * 3600_000).toISOString(),
    },
  ],
};

export const seedAllActivity = () => {
  for (const [projectId, events] of Object.entries(ACTIVITY_SEEDS)) {
    seedActivity(projectId, events);
  }
};

/* ------------------------------------------------------------------ */
/*  Hooks                                                              */
/* ------------------------------------------------------------------ */

const cacheMap = new Map<string, ActivityEvent[]>();

export const useActivity = (projectId: string): ActivityEvent[] => {
  return useSyncExternalStore(
    subscribe,
    () => {
      const fresh = read(projectId);
      const cached = cacheMap.get(projectId);
      if (
        cached &&
        cached.length === fresh.length &&
        JSON.stringify(cached) === JSON.stringify(fresh)
      ) {
        return cached;
      }
      cacheMap.set(projectId, fresh);
      return fresh;
    },
    () => [],
  );
};
