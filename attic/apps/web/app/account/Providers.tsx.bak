"use client";

import { useEffect, useState } from "react";

type ProvidersProps = {
  email: string | null;
};

export default function Providers({ email }: ProvidersProps) {
  const [providers, setProviders] = useState<string[]>([]);

  useEffect(() => {
    let aborted = false;
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((json) => {
        if (aborted) return;
        const p: string[] = [];
        const u = json?.user || {};
        if (u?.email) p.push("Email");
        if (u?.image || u?.name) p.push("Google");
        setProviders(p.length ? p : ["Unknown"]);
      })
      .catch(() => setProviders(["Unknown"]));
    return () => {
      aborted = true;
    };
  }, []);

  return (
    <section className="rounded-xl border p-6 space-y-3">
      <h2 className="text-lg font-semibold">Connected providers</h2>
      <p className="text-sm text-gray-400">Signed in as {email ?? "unknown"}</p>
      <ul className="list-disc pl-6">
        {providers.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </section>
  );
}
