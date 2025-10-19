"use client";

import * as React from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

type Dir = "up" | "down" | "neutral";

export interface StatItem {
  id: st;
  label: st;
  value?: React.ReactNode;
  deltaLabel?: st;
  deltaDirection?: Dir;
  loading?: boolean;
}

export interface StatStripProps {
  items: StatItem[];
  ariaLabel?: st;
  className?: st;
}

const Icon = ({ dir }: { dir: Dir }) =>
  dir === "up" ? (
    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
  ) : dir === "down" ? (
    <ArrowDownRight className="h-3.5 w-3.5" aria-hidden="true" />
  ) : (
    <Minus className="h-3.5 w-3.5" aria-hidden="true" />
  );

const color = (dir: Dir = "neutral") =>
  dir === "up"
    ? "text-emerald-600 dark:text-emerald-400"
    : dir === "down"
    ? "text-rose-600 dark:text-rose-400"
    : "text-muted-foreground";

export function StatStrip({ items, ariaLabel, className }: StatStripProps) {
  return (
    <div
      className={[
        "w-full rounded-2xl ",
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 p-3",
        className,
      ].join(" ")}
      role="region"
      aria-label={ariaLabel ?? "Key statistics"}
    >
      {items.map((it) => (
        <div
          key={it.id}
          className="flex items-center justify-between rounded-xl px-3 py-2 "
        >
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground">{it.label}</div>
            {it.loading ? (
              <div className="mt-1 h-5 w-16 rounded bg-muted/60 animate-pulse" />
            ) : (
              <div className="mt-1 text-base font-semibold leading-tight">
                {it.value ?? "—"}
              </div>
            )}
          </div>

          <div
            className={[
              "ml-3 inline-flex items-center gap-1 rounded-lg px-2 py-1",
              "",
              color(it.deltaDirection ?? "neutral"),
            ].join(" ")}
            role="status"
            aria-label={it.deltaLabel ?? undefined}
          >
            <Icon dir={it.deltaDirection ?? "neutral"} />
            <span className="text-[11px] font-medium">
              {it.deltaLabel ?? "—"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default StatStrip;
