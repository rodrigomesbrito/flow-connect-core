import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderTab } from "@/components/projects/PlaceholderTab";

export const Route = createFileRoute("/_app/projects/$projectId/meetings")({
  component: () => <PlaceholderTab title="Meetings" description="Schedule, agendas, notes, and recordings." />,
});
