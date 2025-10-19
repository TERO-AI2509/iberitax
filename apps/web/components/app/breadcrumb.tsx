"use client";
import * as React from "react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

type Crumb = { label: string; href?: string; };
export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-sm">
      {items.map((c, i) => (
        <React.Fragment key={i}>
          {i > 0 && <Separator className="mx-2 h-4" orientation="vertical" />}
          {c.href ? (
            <Link className="underline-offset-4 hover:underline" href={c.href}>{c.label}</Link>
          ) : (
            <span aria-current="page" className="font-medium">{c.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
