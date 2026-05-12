import { useSyncExternalStore } from "react";
import type { Meeting } from "@/lib/meetings/store";

export type ActionStatus = "Open" | "In Progress" | "Done";
export type ActionPriority = "Low" | "Medium" | "High";
export type ActionOrigin = "meeting" | "manual";

export type ActionItem = {
  id: string;
  projectId: string;
  text: string;
  assignee?: string;
  status: ActionStatus;
  priority: ActionPriority;
  dueDate?: string; // ISO date (yyyy-mm-dd or full ISO)
  origin: ActionOrigin;
  meetingId?: string;
  meetingTitle?: string;
  sourceLine?: number;
  linkedIssueId?: string;
  linkedIssueText?: string;
  createdAt: string;
  completedAt?: string;
};

const KEY = (projectId: string) => `mango.actionItems.${projectId}`;

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

const read = (projectId: string): ActionItem[] => {
  if (typeof window === "undefined") return [];
  return safeParse<ActionItem[]>(localStorage.getItem(KEY(projectId)), []);
};

const write = (projectId: string, list: ActionItem[]) => {
  localStorage.setItem(KEY(projectId), JSON.stringify(list));
  emit();
};

const newId = () =>
  `a_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/* ---------------- mutations ---------------- */

export const createActionItem = (
  projectId: string,
  input: {
    text: string;
    assignee?: string;
    dueDate?: string;
    priority?: ActionPriority;
    status?: ActionStatus;
    linkedIssueId?: string;
    linkedIssueText?: string;
  },
): ActionItem => {
  const item: ActionItem = {
    id: newId(),
    projectId,
    text: input.text.trim(),
    assignee: input.assignee?.trim() || undefined,
    status: input.status ?? "Open",
    priority: input.priority ?? "Medium",
    dueDate: input.dueDate,
    origin: "manual",
    linkedIssueId: input.linkedIssueId,
    linkedIssueText: input.linkedIssueText,
    createdAt: new Date().toISOString(),
  };
  write(projectId, [item, ...read(projectId)]);
  return item;
};

export const updateActionItem = (
  projectId: string,
  id: string,
  patch: Partial<
    Pick<
      ActionItem,
      | "text"
      | "assignee"
      | "status"
      | "priority"
      | "dueDate"
      | "linkedIssueId"
      | "linkedIssueText"
    >
  >,
) => {
  const list = read(projectId);
  write(
    projectId,
    list.map((it) => {
      if (it.id !== id) return it;
      const next: ActionItem = { ...it, ...patch };
      if (patch.status) {
        if (patch.status === "Done" && !next.completedAt) {
          next.completedAt = new Date().toISOString();
        } else if (patch.status !== "Done") {
          next.completedAt = undefined;
        }
      }
      return next;
    }),
  );
};

export const deleteActionItem = (projectId: string, id: string) => {
  write(
    projectId,
    read(projectId).filter((it) => it.id !== id),
  );
};

/* Duplicate an item — always becomes a new manual item, status reset to Open. */
export const duplicateActionItem = (
  projectId: string,
  id: string,
): ActionItem | undefined => {
  const list = read(projectId);
  const src = list.find((it) => it.id === id);
  if (!src) return undefined;
  const copy: ActionItem = {
    ...src,
    id: newId(),
    text: `${src.text} (copy)`,
    origin: "manual",
    meetingId: undefined,
    meetingTitle: undefined,
    sourceLine: undefined,
    status: "Open",
    completedAt: undefined,
    createdAt: new Date().toISOString(),
  };
  write(projectId, [copy, ...list]);
  return copy;
};

/* Sync from a completed meeting — upsert action items by stable parser id. */
export const syncActionsFromMeeting = (meeting: Meeting) => {
  const list = read(meeting.projectId);
  const byMeetingItemId = new Map(
    list
      .filter((it) => it.origin === "meeting" && it.meetingId === meeting.id)
      .map((it) => [it.id, it]),
  );

  const incoming = meeting.items.filter((it) => it.kind === "action");
  const next: ActionItem[] = [...list];

  incoming.forEach((p) => {
    const existing = byMeetingItemId.get(p.id);
    if (existing) {
      const idx = next.findIndex((n) => n.id === existing.id);
      if (idx >= 0) {
        next[idx] = {
          ...existing,
          text: p.text,
          assignee: existing.assignee ?? p.assignee,
          meetingTitle: meeting.title,
          sourceLine: p.sourceLine,
        };
      }
    } else {
      next.unshift({
        id: p.id,
        projectId: meeting.projectId,
        text: p.text,
        assignee: p.assignee,
        status: "Open",
        priority: "Medium",
        origin: "meeting",
        meetingId: meeting.id,
        meetingTitle: meeting.title,
        sourceLine: p.sourceLine,
        createdAt: meeting.completedAt ?? new Date().toISOString(),
      });
    }
  });

  write(meeting.projectId, next);
};

/* Used by seed module to bulk-load (only when no items exist yet). */
export const seedActionItems = (projectId: string, items: ActionItem[]) => {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(KEY(projectId))) return;
  localStorage.setItem(KEY(projectId), JSON.stringify(items));
  emit();
};

/* ---------------- hooks ---------------- */

const cache = new Map<string, ActionItem[]>();

export const useActionItems = (projectId: string): ActionItem[] => {
  return useSyncExternalStore(
    subscribe,
    () => {
      const fresh = read(projectId);
      const cached = cache.get(projectId);
      if (
        cached &&
        cached.length === fresh.length &&
        JSON.stringify(cached) === JSON.stringify(fresh)
      ) {
        return cached;
      }
      cache.set(projectId, fresh);
      return fresh;
    },
    () => [],
  );
};

/* ---------------- helpers ---------------- */

const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

export const isOverdue = (item: ActionItem): boolean => {
  if (!item.dueDate || item.status === "Done") return false;
  return startOfDay(new Date(item.dueDate)) < startOfDay(new Date());
};

export const isDueToday = (item: ActionItem): boolean => {
  if (!item.dueDate || item.status === "Done") return false;
  return (
    startOfDay(new Date(item.dueDate)).getTime() ===
    startOfDay(new Date()).getTime()
  );
};

const PRIORITY_RANK: Record<ActionPriority, number> = {
  High: 3,
  Medium: 2,
  Low: 1,
};

const STATUS_RANK: Record<ActionStatus, number> = {
  Open: 0,
  "In Progress": 1,
  Done: 2,
};

export const sortActionItems = (items: ActionItem[]): ActionItem[] => {
  return [...items].sort((a, b) => {
    // 1. Overdue first (only if not Done)
    const ao = isOverdue(a) ? 0 : 1;
    const bo = isOverdue(b) ? 0 : 1;
    if (ao !== bo) return ao - bo;

    // 2. Status rank
    const sr = STATUS_RANK[a.status] - STATUS_RANK[b.status];
    if (sr !== 0) return sr;

    // 3. dueDate asc (no due → end of group)
    const ad = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
    const bd = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
    if (ad !== bd) return ad - bd;

    // 4. priority desc
    return PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority];
  });
};
