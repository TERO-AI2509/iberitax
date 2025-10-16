"use client";
import { useEffect, useState } from "react";

export default function HeaderUser() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch("/api/me", { cache: "no-store" });
      if (res.ok) {
        const j = await res.json();
        setEmail(j.email || null);
      } else {
        setEmail(null);
      }
    } catch {
      setEmail(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function onLogout() {
    await fetch("/api/logout", { method: "POST" });
    await refresh();
  }

  if (loading) return <div className="p-2 text-sm text-gray-500">…</div>;

  return (
    <div className="w-full flex items-center justify-end gap-3 p-2 border-b">
      {email ? (
        <>
          <span className="text-sm">Signed in as {email}</span>
          <button
            onClick={onLogout}
            className="px-3 py-1 rounded-lg border hover:bg-gray-50 text-sm"
          >
            Logout
          </button>
        </>
      ) : (
        <span className="text-sm text-gray-600">Not signed in</span>
      )}
    </div>
  );
}
