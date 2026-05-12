import { cn } from "@/lib/utils";

type Tone = "default" | "destructive" | "success" | "warning" | "muted";

export function KpiStat({
  label,
  value,
  tone = "default",
  active,
  onClick,
}: {
  label: string;
  value: number | string;
  tone?: Tone;
  active?: boolean;
  onClick?: () => void;
}) {
  const isInteractive = !!onClick;
  const Comp = isInteractive ? "button" : "div";
  return (
    <Comp
      type={isInteractive ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "p-4 bg-card border border-border rounded-xl shadow-sm text-left transition-all",
        isInteractive &&
          "cursor-pointer hover:border-foreground/20 hover:shadow-md",
        active && "border-primary/60 ring-1 ring-primary/20 shadow-md",
      )}
    >
      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <p
        className={cn(
          "text-2xl font-semibold tabular-nums mt-1",
          tone === "default" && "text-foreground",
          tone === "destructive" && Number(value) > 0 && "text-destructive",
          tone === "success" &&
            "text-emerald-600 dark:text-emerald-400",
          tone === "warning" &&
            Number(value) > 0 &&
            "text-amber-700 dark:text-amber-400",
          tone === "muted" && "text-muted-foreground",
        )}
      >
        {value}
      </p>
    </Comp>
  );
}

export function KpiRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
      {children}
    </div>
  );
}
