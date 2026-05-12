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
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-8 text-xs text-muted-foreground"
        >
          <X className="mr-1 h-3 w-3" /> Clear
        </Button>
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
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-8 pl-8 text-sm bg-muted/40 border-border focus-visible:bg-background"
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
            "inline-flex items-center gap-1.5 h-8 px-2.5 text-xs font-medium rounded-md border transition-colors",
            "border-border bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50",
            active && "border-primary/40 bg-primary/5 text-foreground",
          )}
        >
          <span className={cn(active ? "text-muted-foreground" : "")}>
            {label}:
          </span>
          <span className="text-foreground">{displayLabel}</span>
          <ChevronDown className="h-3 w-3 opacity-60" />
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
            className="text-sm"
          >
            {opt.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
