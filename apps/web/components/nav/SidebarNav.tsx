"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role, NavItem } from "./nav.config";
import { NAV } from "./nav.config";

function isActive(pathname: string, item: NavItem) {
  if (item.match instanceof RegExp) return item.match.test(pathname);
  if (typeof item.match === "string") return new RegExp(item.match).test(pathname);
  return pathname === item.href || pathname.startsWith(item.href + "/");
}

export default function SidebarNav({ area }: { area: Role }) {
  const pathname = usePathname();
  const items = NAV[area] || [];
  return (
    <nav aria-label="Section">
      <ul className="space-y-1">
        {items.map((it) => {
          const active = isActive(pathname, it);
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "block rounded-xl px-3 py-2 text-sm transition",
                  active ? "bg-gray-100 font-medium" : "hover:bg-gray-50"
                ].join(" ")}
              >
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
