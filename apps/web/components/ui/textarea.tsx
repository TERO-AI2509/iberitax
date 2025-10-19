"use client"
import * as React from "react"
import clsx from "clsx"
import { focusClass, focusBorder } from "./focus"
export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>
export default function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
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
