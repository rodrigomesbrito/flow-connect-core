import { Link, useNavigate } from "@tanstack/react-router";
import { Search, Bell, Sparkles, Edit3, LogOut } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getSession, signOut } from "@/lib/auth";

export function AppTopbar() {
  const navigate = useNavigate();
  const session = typeof window !== "undefined" ? getSession() : null;
  const initials = session?.name
    ? session.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  return (
    <header className="h-12 flex items-center gap-2 px-3 border-b border-border bg-background sticky top-0 z-30">
      <SidebarTrigger className="size-8" />

      <div className="flex items-center gap-2 ml-1">
        <Link
          to="/projects"
          className="text-sm font-semibold flex items-center gap-2 hover:opacity-80"
        >
          <div className="size-6 rounded-md bg-primary text-primary-foreground grid place-items-center">
            <Sparkles className="size-3.5" />
          </div>
          Mango Tech
        </Link>
      </div>

      <div className="flex-1 max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            placeholder="Search"
            className="w-full h-8 pl-9 pr-12 text-sm rounded-md bg-muted border border-transparent hover:border-border focus:bg-background focus:border-ring focus:outline-none transition-colors"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium text-muted-foreground bg-background border border-border rounded px-1.5 py-0.5">
            ⌘K
          </kbd>
        </div>
      </div>

      <button className="size-8 rounded-md hover:bg-muted grid place-items-center text-muted-foreground">
        <Bell className="size-4" />
      </button>
      <button className="size-8 rounded-md hover:bg-muted grid place-items-center text-muted-foreground">
        <Edit3 className="size-4" />
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="size-8 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-border">
            <Avatar className="size-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{session?.name ?? "Guest"}</span>
              <span className="text-xs text-muted-foreground font-normal">
                {session?.email ?? "—"}
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              signOut();
              navigate({ to: "/login" });
            }}
          >
            <LogOut className="size-4 mr-2" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
