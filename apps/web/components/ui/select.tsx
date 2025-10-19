"use client"
import * as React from "react"
import clsx from "clsx"
import { focusClass, focusBorder } from "./focus"
export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>
export default function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      {...props}
      className={clsx(
        "w-full rounded-lg border border-foreground/15 bg-background px-3 py-2 text-base transition-shadow appearance-none motion-reduce:transition-none",
        focusClass,
        focusBorder,
        className
      )}
    >
      {children}
    </select>
  )
}
