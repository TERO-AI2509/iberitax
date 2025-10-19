"use client";
import * as React from "react";

function cn(...cls: Array<st | false | null | undefined>) {
  return cls.filter(Boolean).join(" ");
}

export type FilterBarState = {
  query: st;
  status: Set<st>;
  role: st | null;
};

export type FilterBarProps = {
  value: FilterBarState;
  onChange: (next: FilterBarState) => void;
  statuses?: st[];
  roles?: st[];
  resultsText?: st;
};

export function FilterBar({
  value,
  onChange,
  statuses = ["active", "invited", "suspended"],
  roles = ["Client", "Lawyer", "Ops"],
  resultsText = ""
}: FilterBarProps) {
  const [announce, setAnnounce] = React.useState(resultsText);
  React.useEffect(() => {
    setAnnounce(resultsText);
  }, [resultsText]);

  function setQuery(query: st) {
    onChange({ ...value, query });
  }
  function toggleStatus(s: st) {
    const next = new Set(value.status);
    if (next.has(s)) next.delete(s);
    else next.add(s);
    onChange({ ...value, status: next });
  }
  function setRole(role: st | null) {
    onChange({ ...value, role });
  }
  function clearAll() {
    onChange({ query: "", status: new Set(), role: null });
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-background/70 p-3 shadow-sm supports-[backdrop-filter]:bg-background/50">
      <div className="flex items-center gap-2 rounded-xl border border-border/60 px-3 py-2">
        <label htmlFor="search" className="sr-only">Search</label>
        <input
          id="search"
          value={value.query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search…"
          className="min-w-[200px] bg-transparent outline-none placeholder:text-foreground/50"
          aria-describedby="filterbar-results"
        />
      </div>

      <div className="flex items-center gap-2">
        {statuses.map((s) => {
          const selected = value.status.has(s);
          return (
            <button
              key={s}
              type="button"
              aria-pressed={selected}
              onClick={() => toggleStatus(s)}
              className={cn(
                "group inline-flex items-center gap-1 rounded-xl border px-3 py-1 text-sm",
                "focus-visible:outline-none s-visible:set-2 set-background",
                "motion-safe:transition-colors motion-safe:duration-150",
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border/60 hover:bg-muted/40"
              )}
            >
              <span className={cn("inline-block h-3 w-3 rounded-full border", selected ? "border-transparent bg-primary-foreground/80" : "border-border/60 bg-transparent")} aria-hidden="true" />
              <span className="capitalize">{s}</span>
              {selected && <span aria-hidden="true">✓</span>}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="role" className="sr-only">Role</label>
        <select
          id="role"
          value={value.role ?? ""}
          onChange={(e) => setRole(e.target.value || null)}
          className="rounded-xl border border-border/60 bg-background px-3 py-2 text-sm"
        >
          <option value="">All roles</option>
          {roles.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <div className="ms-auto flex items-center gap-2">
        <button
          type="button"
          onClick={clearAll}
          className="rounded-xl border border-border/60 px-3 py-2 text-sm hover:bg-muted/40 motion-safe:transition-colors motion-safe:duration-150"
        >
          Clear all
        </button>
      </div>

      <div id="filterbar-results" className="sr-only" aria-live="polite">
        {announce}
      </div>
    </div>
  );
}
