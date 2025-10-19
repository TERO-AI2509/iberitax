"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

function labelize(seg: string) {
  if (!seg) return "Home";
  return seg.replace(/[-_]/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

export default function Breadcrumbs() {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);
  const crumbs = [""].concat(parts);
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-gray-600">
        {crumbs.map((_, i) => {
          const href = "/" + parts.slice(0, i).join("/");
          const seg = parts[i - 1] || "";
          const isLast = i === crumbs.length - 1;
          return (
            <li key={href} className="flex items-center gap-1">
              {i > 0 && <span>/</span>}
              {isLast ? (
                <span aria-current="page" className="font-medium text-gray-900">
                  {labelize(seg)}
                </span>
              ) : (
                <Link href={href || "/"} className="hover:underline">
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
