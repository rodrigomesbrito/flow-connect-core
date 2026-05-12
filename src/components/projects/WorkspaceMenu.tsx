import { Link, useRouterState } from "@tanstack/react-router";
import {
  ChevronsUpDown,
  Settings as SettingsIcon,
  Users,
  Check,
  Plus,
  FolderKanban,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { projects, type Project } from "@/lib/mock/projects";

export function WorkspaceMenu({
  current,
  collapsed,
}: {
  current: Project;
  collapsed: boolean;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const match = pathname.match(/^\/projects\/[^/]+(\/.*)?$/);
  const subPath = match?.[1] ?? "";

  const initials = current.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="w-full flex items-center gap-2 rounded-md p-2 hover:bg-sidebar-accent transition-colors text-left group"
          aria-label="Open workspace menu"
        >
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
                  Workspace
                </div>
              </div>
              <ChevronsUpDown className="size-3.5 text-sidebar-foreground/60 shrink-0" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-72">
        {/* Header */}
        <div className="flex items-center gap-3 p-2">
          <span
            className="size-10 rounded-md grid place-items-center text-white shrink-0"
            style={{ backgroundColor: current.color }}
          >
            <FolderKanban className="size-5" />
          </span>
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">{current.name}</div>
            <div className="text-xs text-muted-foreground truncate">
              {current.phase} Phase
            </div>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Workspace actions */}
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link to={`/projects/${current.id}/settings` as string}>
            <SettingsIcon className="size-4 mr-2" />
            <span>Workspace Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link to={`/projects/${current.id}/directory` as string}>
            <Users className="size-4 mr-2" />
            <span>People & Permissions</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
          Switch Workspace
        </DropdownMenuLabel>

        {projects.map((p) => {
          const pInitials = p.name
            .split(" ")
            .map((w) => w[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
          return (
            <DropdownMenuItem key={p.id} asChild className="cursor-pointer">
              <Link to={`/projects/${p.id}${subPath}` as string}>
                <span
                  className="size-5 rounded-md grid place-items-center text-white text-[10px] font-semibold shrink-0 mr-2"
                  style={{ backgroundColor: p.color }}
                >
                  {pInitials}
                </span>
                <span className="flex-1 truncate">{p.name}</span>
                {p.id === current.id && <Check className="size-3.5 ml-2" />}
              </Link>
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link to="/projects">
            <Plus className="size-4 mr-2" />
            <span>All Workspaces</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
