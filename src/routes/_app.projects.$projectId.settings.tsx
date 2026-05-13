import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Trash2,
  Save,
  Check,
  AlertTriangle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getProject } from "@/lib/mock/projects";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/projects/$projectId/settings")({
  loader: ({ params }) => {
    const project = getProject(params.projectId);
    if (!project) throw notFound();
    return { project };
  },
  head: ({ params }) => {
    const project = getProject(params.projectId);
    return {
      meta: [
        { title: `Settings — ${project?.name ?? "Project"}` },
        { name: "description", content: "Configure project preferences, integrations and access." },
      ],
    };
  },
  component: SettingsPage,
});

const sections = [
  { id: "general", label: "General", icon: SettingsIcon },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "permissions", label: "Permissions", icon: Shield },
  { id: "danger", label: "Danger zone", icon: AlertTriangle },
] as const;

const colorOptions = [
  "oklch(0.62 0.18 250)",
  "oklch(0.65 0.18 152)",
  "oklch(0.78 0.16 75)",
  "oklch(0.62 0.22 300)",
  "oklch(0.6 0.23 25)",
  "oklch(0.7 0.13 200)",
  "oklch(0.55 0.18 275)",
  "oklch(0.65 0.2 15)",
];

function SettingsPage() {
  const { project } = Route.useLoaderData();
  const [active, setActive] = useState<(typeof sections)[number]["id"]>("general");

  // General form
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [color, setColor] = useState(project.color);
  const [phase, setPhase] = useState<string>(project.phase);
  const [status, setStatus] = useState<string>(project.status);

  // Notifications
  const [notif, setNotif] = useState({
    actionItems: true,
    decisions: true,
    issues: true,
    meetings: false,
    weeklyDigest: true,
  });

  // Integrations
  const [integrations, setIntegrations] = useState({
    slack: true,
    email: true,
    calendar: false,
    drive: true,
    github: false,
  });

  // Permissions
  const [defaultRole, setDefaultRole] = useState("Member");
  const [requireApproval, setRequireApproval] = useState(true);
  const [externalGuests, setExternalGuests] = useState(false);

  const handleSave = () => toast.success("Settings saved");

  return (
    <div className="px-6 py-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure preferences, integrations and access for {project.name}.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
        {/* Side nav */}
        <aside className="lg:sticky lg:top-4 self-start">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto">
            {sections.map((s) => {
              const Icon = s.icon;
              const isActive = active === s.id;
              const isDanger = s.id === "danger";
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap text-left ${
                    isActive
                      ? isDanger
                        ? "bg-destructive/10 text-destructive"
                        : "bg-muted text-foreground"
                      : isDanger
                        ? "text-destructive/80 hover:bg-destructive/10"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="size-4" />
                  {s.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Panel */}
        <div className="min-w-0 space-y-6">
          {active === "general" && (
            <Card title="Project details" description="Basic information visible across the workspace.">
              <Field label="Project name">
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </Field>
              <Field label="Description" hint="A short summary shown on the project hub.">
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </Field>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Phase">
                  <Select value={phase} onValueChange={setPhase}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Planning", "Discovery", "Design", "Procurement", "Construction", "Execution", "Closeout", "Initiation"].map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Status">
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Active", "Planning", "On Hold", "Completed"].map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <Field label="Identity color" hint="Used for the workspace badge and avatars.">
                <div className="flex items-center gap-2 flex-wrap">
                  {colorOptions.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`size-8 rounded-lg grid place-items-center transition-transform ${
                        color === c ? "ring-2 ring-offset-2 ring-ring scale-105" : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: c }}
                      aria-label="Select color"
                    >
                      {color === c && <Check className="size-4 text-white" />}
                    </button>
                  ))}
                </div>
              </Field>

              <CardFooter onSave={handleSave} />
            </Card>
          )}

          {active === "notifications" && (
            <Card title="Notifications" description="Choose what triggers alerts for this project.">
              <Toggle
                label="Action items"
                description="When tasks are assigned to you or come due."
                checked={notif.actionItems}
                onChange={(v) => setNotif({ ...notif, actionItems: v })}
              />
              <Toggle
                label="Decisions"
                description="New decisions logged in the project."
                checked={notif.decisions}
                onChange={(v) => setNotif({ ...notif, decisions: v })}
              />
              <Toggle
                label="Issues"
                description="When issues are raised, updated or resolved."
                checked={notif.issues}
                onChange={(v) => setNotif({ ...notif, issues: v })}
              />
              <Toggle
                label="Meeting reminders"
                description="Reminders 30 minutes before meetings start."
                checked={notif.meetings}
                onChange={(v) => setNotif({ ...notif, meetings: v })}
              />
              <Toggle
                label="Weekly digest"
                description="A Monday summary of what changed last week."
                checked={notif.weeklyDigest}
                onChange={(v) => setNotif({ ...notif, weeklyDigest: v })}
              />
              <CardFooter onSave={handleSave} />
            </Card>
          )}

          {active === "integrations" && (
            <Card title="Integrations" description="Connect external tools to sync data automatically.">
              <Integration
                icon={Slack}
                name="Slack"
                description="Post project updates to a channel."
                connected={integrations.slack}
                onToggle={(v) => setIntegrations({ ...integrations, slack: v })}
              />
              <Integration
                icon={Mail}
                name="Email digest"
                description="Daily summary delivered to your inbox."
                connected={integrations.email}
                onToggle={(v) => setIntegrations({ ...integrations, email: v })}
              />
              <Integration
                icon={Calendar}
                name="Google Calendar"
                description="Sync meetings to your calendar."
                connected={integrations.calendar}
                onToggle={(v) => setIntegrations({ ...integrations, calendar: v })}
              />
              <Integration
                icon={FileText}
                name="Google Drive"
                description="Attach documents from Drive."
                connected={integrations.drive}
                onToggle={(v) => setIntegrations({ ...integrations, drive: v })}
              />
              <Integration
                icon={Github}
                name="GitHub"
                description="Link issues to commits and PRs."
                connected={integrations.github}
                onToggle={(v) => setIntegrations({ ...integrations, github: v })}
              />
            </Card>
          )}

          {active === "permissions" && (
            <Card title="Access & permissions" description="Control who can join and what they can do.">
              <Field label="Default role for new members">
                <Select value={defaultRole} onValueChange={setDefaultRole}>
                  <SelectTrigger className="sm:w-64"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Admin", "Member", "Viewer"].map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Toggle
                label="Require approval to join"
                description="New members must be approved by an admin."
                checked={requireApproval}
                onChange={setRequireApproval}
              />
              <Toggle
                label="Allow external guests"
                description="Invite people outside your workspace as guests."
                checked={externalGuests}
                onChange={setExternalGuests}
              />
              <div className="pt-2">
                <Button variant="outline" asChild>
                  <Link to="/people">
                    Manage people in workspace
                  </Link>
                </Button>
              </div>
              <CardFooter onSave={handleSave} />
            </Card>
          )}

          {active === "danger" && (
            <Card
              title="Danger zone"
              description="Irreversible actions. Proceed with caution."
              tone="danger"
            >
              <DangerRow
                title="Archive project"
                description="Hide this project from active lists. You can restore it later."
                actionLabel="Archive"
                onAction={() => toast.message("Project archived")}
              />
              <DangerRow
                title="Transfer ownership"
                description="Move this project to another workspace member."
                actionLabel="Transfer"
                onAction={() => toast.message("Transfer flow opened")}
              />
              <DangerRow
                title="Delete project"
                description="Permanently delete this project, its data and history."
                actionLabel="Delete project"
                destructive
                icon={Trash2}
                onAction={() => toast.error("This would permanently delete the project")}
              />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- pieces ---------- */

function Card({
  title,
  description,
  children,
  tone = "default",
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  tone?: "default" | "danger";
}) {
  return (
    <section
      className={`rounded-xl border bg-card overflow-hidden ${
        tone === "danger" ? "border-destructive/30" : "border-border"
      }`}
    >
      <header className="px-5 py-4 border-b border-border">
        <h2 className={`text-base font-semibold ${tone === "danger" ? "text-destructive" : ""}`}>{title}</h2>
        {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
      </header>
      <div className="p-5 space-y-5">{children}</div>
    </section>
  );
}

function CardFooter({ onSave }: { onSave: () => void }) {
  return (
    <div className="flex justify-end pt-2 border-t border-border -mx-5 px-5 -mb-5 pb-4 mt-2">
      <Button onClick={onSave} className="gap-2">
        <Save className="size-4" />
        Save changes
      </Button>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-1">
      <div className="min-w-0">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function Integration({
  icon: Icon,
  name,
  description,
  connected,
  onToggle,
}: {
  icon: typeof Slack;
  name: string;
  description: string;
  connected: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
      <span className="size-10 rounded-lg bg-muted grid place-items-center shrink-0">
        <Icon className="size-5 text-foreground/70" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{name}</span>
          {connected && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 gap-1">
              <span className="size-1.5 rounded-full bg-success" />
              Connected
            </Badge>
          )}
        </div>
        <div className="text-xs text-muted-foreground truncate">{description}</div>
      </div>
      <Button
        variant={connected ? "outline" : "default"}
        size="sm"
        onClick={() => onToggle(!connected)}
      >
        {connected ? "Disconnect" : "Connect"}
      </Button>
    </div>
  );
}

function DangerRow({
  title,
  description,
  actionLabel,
  onAction,
  destructive,
  icon: Icon,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  destructive?: boolean;
  icon?: typeof Trash2;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="min-w-0">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
      </div>
      <Button
        variant={destructive ? "destructive" : "outline"}
        size="sm"
        onClick={onAction}
        className="gap-2 shrink-0"
      >
        {Icon && <Icon className="size-4" />}
        {actionLabel}
      </Button>
    </div>
  );
}
