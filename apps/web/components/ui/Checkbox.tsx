"use client"
import * as React from "react"
import clsx from "clsx"
import { focusClass } from "./focus"
export type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement>
export default function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      {...props}
      className={clsx(
        "h-4 w-4 rounded border border-foreground/30 bg-background transition-shadow align-middle motion-reduce:transition-none",
        focusClass,
        className
      )}
    />
  )
}
