import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  CalendarClock,
  CheckSquare,
  Gavel,
  AlertTriangle,
  Settings,
  ArrowLeft,
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
import { ProjectSwitcher } from "./ProjectSwitcher";
import type { Project } from "@/lib/mock/projects";

export function ProjectSidebar({ project }: { project: Project }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const base = `/projects/${project.id}`;
  const items = [
    { title: "Dashboard", url: base, icon: LayoutDashboard, exact: true },
    { title: "Directory", url: `${base}/directory`, icon: Users },
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
    { title: "Settings", url: `${base}/settings`, icon: Settings },
  ];

  const isActive = (url: string, exact?: boolean) =>
    exact ? pathname === url : pathname === url || pathname.startsWith(url + "/");

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-2">
        <ProjectSwitcher current={project} collapsed={collapsed} />
      </SidebarHeader>

      <SidebarContent className="gap-1">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="All projects" className="text-sidebar-foreground/70">
                  <Link to="/projects">
                    <ArrowLeft className="size-4" />
                    <span>All projects</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50">
            Project
          </SidebarGroupLabel>
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
