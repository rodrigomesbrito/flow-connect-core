import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  CalendarClock,
  CheckSquare,
  Gavel,
  AlertTriangle,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { WorkspaceMenu } from "./WorkspaceMenu";
import type { Project } from "@/lib/mock/projects";
import { useActionItemStats } from "@/lib/action-items/store";
import { useIssueStats } from "@/lib/issues/store";
import { cn } from "@/lib/utils";

export function ProjectSidebar({ project }: { project: Project }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Live badge counts from stores
  const actionStats = useActionItemStats(project.id);
  const issueStats = useIssueStats(project.id);

  const base = `/projects/${project.id}`;
  const items = [
    { title: "Dashboard", url: base, icon: LayoutDashboard, exact: true },
    { title: "Meetings", url: `${base}/meetings`, icon: CalendarClock },
    {
      title: "Action Items",
      url: `${base}/action-items`,
      icon: CheckSquare,
      badge: actionStats.open + actionStats.inProgress,
    },
    { title: "Decisions", url: `${base}/decisions`, icon: Gavel },
    {
      title: "Issues",
      url: `${base}/issues`,
      icon: AlertTriangle,
      badge: issueStats.open + issueStats.inReview,
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
                    <item.icon
                      className={cn(
                        "size-[15px] shrink-0 transition-colors mr-0.5",
                        active
                          ? "text-white"
                          : "text-white/40 group-hover/menu-button:text-white/80",
                      )}
                      strokeWidth={2}
                    />
                    <span className="truncate">{item.title}</span>
                    {item.badge && item.badge > 0 && !collapsed && (
                      <span
                        className={cn(
                          "ml-auto inline-flex items-center justify-center min-w-[20px] h-[18px] px-1.5 text-[10px] font-bold rounded ring-1 ring-inset",
                          item.badgeVariant === "danger"
                            ? "bg-rose-500/20 text-rose-300 ring-rose-500/30"
                            : "bg-white/10 text-white/80 ring-white/20",
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

      <SidebarFooter className={cn("px-2 pb-3", collapsed && "px-1")}>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Settings"
              className={cn(
                "h-8 rounded-md px-2 py-1.5 text-[13px] font-medium transition-colors",
                isActive(`${base}/settings`)
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white",
              )}
            >
              <Link to={`${base}/settings` as string}>
                <Settings
                  className={cn(
                    "size-[15px] shrink-0 mr-0.5",
                    isActive(`${base}/settings`)
                      ? "text-white"
                      : "text-white/40 group-hover/menu-button:text-white/80",
                  )}
                  strokeWidth={2}
                />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
