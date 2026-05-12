import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Person } from "@/lib/mock/projects";

export function AvatarStack({
  people,
  max = 3,
  size = "size-6",
}: {
  people: Person[];
  max?: number;
  size?: string;
}) {
  const shown = people.slice(0, max);
  const extra = people.length - shown.length;
  return (
    <div className="flex items-center -space-x-1.5">
      {shown.map((p, i) => (
        <Avatar
          key={`${p.initials}-${i}`}
          className={`${size} ring-2 ring-card`}
        >
          <AvatarFallback className="text-[10px] bg-muted">
            {p.initials}
          </AvatarFallback>
        </Avatar>
      ))}
      {extra > 0 && (
        <span
          className={`${size} ring-2 ring-card rounded-full bg-muted text-[10px] font-medium grid place-items-center text-muted-foreground`}
        >
          +{extra}
        </span>
      )}
    </div>
  );
}
