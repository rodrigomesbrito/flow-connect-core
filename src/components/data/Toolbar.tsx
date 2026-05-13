import type { ReactNode } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/**
 * Standardized toolbar shell. Compose with <ToolbarSearch />,
 * <ToolbarFilter /> and a trailing actions slot.
 */
export function Toolbar({
  children,
  onClear,
  hasActiveFilters,
  className,
}: {
  children: ReactNode;
  onClear?: () => void;
  hasActiveFilters?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 mb-4",
        className,
      )}
    >
      {children}
      {hasActiveFilters && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1 h-8 px-2.5 text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
        >
          <X className="mr-1 h-3.5 w-3.5" /> Clear
        </button>
      )}
    </div>
  );
}

export function ToolbarSearch({
  value,
  onChange,
  placeholder = "Search...",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative flex-1 min-w-[200px] max-w-xs">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 pl-9 pr-3 text-[13px] bg-background border-border shadow-none focus-visible:ring-1 focus-visible:ring-primary/40 rounded-md transition-colors"
      />
    </div>
  );
}

type Option = { value: string; label: string };

/**
 * Ghost-style filter trigger. Shows label and current selection inline.
 */
export function ToolbarFilter({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Option[];
  onChange: (v: string) => void;
}) {
  const active = value !== "all" && value !== "All";
  const current = options.find((o) => o.value === value);
  const displayLabel = active && current ? current.label : "Any";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1.5 h-9 px-3 text-[13px] font-medium rounded-md border transition-colors",
            !active
              ? "border-border/60 border-dashed bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40 hover:border-border"
              : "border-primary/30 bg-primary/[0.07] text-primary"
          )}
        >
          <span className={cn(active ? "text-primary/70" : "text-muted-foreground")}>
            {label}:
          </span>
          <span className={cn(active ? "text-primary font-semibold" : "text-foreground")}>{displayLabel}</span>
          <ChevronDown className={cn("h-3.5 w-3.5 opacity-50", active && "opacity-70")} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[180px]">
        <DropdownMenuLabel className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {label}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((opt) => (
          <DropdownMenuCheckboxItem
            key={opt.value}
            checked={value === opt.value}
            onCheckedChange={() => onChange(opt.value)}
            className={cn(
              "text-[13px] rounded-[5px]",
              value === opt.value && "font-medium bg-primary/5 text-primary"
            )}
          >
            {opt.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
