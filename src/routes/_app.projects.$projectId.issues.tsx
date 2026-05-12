import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderTab } from "@/components/projects/PlaceholderTab";

export const Route = createFileRoute("/_app/projects/$projectId/issues")({
  component: () => <PlaceholderTab title="Issues" description="Open and resolved issues affecting the project." />,
});
