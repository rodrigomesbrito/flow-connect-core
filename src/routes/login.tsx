import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Mango Tech" },
      { name: "description", content: "Sign in to your project workspace." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("joey@mangotech.com");
  const [password, setPassword] = useState("••••••••");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    signIn(email);
    navigate({ to: "/projects" });
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-10">
            <div className="size-9 rounded-lg bg-primary text-primary-foreground grid place-items-center">
              <Sparkles className="size-5" />
            </div>
            <span className="text-lg font-semibold">Mango Tech</span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sign in to continue to your workspace.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">
              Sign in
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Phase 1 demo · session stored locally
            </p>
          </form>
        </div>
      </div>

      <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-primary/15 via-primary/5 to-background border-l border-border p-12">
        <div className="max-w-md text-center">
          <div className="size-14 rounded-2xl bg-primary text-primary-foreground grid place-items-center mx-auto mb-6">
            <Sparkles className="size-7" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">
            One workspace for projects, decisions and execution.
          </h2>
          <p className="text-sm text-muted-foreground mt-3">
            Meetings turn into decisions. Decisions turn into action. Everything stays connected.
          </p>
        </div>
      </div>
    </div>
  );
}
