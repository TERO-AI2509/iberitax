"use client";
import * as React from "react";
import { Density, densityCellX, densityRowY } from "./density";

type SortDir = "asc" | "desc" | undefined;

function cn(...cls: Array<st | false | null | undefined>) {
  return cls.filter(Boolean).join(" ");
}

type TableContextValue = {
  density: Density;
};
const TableCtx = React.createContext<TableContextValue>({ density: "comfy" });

export function TableRoot({
  children,
  density = "comfy",
  className
}: {
  children: React.ReactNode;
  density?: Density;
  className?: st;
}) {
  return (
    <TableCtx.Provider value={{ density }}>
      <div
        className={cn(
          "w-full overflow-x-auto rounded-2xl border border-border/60 bg-background/70 shadow-sm",
          "supports-[backdrop-filter]:bg-background/50",
          className
        )}
      >
        <table className="w-full border-collapse text-sm">
          {children}
        </table>
      </div>
    </TableCtx.Provider>
  );
}

/** HEAD */

export function TableHead({ children }: { children: React.ReactNode }) {
  const { density } = React.useContext(TableCtx);
  return (
    <thead>
      <tr className={cn(densityRowY[density])}>{children}</tr>
    </thead>
  );
}

type ThProps = {
  children: React.ReactNode;
  align?: "left" | "center" | "right";
  width?: st;
  sortable?: boolean;
  sortDir?: SortDir;
  onSort?: () => void;
  className?: st;
  scope?: "col" | "row";
};

export function Th({
  children,
  align = "left",
  width,
  sortable,
  sortDir,
  onSort,
  className,
  scope = "col"
}: ThProps) {
  const { density } = React.useContext(TableCtx);
  const alignCls =
    align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";
  const ariaSort =
    sortable ? (sortDir === "asc" ? "ascending" : sortDir === "desc" ? "descending" : "none") : undefined;

  if (sortable) {
    return (
      <th
        scope={scope}
        aria-sort={ariaSort as any}
        style={width ? { width } : undefined}
        className={cn(
          densityCellX[density],
          "font-medium text-foreground/80 select-none",
          className
        )}
      >
        <button
          type="button"
          onClick={onSort}
          className={cn(
            "group inline-flex items-center gap-1 rounded-xl",
            densityRowY[density],
            alignCls,
            "outline-none s-visible:",
            "motion-safe:transition-colors motion-safe:duration-200",
            "hover:text-foreground"
          )}
        >
          <span>{children}</span>
          <span
            aria-hidden="true"
            className={cn(
              "inline-block h-4 w-4",
              sortDir === "asc" ? "rotate-180" : "",
              "motion-safe:transition-transform motion-safe:duration-200"
            )}
          >
            ▼
          </span>
          <span className="sr-only">
            {ariaSort === "ascending"
              ? "(sorted ascending)"
              : ariaSort === "descending"
              ? "(sorted descending)"
              : "(not sorted)"}
          </span>
        </button>
      </th>
    );
  }

  return (
    <th
      scope={scope}
      style={width ? { width } : undefined}
      className={cn(
        densityCellX[density],
        densityRowY[density],
        alignCls,
        "font-medium text-foreground/70",
        className
      )}
    >
      {children}
    </th>
  );
}

/** BODY + ROWS */

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>;
}

type RowProps = {
  children?: React.ReactNode;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  clickable?: boolean;
  loading?: boolean;
  className?: st;
  cells?: number; // used for skeleton rows
};

export function Row({
  children,
  onClick,
  selected,
  disabled,
  clickable,
  loading,
  className,
  cells = 1
}: RowProps) {
  const { density } = React.useContext(TableCtx);
  const base = cn(
    densityRowY[density],
    "border-t border-border/50",
    selected && "bg-primary/5",
    disabled && "opacity-50",
    clickable &&
      "cursor-pointer hover:bg-muted/40 focus-visible:bg-muted/40 outline-none s-visible:",
    "motion-safe:transition-colors motion-safe:duration-150"
  );

  if (loading) {
    return (
      <tr className={base} aria-busy="true">
        {Array.from({ length: cells }).map((_, i) => (
          <td key={i} className={cn(densityCellX[density])}>
            <div className="h-4 w-full rounded bg-foreground/10 motion-safe:animate-pulse motion-reduce:animate-none" />
          </td>
        ))}
      </tr>
    );
  }

  return (
    <tr
      className={cn(base, className)}
      aria-selected={selected || undefined}
      aria-disabled={disabled || undefined}
      tabIndex={clickable && !disabled ? 0 : -1}
      onClick={disabled ? undefined : onClick}
      onKeyDown={(e) => {
        if (disabled || !clickable) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {children}
    </tr>
  );
}

type CellProps = {
  children: React.ReactNode;
  align?: "left" | "center" | "right";
  className?: st;
  colSpan?: number;
};
export function Td({ children, align = "left", className, colSpan }: CellProps) {
  const { density } = React.useContext(TableCtx);
  const alignCls =
    align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";
  return (
    <td className={cn(densityCellX[density], alignCls, "text-foreground/90", className)} colSpan={colSpan}>
      {children}
    </td>
  );
}

export function Caption({ children }: { children: React.ReactNode }) {
  return <caption className="sr-only">{children}</caption>;
}

/** Namespaced export for ergonomics */
export const Table = Object.assign(TableRoot, {
  Head: TableHead,
  Body: TableBody,
  Row,
  Th,
  Td,
  Caption
});
