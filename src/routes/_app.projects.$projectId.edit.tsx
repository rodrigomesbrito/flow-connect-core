import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { projects } from "@/lib/mock/projects";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/projects/$projectId/edit")({
  head: () => ({
    meta: [{ title: "Edit Project — Relay" }],
  }),
  loader: ({ params }) => {
    const project = projects.find((p) => p.id === params.projectId);
    if (!project) throw new Error("Project not found");
    return { project };
  },
  component: EditProjectPage,
});

function EditProjectPage() {
  const { project } = Route.useLoaderData();
  const navigate = useNavigate();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Visual only, navigate back to project details
    navigate({ to: "/projects/$projectId", params: { projectId: project.id } });
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-auto">
      <form onSubmit={handleSave} className="flex flex-col min-h-full">
        {/* Header */}
        <header className="sticky top-0 z-10 flex-none px-8 py-5 border-b border-border/40 bg-background/95 backdrop-blur-sm">
          <div className="flex items-center justify-between max-w-4xl mx-auto w-full">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="h-8 px-2 -ml-2 text-muted-foreground hover:text-foreground"
              >
                <Link to="/projects/$projectId" params={{ projectId: project.id }}>
                  <ArrowLeft className="size-4 mr-1.5" />
                  Back to Project
                </Link>
              </Button>
              <h1 className="text-[18px] font-semibold tracking-tight text-foreground">
                Edit {project.name}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="h-9 px-4 text-[13px] font-medium"
              >
                <Link to="/projects/$projectId" params={{ projectId: project.id }}>Cancel</Link>
              </Button>
              <Button
                type="submit"
                size="sm"
                className="h-9 px-4 text-[13px] font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md"
              >
                <Save className="size-3.5 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </header>

        {/* Form Body */}
        <div className="flex-1 p-8 pb-20">
          <div className="max-w-2xl mx-auto flex flex-col gap-10">
            
            {/* Section: General */}
            <section className="flex flex-col gap-5">
              <div>
                <h2 className="text-[15px] font-semibold text-foreground">General Information</h2>
                <p className="text-[13px] text-muted-foreground mt-1">
                  The basic details of your project.
                </p>
              </div>
              <div className="flex flex-col gap-4 p-5 border border-border/50 rounded-[12px] bg-card">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-foreground">Project Name</label>
                  <Input 
                    defaultValue={project.name}
                    placeholder="e.g. Midtown Greenway Expansion" 
                    className="h-9 text-[13px] bg-background border-border shadow-none focus-visible:ring-1 focus-visible:ring-primary/40"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-foreground">Description</label>
                  <Textarea 
                    defaultValue={project.description}
                    placeholder="Describe the project scope..." 
                    className="min-h-[100px] text-[13px] bg-background border-border shadow-none focus-visible:ring-1 focus-visible:ring-primary/40 resize-none"
                  />
                </div>
                <div className="space-y-1.5 pt-2 border-t border-border/40 mt-2">
                  <label className="text-[13px] font-medium text-foreground">Theme Color</label>
                  <div className="flex items-center gap-2 pt-1">
                    {["#0F89E4", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444", "#6B7280"].map((color, i) => {
                      // Just mock the active color if it matches the first one or if it matches the project color
                      const isActive = color === project.color || (i === 0 && !["#0F89E4", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444", "#6B7280"].includes(project.color));
                      return (
                        <button
                          key={color}
                          type="button"
                          className={cn(
                            "size-6 rounded-full border border-black/10 transition-transform hover:scale-110",
                            isActive ? "ring-2 ring-offset-2 ring-primary ring-offset-background" : ""
                          )}
                          style={{ backgroundColor: color }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            {/* Section: Status */}
            <section className="flex flex-col gap-5">
              <div>
                <h2 className="text-[15px] font-semibold text-foreground">Status & Health</h2>
                <p className="text-[13px] text-muted-foreground mt-1">
                  Current operational state and phase of the project.
                </p>
              </div>
              <div className="flex flex-col gap-4 p-5 border border-border/50 rounded-[12px] bg-card">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-foreground">Status</label>
                    <select 
                      defaultValue={project.status}
                      className="flex h-9 w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-[13px] ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option>Active</option>
                      <option>Planning</option>
                      <option>On Hold</option>
                      <option>Completed</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-foreground">Health</label>
                    <select 
                      defaultValue={project.health}
                      className="flex h-9 w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-[13px] ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option>On track</option>
                      <option>At risk</option>
                      <option>Off track</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-foreground">Current Phase</label>
                  <Input 
                    defaultValue={project.phase}
                    placeholder="e.g. Design, Procurement, Construction..." 
                    className="h-9 text-[13px] bg-background border-border shadow-none focus-visible:ring-1 focus-visible:ring-primary/40"
                  />
                </div>
              </div>
            </section>

            {/* Section: Financials & Owner */}
            <section className="flex flex-col gap-5">
              <div>
                <h2 className="text-[15px] font-semibold text-foreground">Ownership & Financials</h2>
                <p className="text-[13px] text-muted-foreground mt-1">
                  Key stakeholders and contract values.
                </p>
              </div>
              <div className="flex flex-col gap-4 p-5 border border-border/50 rounded-[12px] bg-card">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-foreground">Project Owner</label>
                    <Input 
                      defaultValue={project.owner.name}
                      placeholder="Name" 
                      className="h-9 text-[13px] bg-background border-border shadow-none focus-visible:ring-1 focus-visible:ring-primary/40"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-foreground">Organization</label>
                    <Input 
                      defaultValue={project.ownerOrg}
                      placeholder="e.g. City of Charlotte" 
                      className="h-9 text-[13px] bg-background border-border shadow-none focus-visible:ring-1 focus-visible:ring-primary/40"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-foreground">Total Contract Value ($)</label>
                  <Input 
                    type="number"
                    defaultValue={project.financial?.totalProjectContract ?? ""}
                    placeholder="0.00" 
                    className="h-9 text-[13px] bg-background border-border shadow-none focus-visible:ring-1 focus-visible:ring-primary/40 font-mono"
                  />
                </div>
              </div>
            </section>

          </div>
        </div>
      </form>
    </div>
  );
}
