"use client"

import * as React from "react"
import { Check } from "lucide-react"
import clsx from "clsx"
import { density as dens, type Density } from "./density"

export type DataRow = {
  id: st
  title: st
  subtitle?: st
  meta?: st
  disabled?: boolean
}

export type DataListProps = {
  rows: DataRow[]
  selectedIds?: st[]
  onToggle?: (id: st) => void
  density?: Density
  className?: st
  multi?: boolean
}

export default function DataList({
  rows,
  selectedIds = [],
  onToggle,
  density = "comfy",
  className,
  multi = true,
}: DataListProps) {
  const tok = dens[density]
  const isSelected = React.useCallback((id: st) => selectedIds.includes(id), [selectedIds])

  return (
    <div className={clsx("w-full", className)}>
      <ul
        role="listbox"
        aria-multiselectable={multi || undefined}
        className="flex flex-col"
      >
        {rows.map((row) => {
          const selected = isSelected(row.id)
          const disabled = !!row.disabled
          const baseBorder = "border border-foreground/10"
          const hoverBorder = "hover:border-foreground/30"
          const selectedBorder = selected ? "border-foreground/70" : ""
          const focusStyle =
            "focus:outline-none focus-visible:outline-none s-visible:shadow-sm"
          const motion =
            "transition-shadow transition-colors motion-reduce:transition-none motion-reduce:transform-none"
          const emphasis =
            selected
              ? "bg-background/60"
              : "bg-background"

          return (
            <li key={row.id} className="relative">
              <button
                type="button"
                role="option"
                aria-selected={selected}
                disabled={disabled}
                data-selected={selected || undefined}
                onClick={() => !disabled && onToggle?.(row.id)}
                onKeyDown={(e) => {
                  if (disabled) return
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    onToggle?.(row.id)
                  }
                }}
                className={clsx(
                  "group w-full text-left",
                  tok.rowPaddingY,
                  tok.rowPaddingX,
                  tok.radius,
                  "grid grid-cols-[1fr_auto] items-center",
                  baseBorder,
                  hoverBorder,
                  selectedBorder,
                  emphasis,
                  motion,
                  focusStyle
                )}
              >
                <span className={clsx("min-w-0", tok.gap)}>
                  <span className="block truncate font-medium">{row.title}</span>
                  {row.subtitle && (
                    <span className="block truncate text-foreground/70 text-sm">{row.subtitle}</span>
                  )}
                </span>

                <span className="flex items-center gap-2 pl-4">
                  {row.meta && <span className="text-sm text-foreground/60">{row.meta}</span>}
                  <Check
                    className={clsx(
                      "h-5 w-5 shrink-0",
                      selected ? "opacity-100" : "opacity-0",
                      "transition-opacity motion-reduce:transition-none"
                    )}
                    aria-hidden="true"
                  />
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
