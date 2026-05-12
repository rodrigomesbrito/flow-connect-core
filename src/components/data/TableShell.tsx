import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Standardized table container — soft border, rounded, subtle shadow.
 * Use with <TableHeader /> and <TableBody /> children, OR pass a
 * raw grid below the shell.
 */
export function TableShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-xl shadow-sm overflow-hidden",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Sticky header strip — uppercase, low-contrast labels.
 * Pass `gridClassName` matching the grid columns of each row.
 */
export function TableHeader({
  columns,
  gridClassName,
}: {
  columns: ReactNode[];
  gridClassName: string;
}) {
  return (
    <div
      className={cn(
        "sticky top-0 z-10 grid items-center gap-3 px-4 py-2.5",
        "bg-muted/40 border-b border-border",
        "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
        gridClassName,
      )}
    >
      {columns.map((c, i) => (
        <span key={i}>{c}</span>
      ))}
    </div>
  );
}

/**
 * Wraps row list with consistent dividers + smooth hover transitions
 * applied per-row (rows are still rendered by callers).
 */
export function TableBody({ children }: { children: ReactNode }) {
  return <div className="divide-y divide-border/60">{children}</div>;
}

export function TableFooter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "px-4 py-2.5 bg-muted/30 border-t border-border text-[11px] text-muted-foreground flex items-center justify-between",
        className,
      )}
    >
      {children}
    </div>
  );
}
