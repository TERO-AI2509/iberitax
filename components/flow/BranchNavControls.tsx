"use client";
import React from "react";
import { useRouter, usePathname } from "next/navigation";
type Props = { returnId: string };
type NavResp = { nextPath?: string; prevPath?: string };
export default function BranchNavControls({ returnId }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [nav, setNav] = React.useState<NavResp | null>(null);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    let mounted = true;
    const url = `/api/return/${encodeURIComponent(returnId)}/navigate?current=${encodeURIComponent(pathname)}`;
    fetch(url, { cache: "no-store" })
      .then(r => r.json())
      .then((data: NavResp) => { if (!mounted) return; setNav(data); setLoading(false); })
      .catch(() => setLoading(false));
    return () => { mounted = false; };
  }, [returnId, pathname]);
  function go(to?: string) { if (!to) return; router.push(to); }
  return (
    <div className="flex items-center justify-between gap-3">
      <button type="button" onClick={() => go(nav?.prevPath)} disabled={loading || !nav?.prevPath} className="rounded-xl border px-4 py-2 disabled:opacity-50">Back</button>
      <button type="button" onClick={() => go(nav?.nextPath)} disabled={loading || !nav?.nextPath} className="rounded-xl border px-4 py-2 disabled:opacity-50">Continue</button>
    </div>
  );
}
