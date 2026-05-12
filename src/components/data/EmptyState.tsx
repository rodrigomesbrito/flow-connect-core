import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  hint,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  hint?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-border bg-card/50 px-6 py-14 text-center",
        className,
      )}
    >
      {Icon && (
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
          {description}
        </p>
      )}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
      {hint && (
        <div className="mt-8 mx-auto max-w-md text-left">{hint}</div>
      )}
    </div>
  );
}

export function NoResults({
  message = "Nothing matches your filters.",
  onClear,
}: {
  message?: string;
  onClear?: () => void;
}) {
  return (
    <div className="px-6 py-12 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className="mt-2 text-xs font-medium text-primary hover:underline"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
