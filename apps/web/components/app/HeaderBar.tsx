"use client";
import { useRouter } from "next/navigation";
import Breadcrumbs from "../nav/Breadcrumbs";
import MobileDrawer from "../nav/MobileDrawer";
import type { Role } from "../nav/nav.config";

export default function HeaderBar({ area }: { area: Role }) {
  const router = useRouter();
  return (
    <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
      <MobileDrawer triggerLabel={String(area)} />
      <div className="hidden md:block text-sm font-semibold">TERO Fiscal</div>
      <div className="ml-auto flex items-center gap-2">
        <Breadcrumbs />
        <select
          aria-label="Temporary role switch"
          defaultValue={area}
          onChange={(e) => router.push("/" + e.target.value)}
          className="rounded-xl border px-2 py-1 text-sm"
        >
          <option value="client">Client</option>
          <option value="lawyer">Lawyer</option>
          <option value="ops">Ops</option>
        </select>
      </div>
    </div>
  );
}
