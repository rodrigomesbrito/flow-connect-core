import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderTab } from "@/components/projects/PlaceholderTab";

export const Route = createFileRoute("/_app/projects/$projectId/decisions")({
  component: () => <PlaceholderTab title="Decisions" description="Log of key decisions, rationale, and approvers." />,
});
