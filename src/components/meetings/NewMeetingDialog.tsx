import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { CalendarIcon, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { createMeeting } from "@/lib/meetings/store";
import type { Project } from "@/lib/mock/projects";

export function NewMeetingDialog({
  project,
  open,
  onOpenChange,
}: {
  project: Project;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [attendees, setAttendees] = useState<string[]>(
    project.participants.slice(0, 3).map((p) => p.name),
  );

  const toggleAttendee = (name: string) =>
    setAttendees((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );

  const handleStart = () => {
    const meeting = createMeeting({
      projectId: project.id,
      title,
      date: date.toISOString(),
      attendees,
    });
    onOpenChange(false);
    setTitle("");
    setDate(new Date());
    navigate({
      to: "/projects/$projectId/meetings/$meetingId",
      params: { projectId: project.id, meetingId: meeting.id },
    });
  };

  const allPeople = [project.owner, ...project.participants].filter(
    (p, i, arr) => arr.findIndex((x) => x.name === p.name) === i,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New meeting</DialogTitle>
          <DialogDescription>
            Start a live meeting and capture decisions, issues and actions as you go.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="meeting-title">Title</Label>
            <Input
              id="meeting-title"
              placeholder="e.g. Pre-construction kickoff"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal")}
                >
                  <CalendarIcon className="size-4 mr-2" />
                  {format(date, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1.5">
            <Label>Attendees</Label>
            <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-auto rounded-md border border-border p-2">
              {allPeople.map((p) => {
                const checked = attendees.includes(p.name);
                return (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => toggleAttendee(p.name)}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors text-left",
                      checked ? "bg-primary/10" : "hover:bg-muted",
                    )}
                  >
                    <Avatar className="size-6">
                      <AvatarFallback className="text-[10px] font-semibold bg-muted">
                        {p.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate flex-1">{p.name}</span>
                    {checked && <Check className="size-3.5 text-primary" />}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {attendees.length} selected
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleStart} disabled={!title.trim()}>
            Start meeting
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
