import { Link, useRouterState } from "@tanstack/react-router";
import {
  FolderKanban,
  Users,
  Building2,
  Sparkles,
  Plus,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { projects } from "@/lib/mock/projects";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const currentPath = useRouterState({
    select: (router) => router.location.pathname,
  });
  const isActive = (path: string) =>
    currentPath === path || currentPath.startsWith(path + "/");

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="px-3 pt-3 pb-2">
        <div className="flex items-center justify-between gap-2">
          {!collapsed && (
            <Link
              to="/projects"
              className="flex items-center gap-2 min-w-0 hover:opacity-80 transition-opacity"
            >
              <div className="size-7 rounded-md bg-primary text-primary-foreground grid place-items-center shrink-0">
                <Sparkles className="size-4" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">Relay</div>
              </div>
            </Link>
          )}
          {collapsed && (
            <Link
              to="/projects"
              className="size-7 rounded-md bg-primary text-primary-foreground grid place-items-center shrink-0 hover:opacity-80 transition-opacity"
            >
              <Sparkles className="size-4" />
            </Link>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-1">
        {/* Workspace navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/projects") && !currentPath.includes("/projects/")}
                  tooltip="Projects"
                >
                  <Link to="/projects">
                    <FolderKanban className="size-4" />
                    <span>Projects</span>
                    {!collapsed && (
                      <span className="ml-auto text-[10px] font-medium text-sidebar-foreground/50 tabular-nums">
                        {projects.length}
                      </span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/people")}
                  tooltip="People"
                >
                  <Link to="/people">
                    <Users className="size-4" />
                    <span>People</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/organizations")}
                  tooltip="Organizations"
                >
                  <Link to="/organizations">
                    <Building2 className="size-4" />
                    <span>Organizations</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Projects quick access */}
        <SidebarGroup>
          <SidebarGroupLabel>Recent projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects
                .filter((p) => p.status !== "Completed")
                .slice(0, 6)
                .map((project) => {
                  const url = `/projects/${project.id}`;
                  return (
                    <SidebarMenuItem key={project.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(url)}
                        tooltip={project.name}
                      >
                        <Link
                          to="/projects/$projectId"
                          params={{ projectId: project.id }}
                        >
                          <span
                            className="size-5 rounded-md grid place-items-center text-[10px] font-bold text-white shrink-0"
                            style={{ backgroundColor: project.color }}
                          >
                            <FolderKanban className="size-3" />
                          </span>
                          <span className="truncate">{project.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="All projects">
                  <Link to="/projects">
                    <Plus className="size-4 text-sidebar-foreground/50" />
                    <span className="text-sidebar-foreground/50">All projects</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
