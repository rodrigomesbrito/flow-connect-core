import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export type MentionPerson = {
  name: string;
  inMeeting: boolean;
};

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "?";

export function MentionPopover({
  people,
  activeIndex,
  onSelect,
  onHover,
  style,
}: {
  people: MentionPerson[];
  activeIndex: number;
  onSelect: (name: string) => void;
  onHover: (index: number) => void;
  style: React.CSSProperties;
}) {
  return (
    <div
      style={style}
      className="absolute z-50 w-56 rounded-md border border-border bg-popover text-popover-foreground shadow-md py-1"
      onMouseDown={(e) => e.preventDefault()}
    >
      {people.length === 0 ? (
        <div className="px-3 py-2 text-xs text-muted-foreground italic">
          No matching people
        </div>
      ) : (
        people.map((p, i) => (
          <button
            key={p.name}
            type="button"
            onMouseEnter={() => onHover(i)}
            onClick={() => onSelect(p.name)}
            className={cn(
              "flex w-full items-center gap-2 px-2 py-1.5 text-left text-sm",
              i === activeIndex ? "bg-accent" : "hover:bg-accent/60",
            )}
          >
            <Avatar className="h-5 w-5">
              <AvatarFallback className="text-[10px]">
                {initials(p.name)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate flex-1">{p.name}</span>
            {p.inMeeting && (
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                in meeting
              </span>
            )}
          </button>
        ))
      )}
    </div>
  );
}

/* ---------------- mention context detection ---------------- */

const RE_ACTION_PREFIX = /^\s*(?:executar\s+)?\[action\b/i;

export type MentionContext = {
  query: string;
  start: number; // absolute index of the '@' in the full text
};

export function getMentionContext(
  value: string,
  caret: number,
): MentionContext | null {
  // Find current line bounds.
  const lineStart = value.lastIndexOf("\n", caret - 1) + 1;
  const before = value.slice(lineStart, caret);

  if (!RE_ACTION_PREFIX.test(value.slice(lineStart))) return null;

  const at = before.lastIndexOf("@");
  if (at < 0) return null;

  const query = before.slice(at + 1);
  // Cancel if the query already contains a separator or the closing bracket.
  if (/[\s\]]/.test(query)) return null;

  return { query, start: lineStart + at };
}

export function filterPeople(
  people: MentionPerson[],
  query: string,
  limit = 6,
): MentionPerson[] {
  const q = query.trim().toLowerCase();
  if (!q) return people.slice(0, limit);

  const starts: MentionPerson[] = [];
  const includes: MentionPerson[] = [];
  for (const p of people) {
    const n = p.name.toLowerCase();
    if (n.startsWith(q)) starts.push(p);
    else if (n.includes(q)) includes.push(p);
  }
  return [...starts, ...includes].slice(0, limit);
}
