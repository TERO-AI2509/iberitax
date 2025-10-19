"use client";

import React from "react";

type Props = {
  currentIndex: number;
  maxIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onReset?: () => void;
  className?: string;
};

export default function WorkflowBar({
  currentIndex,
  maxIndex,
  onPrev,
  onNext,
  onReset,
  className,
}: Props) {
  const canPrev = currentIndex > 0;
  const canNext = currentIndex < maxIndex;

  return (
    <div
      className={[
        "flex items-center justify-between gap-2 rounded-2xl border px-3 py-2",
        "bg-card text-card-foreground",
        className ?? "",
      ].join(" ")}
      role="toolbar"
      aria-label="Workflow controls"
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={!canPrev}
          className={[
            "rounded-xl border px-3 py-2 text-sm",
            "transition-transform motion-safe:duration-150",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            "focus-visible:outline-none",
            "hover:scale-[1.01] active:scale-[0.99]",
            "bg-background text-foreground border-border",
          ].join(" ")}
          aria-keyshortcuts="Shift+Tab"
        >
          Back
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={!canNext}
          className={[
            "rounded-xl border px-3 py-2 text-sm",
            "transition-transform motion-safe:duration-150",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            "focus-visible:outline-none",
            "hover:scale-[1.01] active:scale-[0.99]",
            "bg-primary text-primary-foreground border-primary/60",
          ].join(" ")}
          aria-keyshortcuts="Enter Space"
        >
          {currentIndex === maxIndex ? "Finish" : "Next"}
        </button>
      </div>

      <div className="flex items-center gap-2">
        {onReset ? (
          <button
            type="button"
            onClick={onReset}
            className={[
              "rounded-xl border px-3 py-2 text-xs",
              "transition-transform motion-safe:duration-150",
              "focus-visible:outline-none",
              "hover:scale-[1.01] active:scale-[0.99]",
              "bg-background text-muted-foreground border-border",
            ].join(" ")}
          >
            Reset
          </button>
        ) : null}
      </div>
    </div>
  );
}
