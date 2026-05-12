import { useSyncExternalStore } from "react";
import { usePublishedItems, type PublishedItem } from "@/lib/meetings/store";

export type DecisionStatus = "Proposed" | "Approved" | "Reverted";

export type DecisionMeta = {
  status: DecisionStatus;
  decidedBy?: string;
  notes?: string;
  decidedAt?: string;
  updatedAt: string;
};

export type Decision = PublishedItem & DecisionMeta;

const META_KEY = (projectId: string) => `mango.decisionMeta.${projectId}`;

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

const readMeta = (projectId: string): Record<string, DecisionMeta> => {
  if (typeof window === "undefined") return {};
  return safeParse<Record<string, DecisionMeta>>(
    localStorage.getItem(META_KEY(projectId)),
    {},
  );
};

const writeMeta = (projectId: string, map: Record<string, DecisionMeta>) => {
  localStorage.setItem(META_KEY(projectId), JSON.stringify(map));
  emit();
};

const DEFAULT_META = (): DecisionMeta => ({
  status: "Proposed",
  updatedAt: new Date().toISOString(),
});

export const updateDecisionMeta = (
  projectId: string,
  decisionId: string,
  patch: Partial<Pick<DecisionMeta, "status" | "decidedBy" | "notes">>,
) => {
  const map = readMeta(projectId);
  const prev = map[decisionId] ?? DEFAULT_META();
  const next: DecisionMeta = {
    ...prev,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  if (patch.status === "Approved" && !prev.decidedAt) {
    next.decidedAt = new Date().toISOString();
  }
  if (patch.status && patch.status !== "Approved") {
    // keep history of decidedAt only when approved
    if (patch.status === "Proposed") next.decidedAt = undefined;
  }
  map[decisionId] = next;
  writeMeta(projectId, map);
};

/* Bulk-seed (only when no meta exists yet). */
export const seedDecisionMeta = (
  projectId: string,
  map: Record<string, DecisionMeta>,
) => {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(META_KEY(projectId))) return;
  localStorage.setItem(META_KEY(projectId), JSON.stringify(map));
  emit();
};

const metaCache = new Map<string, Record<string, DecisionMeta>>();

const useMeta = (projectId: string): Record<string, DecisionMeta> => {
  return useSyncExternalStore(
    subscribe,
    () => {
      const fresh = readMeta(projectId);
      const cached = metaCache.get(projectId);
      if (cached && JSON.stringify(cached) === JSON.stringify(fresh)) {
        return cached;
      }
      metaCache.set(projectId, fresh);
      return fresh;
    },
    () => ({}),
  );
};

export const useDecisions = (projectId: string): Decision[] => {
  const published = usePublishedItems(projectId, "decision");
  const meta = useMeta(projectId);
  return published.map((p) => {
    const m = meta[p.id] ?? DEFAULT_META();
    return { ...p, ...m };
  });
};

/* ---------------- helpers ---------------- */

const STATUS_RANK: Record<DecisionStatus, number> = {
  Proposed: 0,
  Approved: 1,
  Reverted: 2,
};

export const sortDecisions = (items: Decision[]): Decision[] => {
  return [...items].sort((a, b) => {
    // 1. Status (Proposed first — needs attention)
    const sr = STATUS_RANK[a.status] - STATUS_RANK[b.status];
    if (sr !== 0) return sr;
    // 2. Most recent publishedAt first
    return (
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  });
};
