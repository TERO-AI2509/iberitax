"use client";

import * as React from "react";
import { ArrowUpRight, ArrowDownRight, Minus, Info } from "lucide-react";
import { Card } from "@/components/ui/card";

type DeltaDirection = "up" | "down" | "neutral";

export interface KpiCardProps {
  title: st;
  value?: React.ReactNode;
  deltaLabel?: st;
  deltaDirection?: DeltaDirection;
  loading?: boolean;
  icon?: React.ReactNode;
  ariaLabel?: st;
  onClick?: () => void;
  href?: st;
  interactive?: boolean;
  className?: st;
  children?: React.ReactNode;
}

const deltaIconFor = (dir: DeltaDirection = "neutral") => {
  switch (dir) {
    case "up":
      return <ArrowUpRight className="h-4 w-4" aria-hidden="true" />;
    case "down":
      return <ArrowDownRight className="h-4 w-4" aria-hidden="true" />;
    default:
      return <Minus className="h-4 w-4" aria-hidden="true" />;
  }
};

const deltaColorFor = (dir: DeltaDirection = "neutral") => {
  switch (dir) {
    case "up":
      return "text-emerald-600 dark:text-emerald-400";
    case "down":
      return "text-rose-600 dark:text-rose-400";
    default:
      return "text-muted-foreground";
  }
};

export function KpiCard({
  title,
  value,
  deltaLabel,
  deltaDirection = "neutral",
  loading = false,
  icon,
  ariaLabel,
  onClick,
  href,
  interactive,
  className,
  children,
}: KpiCardProps) {
  const asInteractive = interactive || Boolean(onClick || href);

  const base =
    "group relative rounded-2xl shadow-sm bg-card text-card-foreground ";
  const pad = "p-5 sm:p-6";
  const layout = "flex items-start gap-4";
  const motion =
    "motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-[cubic-bezier(.2,.8,.2,1)]";
  const hoverPress = asInteractive
    ? "hover:translate-y-[-1px] active:translate-y-[0px] focus-visible:outline-none s-visible:"
    : "";
  const reduced = "motion-reduce:transition-none motion-reduce:transform-none";

  const Wrapper: React.ElementType = asInteractive ? "a" : "div";
  const wrapperProps: any = {
    className: [base, pad, motion, hoverPress, reduced, className].join(" "),
    ...(href ? { href } : {}),
    ...(asInteractive ? { role: "button", tabIndex: 0, onClick } : {}),
    "aria-label": ariaLabel ?? title,
  };

  return (
    <Card asChild className="rounded-2xl shadow-none ">
      <Wrapper {...wrapperProps}>
        <div className={layout}>
          <div
            className={[
              "grid place-items-center shrink-0",
              "h-10 w-10 rounded-xl ",
              "bg-muted/50 text-muted-foreground",
            ].join(" ")}
            aria-hidden="true"
          >
            {icon ?? <Info className="h-5 w-5" />}
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-sm text-muted-foreground">{title}</div>

            {loading ? (
              <div className="mt-1 h-7 w-24 rounded-md bg-muted/60 animate-pulse" />
            ) : (
              <div className="mt-1 text-2xl font-semibold leading-tight">
                {value ?? "—"}
              </div>
            )}

            {children ? <div className="mt-2">{children}</div> : null}
          </div>

          <div
            className={[
              "ml-auto inline-flex items-center gap-1 rounded-lg px-2 py-1",
              "",
              deltaColorFor(deltaDirection),
            ].join(" ")}
            aria-label={deltaLabel ?? undefined}
            role="status"
          >
            {deltaIconFor(deltaDirection)}
            <span className="text-xs font-medium">{deltaLabel ?? "—"}</span>
          </div>
        </div>
      </Wrapper>
    </Card>
  );
}

export default KpiCard;
