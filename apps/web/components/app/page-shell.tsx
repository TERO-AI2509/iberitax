"use client";
import * as React from "react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function PageShell({
  title,
  subtitle,
  actions,
  loading = false,
  empty = false,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  loading?: boolean;
  empty?: boolean;
  children?: React.ReactNode;
}) {
  if (loading) {
    return (
      <div className="page-x page-y section-stack">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="page-x page-y section-stack">
      <header className="section-stack">
        <div className="section-stack">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle ? (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {actions ? <div className="mt-1">{actions}</div> : null}
      </header>
      <Separator />
      {empty ? (
        <Alert role="status" aria-live="polite" className="soft-card">
          <AlertDescription>No data available yet.</AlertDescription>
        </Alert>
      ) : (
        <div className="section-stack">{children}</div>
      )}
    </div>
  );
}
