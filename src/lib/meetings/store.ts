import { useSyncExternalStore } from "react";
import { ensureSeeded } from "./seed";
import { syncActionsFromMeeting } from "@/lib/action-items/store";
import { syncIssuesFromMeeting } from "@/lib/issues/store";

export type ItemKind = "action" | "issue" | "decision";

export type GeneratedItem = {
  id: string;
  kind: ItemKind;
  text: string;
  assignee?: string;
  sourceLine: number;
};

export type MeetingStatus = "Scheduled" | "Live" | "Completed";

export type Meeting = {
  id: string;
  projectId: string;
  title: string;
  date: string; // ISO
  attendees: string[];
  notes: string;
  items: GeneratedItem[];
  status: MeetingStatus;
  createdAt: string;
  completedAt?: string;
};

export type PublishedItem = GeneratedItem & {
  meetingId: string;
  meetingTitle: string;
  publishedAt: string;
};

const KEY = (projectId: string) => `mango.meetings.${projectId}`;
const PUB_KEY = (projectId: string, kind: ItemKind) =>
  `mango.${kind}s.${projectId}`;

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

const readMeetings = (projectId: string): Meeting[] => {
  if (typeof window === "undefined") return [];
  ensureSeeded(projectId);
  return safeParse<Meeting[]>(localStorage.getItem(KEY(projectId)), []);
};

const writeMeetings = (projectId: string, list: Meeting[]) => {
  localStorage.setItem(KEY(projectId), JSON.stringify(list));
  emit();
};

const readPublished = (projectId: string, kind: ItemKind): PublishedItem[] => {
  if (typeof window === "undefined") return [];
  ensureSeeded(projectId);
  return safeParse<PublishedItem[]>(localStorage.getItem(PUB_KEY(projectId, kind)), []);
};

const writePublished = (projectId: string, kind: ItemKind, items: PublishedItem[]) => {
  localStorage.setItem(PUB_KEY(projectId, kind), JSON.stringify(items));
  emit();
};

/* ---------------- parser ---------------- */

// Action lines accept an optional leading verb prefix (e.g. "executar ") before the marker,
// so notes like "executar [action @Joey] ship doc" still create an action item.
const RE_ACTION = /^\s*(?:executar\s+)?\[action(?:\s+@([^\]]+))?\]\s*(.+?)\s*$/i;
const RE_ISSUE = /^\s*\[issue\]\s*(.+?)\s*$/i;
const RE_DECISION = /^\s*\[decision\]\s*(.+?)\s*$/i;

const hashId = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return `i_${(h >>> 0).toString(36)}`;
};

export const parseNotes = (notes: string, prev: GeneratedItem[] = []): GeneratedItem[] => {
  const lines = notes.split("\n");
  const out: GeneratedItem[] = [];
  const prevById = new Map(prev.map((p) => [p.id, p]));

  lines.forEach((line, idx) => {
    let kind: ItemKind | null = null;
    let text = "";
    let assignee: string | undefined;

    const a = line.match(RE_ACTION);
    if (a) {
      kind = "action";
      assignee = a[1]?.trim() || undefined;
      text = a[2].trim();
    } else {
      const i = line.match(RE_ISSUE);
      if (i) {
        kind = "issue";
        text = i[1].trim();
      } else {
        const d = line.match(RE_DECISION);
        if (d) {
          kind = "decision";
          text = d[1].trim();
        }
      }
    }

    if (!kind || !text) return;

    const id = hashId(`${kind}|${idx}|${text}`);
    const existing = prevById.get(id);
    out.push({
      id,
      kind,
      text,
      sourceLine: idx + 1,
      assignee: existing?.assignee ?? assignee,
    });
  });

  return out;
};

/* ---------------- mutations ---------------- */

