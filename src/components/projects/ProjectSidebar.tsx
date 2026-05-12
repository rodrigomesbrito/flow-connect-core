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
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { WorkspaceMenu } from "./WorkspaceMenu";
import type { Project } from "@/lib/mock/projects";
import { cn } from "@/lib/utils";

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
      badgeVariant: "danger" as const,
    },
  ];

  const isActive = (url: string, exact?: boolean) =>
    exact ? pathname === url : pathname === url || pathname.startsWith(url + "/");

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="px-3 py-4 border-b border-white/5">
        <WorkspaceMenu current={project} collapsed={collapsed} />
      </SidebarHeader>

      <SidebarContent className={cn("px-2 py-4", collapsed && "px-1")}>
        <SidebarMenu className="gap-1.5">
          {items.map((item) => {
            const active = isActive(item.url, item.exact);
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  className={cn(
                    "relative h-auto rounded-xl px-3 py-2.5 text-[14px] font-medium transition-all duration-200",
                    active
                      ? "bg-white/10 text-white hover:bg-white/10 hover:text-white"
                      : "text-white/60 hover:bg-white/5 hover:text-white",
                  )}
                >
                  <Link to={item.url as string}>
                    {active && !collapsed && (
                      <span
                        aria-hidden
                        className="absolute left-0 top-1/4 bottom-1/4 w-1 rounded-full bg-[oklch(0.75_0.16_240)]"
                      />
                    )}
                    <item.icon
                      className={cn(
                        "size-[18px] shrink-0 transition-colors",
                        active
                          ? "text-[oklch(0.78_0.15_240)]"
                          : "text-white/50 group-hover/menu-button:text-[oklch(0.78_0.15_240)]",
                      )}
                    />
                    <span className="truncate">{item.title}</span>
                    {item.badge && item.badge > 0 && !collapsed && (
                      <span
                        className={cn(
                          "ml-auto inline-flex items-center justify-center min-w-[22px] h-[20px] px-2 text-[11px] font-bold rounded-full ring-1",
                          item.badgeVariant === "danger"
                            ? "bg-rose-500/15 text-rose-300 ring-rose-400/30"
                            : "bg-white/10 text-[oklch(0.82_0.13_240)] ring-white/20",
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
