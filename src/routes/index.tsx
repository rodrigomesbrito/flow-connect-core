import { createFileRoute, redirect } from "@tanstack/react-router";
import { getSession } from "@/lib/auth";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    if (getSession()) {
      throw redirect({ to: "/projects" });
    }
    throw redirect({ to: "/login" });
  },
  component: () => null,
});
