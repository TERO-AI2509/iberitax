"use client";
import * as React from "react";

function cn(...cls: Array<st | false | null | undefined>) {
  return cls.filter(Boolean).join(" ");
}

export type BulkActionsBarProps = {
  selectedCount: number;
  onClear: () => void;
  children?: React.ReactNode;
};

export function BulkActionsBar({ selectedCount, onClear, children }: BulkActionsBarProps) {
  if (selectedCount <= 0) return null;
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-primary/5 p-3 text-sm shadow-sm"
      )}
      role="region"
      aria-label="Bulk actions"
    >
      <div className="font-medium">{selectedCount} selected</div>
      <div className="flex items-center gap-2">{children}</div>
      <div className="ms-auto">
        <button
          type="button"
          onClick={onClear}
          className="rounded-xl border border-border/60 px-3 py-2 text-sm hover:bg-muted/40 motion-safe:transition-colors motion-safe:duration-150"
        >
          Clear selection
        </button>
      </div>
    </div>
  );
}
