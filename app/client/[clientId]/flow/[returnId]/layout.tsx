import React from "react";
import Link from "next/link";

type Props = {
  children: React.ReactNode;
  params: { clientId: string; returnId: string };
};

type TreeItem = {
  title: string;
  path: string;
  children?: TreeItem[];
};

async function fetchJSON<T>(url: string): Promise<T> {
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error(`Failed ${url}: ${r.status}`);
  return r.json();
}

function NavList({ items, base }: { items: TreeItem[]; base: string }) {
  return (
    <ul className="space-y-1">
      {items.map((it) => {
        const href = `${base}${it.path.startsWith("/") ? it.path : `/${it.path}`}`;
        return (
          <li key={href}>
            <Link href={href} className="block rounded-lg px-3 py-2 hover:bg-gray-50">
              {it.title}
            </Link>
            {it.children && it.children.length > 0 ? (
              <div className="ml-3 border-l pl-3">
                <NavList items={it.children} base={base} />
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

export default async function FlowLayout({ children, params }: Props) {
  const { clientId, returnId } = params;

  const [status, tree] = await Promise.all([
    fetchJSON<{ paid: boolean }>(`/api/engagement/status?clientId=${clientId}`),
    fetchJSON<{ items: TreeItem[] }>(`/api/return/${returnId}/questionnaire/tree`),
  ]);

  if (!status.paid) {
    return (
      <div className="p-6">
        <div className="mb-4 rounded-lg bg-yellow-50 p-4">Payment required</div>
        <Link href={`/client/${clientId}/payment`} className="inline-block rounded-xl border px-4 py-2">
          Go to payment
        </Link>
      </div>
    );
  }

  const base = `/client/${clientId}/flow/${returnId}`;

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-12 gap-6 p-6">
      <aside className="col-span-4 lg:col-span-3">
        <div className="rounded-2xl border p-4">
          <h2 className="mb-3 text-lg font-semibold">Questionnaire</h2>
          <NavList items={tree.items} base={base} />
        </div>
      </aside>
      <main className="col-span-8 lg:col-span-9">{children}</main>
    </div>
  );
}
