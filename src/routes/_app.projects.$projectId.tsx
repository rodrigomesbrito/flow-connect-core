import { createFileRoute, Outlet, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getProject } from "@/lib/mock/projects";

export const Route = createFileRoute("/_app/projects/$projectId")({
  head: ({ params }) => {
    const project = getProject(params.projectId);
    const title = project ? `${project.name} — Relay` : "Project — Relay";
    return {
      meta: [
        { title },
        { name: "description", content: project?.description ?? "Project workspace" },
      ],
    };
  },
  loader: ({ params }) => {
    const project = getProject(params.projectId);
    if (!project) throw notFound();
    return { project };
  },
  notFoundComponent: () => (
    <div className="px-6 py-10 max-w-3xl mx-auto text-center">
      <h1 className="text-xl font-semibold">Project not found</h1>
      <p className="text-sm text-muted-foreground mt-1">
        This project doesn't exist or was removed.
      </p>
      <Link
        to="/projects"
        className="inline-flex items-center gap-2 mt-4 text-sm text-primary hover:underline"
      >
        <ArrowLeft className="size-4" /> Back to projects
      </Link>
    </div>
  ),
  errorComponent: ({ error, reset }) => (
    <div className="px-6 py-10 max-w-3xl mx-auto text-center">
      <h1 className="text-xl font-semibold">Couldn't load project</h1>
      <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
      <Button onClick={reset} className="mt-4">Try again</Button>
    </div>
  ),
  component: () => <Outlet />,
});
