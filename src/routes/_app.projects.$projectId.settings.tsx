import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderTab } from "@/components/projects/PlaceholderTab";

export const Route = createFileRoute("/_app/projects/$projectId/settings")({
  component: () => <PlaceholderTab title="Settings" description="Project configuration, members, and integrations." />,
});
