import type { ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/**
 * Standard hover-only row menu trigger. Pass DropdownMenuItems / Separators
 * as children.
 */
export function RowMenu({
  children,
  align = "end",
  alwaysVisible = false,
}: {
  children: ReactNode;
  align?: "start" | "end";
  alwaysVisible?: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-7 w-7 text-muted-foreground hover:text-foreground transition-opacity",
            !alwaysVisible &&
              "opacity-0 group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100",
          )}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-44">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
