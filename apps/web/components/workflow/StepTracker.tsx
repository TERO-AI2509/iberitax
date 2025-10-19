"use client";

import React from "react";

type Step = { id: string; label: string };
type Props = {
  steps: Step[];
  currentIndex: number;
  className?: string;
};

export default function StepTracker({ steps, currentIndex, className }: Props) {
  return (
    <nav aria-label="Workflow progress" className={className ?? ""}>
      <ol
        role="list"
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
      >
        {steps.map((step, i) => {
          const isCurrent = i === currentIndex;
          const isDone = i < currentIndex;
          return (
            <li key={step.id} aria-current={isCurrent ? "step" : undefined}>
              <div
                className={[
                  "flex items-center rounded-xl border px-3 py-2 select-none",
                  "transition-transform motion-safe:duration-200",
                  isCurrent
                    ? "border-primary/50 bg-primary/5 dark:bg-primary/10"
                    : isDone
                    ? "border-emerald-400/40 bg-emerald-400/5 dark:bg-emerald-400/10"
                    : "border-border/60 bg-background",
                ].join(" ")}
              >
                <span
                  aria-hidden="true"
                  className={[
                    "mr-2 inline-flex h-2.5 w-2.5 rounded-full",
                    isCurrent
                      ? "bg-primary"
                      : isDone
                      ? "bg-emerald-400"
                      : "bg-muted-foreground/40",
                  ].join(" ")}
                />
                <span
                  className={[
                    "text-sm",
                    isCurrent
                      ? "text-foreground"
                      : isDone
                      ? "text-emerald-700 dark:text-emerald-300"
                      : "text-muted-foreground",
                  ].join(" ")}
                >
                  {step.label}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
