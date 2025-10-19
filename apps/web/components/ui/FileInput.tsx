"use client"
import * as React from "react"
import clsx from "clsx"
import { focusClass, focusBorder } from "./focus"
export type FileInputProps = React.InputHTMLAttributes<HTMLInputElement>
export default function FileInput({ className, ...props }: FileInputProps) {
  return (
    <input
      type="file"
      {...props}
      className={clsx(
        "block w-full rounded-lg border border-foreground/15 bg-background px-3 py-2 text-base transition-shadow file:mr-4 file:rounded file:border-0 file:bg-foreground/5 file:px-3 file:py-2 motion-reduce:transition-none",
        focusClass,
        focusBorder,
        className
      )}
    />
  )
}
