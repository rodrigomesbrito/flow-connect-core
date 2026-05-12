import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderTab } from "@/components/projects/PlaceholderTab";

export const Route = createFileRoute("/_app/projects/$projectId/directory")({
  component: () => <PlaceholderTab title="Directory" description="People, organizations, and contacts involved in this project." />,
});
