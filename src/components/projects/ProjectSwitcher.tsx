import { Link, useRouterState } from "@tanstack/react-router";
import { Check, ChevronsUpDown, FolderKanban } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { projects, type Project } from "@/lib/mock/projects";

export function ProjectSwitcher({
  current,
  collapsed,
}: {
  current: Project;
  collapsed: boolean;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Compute the sub-route after /projects/{id} to preserve tab on switch.
  const match = pathname.match(/^\/projects\/[^/]+(\/.*)?$/);
  const subPath = match?.[1] ?? "";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="w-full flex items-center gap-2 rounded-md p-2 hover:bg-sidebar-accent transition-colors text-left group">
          <span
            className="size-8 rounded-md grid place-items-center text-white shrink-0"
            style={{ backgroundColor: current.color }}
          >
            <FolderKanban className="size-4" />
          </span>
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold truncate text-sidebar-foreground">
                  {current.name}
                </div>
                <div className="text-[11px] text-sidebar-foreground/60 truncate">
                  {current.phase} Phase
                </div>
              </div>
              <ChevronsUpDown className="size-3.5 text-sidebar-foreground/60 shrink-0" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Switch project
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {projects.map((p) => (
          <DropdownMenuItem key={p.id} asChild className="cursor-pointer">
            <Link to={`/projects/${p.id}${subPath}` as string}>
              <span
                className="size-5 rounded-md grid place-items-center text-white shrink-0 mr-2"
                style={{ backgroundColor: p.color }}
              >
                <FolderKanban className="size-3" />
              </span>
              <span className="flex-1 truncate">{p.name}</span>
              {p.id === current.id && <Check className="size-3.5 ml-2" />}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
