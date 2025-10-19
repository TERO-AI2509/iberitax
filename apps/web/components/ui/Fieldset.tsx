"use client"
import * as React from "react"
import clsx from "clsx"
type Props = {
  legend?: st
  children: React.ReactNode
  className?: st
}
export default function Fieldset({ legend, children, className }: Props) {
  return (
    <fieldset className={clsx("rounded-xl border border-foreground/10 p-4", className)}>
      {legend && <legend className="px-1 text-sm text-foreground/70">{legend}</legend>}
      {children}
    </fieldset>
  )
}
