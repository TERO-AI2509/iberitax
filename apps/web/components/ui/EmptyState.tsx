import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  icon?: React.ReactNode;
  title: st;
  message?: st;
  actionLabel?: st;
  href?: st;
  onActionClick?: () => void;
  subtle?: boolean;
};

export default function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  href,
  onActionClick,
  subtle
}: EmptyStateProps) {
  const Action = actionLabel
    ? href
      ? () => (
          <a href={href} className="mt-1">
            <Button className="soft-transition">{actionLabel}</Button>
          </a>
        )
      : () => (
          <Button className="soft-transition mt-1" onClick={onActionClick}>
            {actionLabel}
          </Button>
        )
    : null;

  return (
    <Card className={`soft-card ${subtle ? "bg-muted/30" : ""}`} role="status" aria-live="polite">
      <div className="flex flex-col items-center text-center gap-3 p-8">
        {icon ? <div aria-hidden className="text-3xl opacity-70">{icon}</div> : null}
        <h2 className="text-lg font-medium">{title}</h2>
        {message ? <p className="max-w-prose text-sm text-muted-foreground">{message}</p> : null}
        {Action ? <Action /> : null}
      </div>
    </Card>
  );
}
