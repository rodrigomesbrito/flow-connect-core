import { Link, useRouterState } from "@tanstack/react-router";
import {
  Inbox,
  Reply,
  MessageSquare,
  CheckSquare,
  MoreHorizontal,
  Hash,
  Plus,
  ChevronDown,
  Sparkles,
  FolderKanban,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const homeItems = [
  { title: "Inbox", url: "/inbox", icon: Inbox, badge: 4 },
  { title: "Replies", url: "/replies", icon: Reply },
  { title: "Assigned Comments", url: "/assigned", icon: MessageSquare },
  { title: "My Tasks", url: "/my-tasks", icon: CheckSquare },
  { title: "More", url: "/more", icon: MoreHorizontal },
];

const spaces = [
  { id: "bryant-farms", title: "Bryant Farms Rd", color: "oklch(0.62 0.18 250)" },
  { id: "northlake-bridge", title: "Northlake Bridge", color: "oklch(0.62 0.22 300)" },
  { id: "stormwater-iv", title: "Stormwater IV", color: "oklch(0.7 0.13 200)" },
  { id: "airport-taxiway", title: "Airport Taxiway", color: "oklch(0.78 0.16 75)" },
];

const channels = [
  { title: "General", url: "/channels/general", subtitle: "Mango Tech" },
  { title: "Welcome", url: "/channels/welcome" },
  { title: "Product", url: "/channels/product" },
];

const dms = [
  { name: "Joey Cox", initials: "JC", unread: 2 },
  { name: "Zeb Evans", initials: "ZE" },
  { name: "Brendan", initials: "BR" },
  { name: "Olga O.", initials: "OO" },
  { name: "Ricardo", initials: "RI" },
];

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
            <div className="flex items-center gap-2 min-w-0">
              <div className="size-7 rounded-md bg-primary text-primary-foreground grid place-items-center shrink-0">
                <Sparkles className="size-4" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">Home</div>
              </div>
            </div>
          )}
          <button className="size-7 rounded-md hover:bg-sidebar-accent grid place-items-center text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
            <Plus className="size-4" />
          </button>
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-1">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {homeItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url as string}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                      {item.badge && !collapsed && (
                        <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground">
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

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between">
            <span>Spaces</span>
            <ChevronDown className="size-3 opacity-60" />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {spaces.map((space) => {
                const url = `/projects/${space.id}`;
                return (
                  <SidebarMenuItem key={space.id}>
                    <SidebarMenuButton asChild isActive={isActive(url)} tooltip={space.title}>
                      <Link to="/projects/$projectId" params={{ projectId: space.id }}>
                        <span
                          className="size-5 rounded-md grid place-items-center text-[10px] font-bold text-white shrink-0"
                          style={{ backgroundColor: space.color }}
                        >
                          <FolderKanban className="size-3" />
                        </span>
                        <span>{space.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between">
            <span>Channels</span>
            <ChevronDown className="size-3 opacity-60" />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {channels.map((c) => (
                <SidebarMenuItem key={c.title}>
                  <SidebarMenuButton tooltip={c.title}>
                    <Hash className="size-4" />
                    <span className="truncate">
                      {c.title}
                      {c.subtitle && (
                        <span className="text-muted-foreground"> – {c.subtitle}</span>
                      )}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton className="text-muted-foreground">
                  <Plus className="size-4" />
                  <span>Add chat</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between">
            <span>Direct Messages</span>
            <ChevronDown className="size-3 opacity-60" />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {dms.map((dm) => (
                <SidebarMenuItem key={dm.name}>
                  <SidebarMenuButton tooltip={dm.name}>
                    <Avatar className="size-5">
                      <AvatarFallback className="text-[9px] bg-muted">
                        {dm.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate">{dm.name}</span>
                    {dm.unread && !collapsed && (
                      <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground">
                        {dm.unread}
                      </span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton className="text-muted-foreground">
                  <Plus className="size-4" />
                  <span>Add people</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
