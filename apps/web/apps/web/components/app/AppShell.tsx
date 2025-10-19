"use client";
import { useState } from "react";
import type { Role } from "../nav/nav.config";
import SidebarNav from "../nav/SidebarNav";
import MobileDrawer from "../nav/MobileDrawer";
import Breadcrumbs from "../nav/Breadcrumbs";

export default function AppShell({
  area,
  children
}: { area: Role; children: React.ReactNode }) {
  const [role, setRole] = useState<Role>(area);
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <MobileDrawer area={role} />
          <div className="hidden md:block text-sm font-semibold">TERO Fiscal</div>
          <div className="ml-auto flex items-center gap-2">
            <Breadcrumbs />
            <select
              aria-label="Temporary role switch"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="rounded-xl border px-2 py-1 text-sm"
            >
              <option value="client">Client</option>
              <option value="lawyer">Lawyer</option>
              <option value="ops">Ops</option>
            </select>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[220px_1fr]">
        <aside className="hidden md:block">
          <SidebarNav area={role} />
        </aside>
        <section className="min-w-0">{children}</section>
      </main>
    </div>
  );
}
