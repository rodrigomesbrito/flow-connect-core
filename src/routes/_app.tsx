import { Outlet, createFileRoute, redirect, useRouterState } from "@tanstack/react-router";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AppTopbar } from "@/components/app-topbar";
import { getSession } from "@/lib/auth";

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
  // Projects hub has no sidebar — sidebar is project-contextual
  const showSidebar = pathname !== "/projects";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {showSidebar && <AppSidebar />}
        <div className="flex-1 flex flex-col min-w-0">
          <AppTopbar showSidebarTrigger={showSidebar} />
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
