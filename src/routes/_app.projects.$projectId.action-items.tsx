import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderTab } from "@/components/projects/PlaceholderTab";

export const Route = createFileRoute("/_app/projects/$projectId/action-items")({
  component: () => <PlaceholderTab title="Action Items" description="Track outstanding tasks and owners across the project." />,
});
