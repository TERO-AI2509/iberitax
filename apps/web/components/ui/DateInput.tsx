"use client"
import * as React from "react"
import clsx from "clsx"
import { focusClass, focusBorder } from "./focus"
export type DateInputProps = React.InputHTMLAttributes<HTMLInputElement>
export default function DateInput({ className, ...props }: DateInputProps) {
  return (
    <input
      type="date"
      {...props}
      className={clsx(
        "w-full rounded-lg border border-foreground/15 bg-background px-3 py-2 text-base transition-shadow motion-reduce:transition-none",
        focusClass,
        focusBorder,
        className
      )}
    />
  )
}
