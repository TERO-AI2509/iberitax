"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function labelize(seg: string) {
  if (!seg) return "Home";
  return seg.replace(/[-_]/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

export default function Breadcrumbs() {
  const pathname = usePathname() || "/";
  const parts = pathname.split("/").filter(Boolean);
  const crumbs = [""].concat(parts); // leading "Home"

  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs-wrap">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        {crumbs.map((_, i) => {
          const href = "/" + parts.slice(0, i).join("/");
          const seg = parts[i - 1] || "";
          const isLast = i === crumbs.length - 1;

          return (
            <li key={href || "/"} className="flex items-center gap-1">
              {i > 0 && (
                <span aria-hidden="true" className="px-1 select-none">/</span>
              )}
              {isLast ? (
                <span
                  aria-current="page"
                  className="font-medium text-foreground"
                >
                  {labelize(seg)}
                </span>
              ) : (
                <Link
                  href={href || "/"}
                  className="rounded px-0.5 outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring hover:underline"
                >
                  {i === 0 ? "Home" : labelize(seg)}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
