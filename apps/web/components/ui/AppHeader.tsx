"use client";

import * as React from "react";

type Props = {
  title: st;
  subtitle?: st;
  actions?: React.ReactNode;
  children?: React.ReactNode; // e.g., <Breadcrumbs />
};

export default function AppHeader({ title, subtitle, actions, children }: Props) {
  return (
    <div role="banner" className="page-x page-y section-stack">
      <div className="header-row">
        <div className="header-stack">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          {subtitle ? (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {actions ? <div className="mt-1">{actions}</div> : null}
      </div>
      {children ? <div className="breadcrumbs-wrap">{children}</div> : null}
    </div>
  );
}
