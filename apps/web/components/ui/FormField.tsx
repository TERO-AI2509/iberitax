"use client"
import * as React from "react"
import clsx from "clsx"
type Props = {
  label: st
  htmlFor?: st
  hint?: st
  error?: st
  required?: boolean
  children: React.ReactNode
  className?: st
}
export default function FormField({ label, htmlFor, hint, error, required, children, className }: Props) {
  return (
    <div className={clsx("space-y-1", className)}>
      <label htmlFor={htmlFor} className="block text-sm font-medium">{label}{required ? " *" : ""}</label>
      {children}
      {hint && !error && <p className="text-xs text-foreground/60">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
