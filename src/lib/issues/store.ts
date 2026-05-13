import { useSyncExternalStore } from "react";
import type { Meeting } from "@/lib/meetings/store";

export type IssueStatus = "Open" | "In Review" | "Resolved";
export type IssueSeverity = "Low" | "Medium" | "High" | "Critical";
export type IssueOrigin = "meeting" | "manual";

export type Issue = {
  id: string;
  projectId: string;
  text: string;
  status: IssueStatus;
  severity: IssueSeverity;
  owner?: string;
  blocking: boolean;
  linkedActionItemId?: string;
  resolutionNotes?: string;
  origin: IssueOrigin;
  meetingId?: string;
  meetingTitle?: string;
  sourceLine?: number;
  createdAt: string;
  resolvedAt?: string;
};

const KEY = (projectId: string) => `mango.issues.v2.${projectId}`;

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

const read = (projectId: string): Issue[] => {
  if (typeof window === "undefined") return [];
  return safeParse<Issue[]>(localStorage.getItem(KEY(projectId)), []);
};

const write = (projectId: string, list: Issue[]) => {
  localStorage.setItem(KEY(projectId), JSON.stringify(list));
  emit();
};

const newId = () =>
  `is_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/* ---------------- mutations ---------------- */

export const createIssue = (
  projectId: string,
  input: {
    text: string;
    owner?: string;
    severity?: IssueSeverity;
    status?: IssueStatus;
    blocking?: boolean;
    linkedActionItemId?: string;
  },
): Issue => {
  const item: Issue = {
    id: newId(),
    projectId,
    text: input.text.trim(),
    owner: input.owner?.trim() || undefined,
    status: input.status ?? "Open",
    severity: input.severity ?? "Medium",
    blocking: input.blocking ?? false,
    linkedActionItemId: input.linkedActionItemId,
    origin: "manual",
    createdAt: new Date().toISOString(),
  };
  write(projectId, [item, ...read(projectId)]);
  return item;
};

export const updateIssue = (
  projectId: string,
  id: string,
  patch: Partial<
    Pick<
      Issue,
      | "text"
      | "owner"
      | "status"
      | "severity"
      | "blocking"
      | "linkedActionItemId"
      | "resolutionNotes"
    >
  >,
) => {
  const list = read(projectId);
  write(
    projectId,
    list.map((it) => {
      if (it.id !== id) return it;
      const next: Issue = { ...it, ...patch };
      if (patch.status) {
        if (patch.status === "Resolved" && !next.resolvedAt) {
          next.resolvedAt = new Date().toISOString();
        } else if (patch.status !== "Resolved") {
          next.resolvedAt = undefined;
        }
      }
      return next;
    }),
  );
};

export const deleteIssue = (projectId: string, id: string) => {
  write(projectId, read(projectId).filter((it) => it.id !== id));
};

export const duplicateIssue = (projectId: string, id: string): Issue | undefined => {
  const list = read(projectId);
  const src = list.find((it) => it.id === id);
  if (!src) return undefined;
  const copy: Issue = {
    ...src,
    id: newId(),
    text: `${src.text} (copy)`,
    origin: "manual",
    meetingId: undefined,
    meetingTitle: undefined,
    sourceLine: undefined,
    status: "Open",
    resolvedAt: undefined,
    createdAt: new Date().toISOString(),
  };
  write(projectId, [copy, ...list]);
  return copy;
};

/* Sync from a meeting — upsert issues by stable parser id. */
export const syncIssuesFromMeeting = (meeting: Meeting) => {
  const list = read(meeting.projectId);
  const byMeetingItemId = new Map(
    list
      .filter((it) => it.origin === "meeting" && it.meetingId === meeting.id)
      .map((it) => [it.id, it]),
  );

  const incoming = meeting.items.filter((it) => it.kind === "issue");
  const next: Issue[] = [...list];

  incoming.forEach((p) => {
    const existing = byMeetingItemId.get(p.id);
    if (existing) {
      const idx = next.findIndex((n) => n.id === existing.id);
      if (idx >= 0) {
        next[idx] = {
          ...existing,
          text: p.text,
          meetingTitle: meeting.title,
          sourceLine: p.sourceLine,
        };
      }
    } else {
      next.unshift({
        id: p.id,
        projectId: meeting.projectId,
        text: p.text,
        status: "Open",
        severity: "Medium",
        blocking: false,
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

export const seedIssues = (projectId: string, items: Issue[]) => {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(KEY(projectId))) return;
  localStorage.setItem(KEY(projectId), JSON.stringify(items));
  emit();
};

/* ---------------- hooks ---------------- */

const cache = new Map<string, Issue[]>();

export const useIssues = (projectId: string): Issue[] => {
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

const SEVERITY_RANK: Record<IssueSeverity, number> = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

const STATUS_RANK: Record<IssueStatus, number> = {
  Open: 0,
  "In Review": 1,
  Resolved: 2,
};

export const sortIssues = (items: Issue[]): Issue[] => {
  return [...items].sort((a, b) => {
    // 1. Blocking first (only if not Resolved)
    const ab = a.blocking && a.status !== "Resolved" ? 0 : 1;
    const bb = b.blocking && b.status !== "Resolved" ? 0 : 1;
    if (ab !== bb) return ab - bb;
    // 2. Status
    const sr = STATUS_RANK[a.status] - STATUS_RANK[b.status];
    if (sr !== 0) return sr;
    // 3. Severity desc
    const sv = SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity];
    if (sv !== 0) return sv;
    // 4. Newest first
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};

/* ---------------- stats hook ---------------- */

export type IssueStats = {
  open: number;
  inReview: number;
  blocking: number;
  resolved: number;
  total: number;
};

export const useIssueStats = (projectId: string): IssueStats => {
  const items = useIssues(projectId);
  return {
    open: items.filter((i) => i.status === "Open").length,
    inReview: items.filter((i) => i.status === "In Review").length,
    blocking: items.filter((i) => i.blocking && i.status !== "Resolved").length,
    resolved: items.filter((i) => i.status === "Resolved").length,
    total: items.length,
  };
};
