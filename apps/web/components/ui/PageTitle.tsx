"use client";

import * as React from "react";

export default function PageTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="page-head text-2xl font-semibold tracking-tight">
      {children}
    </h1>
  );
}
