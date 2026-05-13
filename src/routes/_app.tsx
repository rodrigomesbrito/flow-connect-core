import { Outlet, createFileRoute, redirect, useRouterState } from "@tanstack/react-router";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ProjectSidebar } from "@/components/projects/ProjectSidebar";
import { AppTopbar } from "@/components/app-topbar";
import { getSession } from "@/lib/auth";
import { getProject } from "@/lib/mock/projects";

export const Route = createFileRoute("/_app")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !getSession()) {
      throw redirect({ to: "/login" });
    }
  },
  component: AppLayout,
});

function AppLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // /projects (hub) → no sidebar
  // /projects/{id}/* → ProjectSidebar
  // anything else under /_app → global AppSidebar
  const projectMatch = pathname.match(/^\/projects\/([^/]+)/);
  const projectId = projectMatch?.[1];
  const project = projectId ? getProject(projectId) : undefined;

  const isWorkspacePage =
    pathname === "/projects" ||
    pathname === "/people" ||
    pathname === "/organizations";

  const sidebar = project
    ? <ProjectSidebar project={project} />
    : isWorkspacePage
      ? <AppSidebar />
      : <AppSidebar />;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {sidebar}
        <div className="flex-1 flex flex-col min-w-0">
          <AppTopbar showSidebarTrigger={sidebar !== null} />
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
