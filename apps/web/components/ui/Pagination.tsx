"use client";
import * as React from "react";

function cn(...cls: Array<st | false | null | undefined>) {
  return cls.filter(Boolean).join(" ");
}

export type PaginationProps = {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  total?: number;
  perPage?: number;
  onPerPageChange?: (n: number) => void;
  perPageOptions?: number[];
};

export function Pagination({
  page,
  pageCount,
  onPageChange,
  total,
  perPage,
  onPerPageChange,
  perPageOptions = [20, 50, 100]
}: PaginationProps) {
  const rangeText =
    total != null && perPage != null
      ? `${Math.min((page - 1) * perPage + 1, total)}–${Math.min(page * perPage, total)} of ${total}`
      : `Page ${page} of ${pageCount}`;

  function go(p: number) {
    if (p < 1 || p > pageCount) return;
    onPageChange(p);
  }

  const pages = Array.from({ length: pageCount }, (_, i) => i + 1).slice(0, 7); // compact

  return (
    <nav
      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/70 p-2 shadow-sm supports-[backdrop-filter]:bg-background/50"
      aria-label="Pagination"
    >
      <div className="flex items-center gap-3">
        <div className="px-2 text-sm text-foreground/70">{rangeText}</div>
        {onPerPageChange && perPage != null && (
          <label className="flex items-center gap-2 text-sm">
            <span className="text-foreground/70">Per page</span>
            <select
              value={perPage}
              onChange={(e) => onPerPageChange(Number(e.target.value))}
              className="rounded-xl border border-border/60 bg-background px-2 py-1 text-sm"
            >
              {perPageOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => go(page - 1)}
          disabled={page <= 1}
          className={cn(
            "rounded-xl border px-3 py-1.5 text-sm motion-safe:transition-colors motion-safe:duration-150",
            page <= 1 ? "opacity-50 cursor-not-allowed border-border/60" : "border-border/60 hover:bg-muted/40"
          )}
          aria-label="Previous page"
        >
          ‹
        </button>
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => go(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              "rounded-xl border px-3 py-1.5 text-sm motion-safe:transition-colors motion-safe:duration-150",
              p === page ? "border-primary bg-primary text-primary-foreground" : "border-border/60 hover:bg-muted/40"
            )}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          onClick={() => go(page + 1)}
          disabled={page >= pageCount}
          className={cn(
            "rounded-xl border px-3 py-1.5 text-sm motion-safe:transition-colors motion-safe:duration-150",
            page >= pageCount ? "opacity-50 cursor-not-allowed border-border/60" : "border-border/60 hover:bg-muted/40"
          )}
          aria-label="Next page"
        >
          ›
        </button>
      </div>
    </nav>
  );
}
