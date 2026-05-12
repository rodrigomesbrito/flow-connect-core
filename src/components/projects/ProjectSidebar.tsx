import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  CalendarClock,
  CheckSquare,
  Gavel,
  AlertTriangle,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { WorkspaceMenu } from "./WorkspaceMenu";
import type { Project } from "@/lib/mock/projects";

export function ProjectSidebar({ project }: { project: Project }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const base = `/projects/${project.id}`;
  const items = [
    { title: "Dashboard", url: base, icon: LayoutDashboard, exact: true },
    { title: "Meetings", url: `${base}/meetings`, icon: CalendarClock },
    {
      title: "Action Items",
      url: `${base}/action-items`,
      icon: CheckSquare,
      badge: project.pendingTasks,
    },
    { title: "Decisions", url: `${base}/decisions`, icon: Gavel },
    {
      title: "Issues",
      url: `${base}/issues`,
      icon: AlertTriangle,
      badge: project.openIssues,
    },
  ];

  const isActive = (url: string, exact?: boolean) =>
    exact ? pathname === url : pathname === url || pathname.startsWith(url + "/");

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-2">
        <WorkspaceMenu current={project} collapsed={collapsed} />
      </SidebarHeader>

      <SidebarContent className="gap-1">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url, item.exact)}
                    tooltip={item.title}
                  >
                    <Link to={item.url as string}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                      {item.badge && item.badge > 0 && !collapsed && (
                        <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-sidebar-accent text-sidebar-accent-foreground">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
