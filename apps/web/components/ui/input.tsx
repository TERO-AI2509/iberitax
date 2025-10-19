"use client"
import * as React from "react"
import clsx from "clsx"
import { focusClass, focusBorder } from "./focus"
export type InputProps = React.InputHTMLAttributes<HTMLInputElement>
export default function Input({ className, ...props }: InputProps) {
  return (
    <input
      {...props}
      className={clsx(
        "w-full rounded-lg border border-foreground/15 bg-background px-3 py-2 text-base placeholder:text-foreground/50 transition-shadow motion-reduce:transition-none",
        focusClass,
        focusBorder,
        className
      )}
    />
  )
}
