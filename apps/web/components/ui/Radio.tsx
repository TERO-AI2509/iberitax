"use client"
import * as React from "react"
import clsx from "clsx"
import { focusClass } from "./focus"
export type RadioProps = React.InputHTMLAttributes<HTMLInputElement>
export default function Radio({ className, ...props }: RadioProps) {
  return (
    <input
      type="radio"
      {...props}
      className={clsx(
        "h-4 w-4 rounded-full border border-foreground/30 bg-background transition-shadow align-middle motion-reduce:transition-none",
        focusClass,
        className
      )}
    />
  )
}