const newId = () =>
  `m_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const createMeeting = (input: {
  projectId: string;
  title: string;
  date: string;
  attendees: string[];
}): Meeting => {
  const meeting: Meeting = {
    id: newId(),
    projectId: input.projectId,
    title: input.title.trim() || "Untitled meeting",
    date: input.date,
    attendees: input.attendees,
    notes: "",
    items: [],
    status: "Live",
    createdAt: new Date().toISOString(),
  };
  const list = readMeetings(input.projectId);
  writeMeetings(input.projectId, [meeting, ...list]);
  return meeting;
};

export const updateMeetingNotes = (projectId: string, id: string, notes: string) => {
  const list = readMeetings(projectId);
  const next = list.map((m) =>
    m.id === id ? { ...m, notes, items: parseNotes(notes, m.items) } : m,
  );
  writeMeetings(projectId, next);
  // Live sync: keep Action Items in sync as the user types in a Live meeting.
  const updated = next.find((m) => m.id === id);
  if (updated) {
    syncActionsFromMeeting(updated);
    syncIssuesFromMeeting(updated);
  }
};

export const updateMeetingMeta = (
  projectId: string,
  id: string,
  patch: Partial<Pick<Meeting, "title" | "date" | "attendees">>,
) => {
  const list = readMeetings(projectId);
  writeMeetings(
    projectId,
    list.map((m) => (m.id === id ? { ...m, ...patch } : m)),
  );
};

export const updateItem = (
  projectId: string,
  meetingId: string,
  itemId: string,
  patch: Partial<Pick<GeneratedItem, "text" | "assignee">>,
) => {
  const list = readMeetings(projectId);
  writeMeetings(
    projectId,
    list.map((m) =>
      m.id === meetingId
        ? {
            ...m,
            items: m.items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)),
          }
        : m,
    ),
  );
};

export const removeItem = (projectId: string, meetingId: string, itemId: string) => {
  const list = readMeetings(projectId);
  writeMeetings(
    projectId,
    list.map((m) =>
      m.id === meetingId
        ? { ...m, items: m.items.filter((it) => it.id !== itemId) }
        : m,
    ),
  );
};

export const deleteMeeting = (projectId: string, id: string) => {
  writeMeetings(projectId, readMeetings(projectId).filter((m) => m.id !== id));
};

export const endMeeting = (projectId: string, id: string) => {
  const list = readMeetings(projectId);
  const meeting = list.find((m) => m.id === id);
  if (!meeting) return;

  const completedAt = new Date().toISOString();
  const updated: Meeting = { ...meeting, status: "Completed", completedAt };
  writeMeetings(
    projectId,
    list.map((m) => (m.id === id ? updated : m)),
  );

  // Publish items grouped by kind
  (["action", "issue", "decision"] as const).forEach((kind) => {
    const existing = readPublished(projectId, kind);
    // Remove any previous publications from this meeting (idempotent)
    const filtered = existing.filter((p) => p.meetingId !== id);
    const fresh: PublishedItem[] = updated.items
      .filter((it) => it.kind === kind)
      .map((it) => ({
        ...it,
        meetingId: id,
        meetingTitle: updated.title,
        publishedAt: completedAt,
      }));
    writePublished(projectId, kind, [...fresh, ...filtered]);
  });

  // Sync action items into the operational store (upsert by stable id).
  syncActionsFromMeeting(updated);
  syncIssuesFromMeeting(updated);
};

/* ---------------- hooks ---------------- */

const meetingsCache = new Map<string, Meeting[]>();

export const useMeetings = (projectId: string): Meeting[] => {
  return useSyncExternalStore(
    subscribe,
    () => {
      const fresh = readMeetings(projectId);
      const cached = meetingsCache.get(projectId);
      if (cached && cached.length === fresh.length && JSON.stringify(cached) === JSON.stringify(fresh)) {
        return cached;
      }
      meetingsCache.set(projectId, fresh);
      return fresh;
    },
    () => [],
  );
};

export const useMeeting = (projectId: string, id: string): Meeting | undefined => {
  const list = useMeetings(projectId);
  return list.find((m) => m.id === id);
};

const publishedCache = new Map<string, PublishedItem[]>();

export const usePublishedItems = (projectId: string, kind: ItemKind): PublishedItem[] => {
  return useSyncExternalStore(
    subscribe,
    () => {
      const fresh = readPublished(projectId, kind);
      const key = `${projectId}|${kind}`;
      const cached = publishedCache.get(key);
      if (
        cached &&
        cached.length === fresh.length &&
        JSON.stringify(cached) === JSON.stringify(fresh)
      ) {
        return cached;
      }
      publishedCache.set(key, fresh);
      return fresh;
    },
    () => [],
  );
};
