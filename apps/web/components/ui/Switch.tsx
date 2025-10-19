"use client"
import * as React from "react"
import clsx from "clsx"
import { focusClass } from "./focus"
export type SwitchProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { checked?: boolean }
export default function Switch({ className, checked, ...props }: SwitchProps) {
  return (
    <button
      aria-pressed={!!checked}
      role="switch"
      data-state={checked ? "on" : "off"}
      {...props}
      className={clsx(
        "inline-flex h-6 w-10 items-center rounded-full border border-foreground/20 bg-background transition-shadow motion-reduce:transition-none",
        focusClass,
        className
      )}
    >
      <span
        className={clsx(
          "ml-0.5 inline-block h-5 w-5 rounded-full bg-foreground/80 transition-transform",
          checked ? "translate-x-4" : "translate-x-0",
          "motion-reduce:transition-none"
        )}
      />
    </button>
  )
}
