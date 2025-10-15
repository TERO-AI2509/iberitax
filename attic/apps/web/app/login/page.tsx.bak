"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

const GoogleButton = dynamic(() => import("./GoogleButton"), { ssr: false });

function safeCallbackUrl(next: string | null): string {
  if (!next) return "/dashboard";
  try {
    if (next.startsWith("/")) return next;
  } catch {}
  return "/dashboard";
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = safeCallbackUrl(searchParams.get("next"));

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      try {
        const res = await fetch("/api/me", { cache: "no-store" });
        if (!cancelled && res.ok) {
          router.replace(callbackUrl);
        }
      } catch {}
    }
    check();
    const id = setInterval(check, 1000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [router, callbackUrl]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await signIn("email", { email, redirect: false, callbackUrl });
    if (res?.ok) setSent(true);
    else setError("Could not send sign-in link. Check EMAIL_SERVER settings.");
    setBusy(false);
  }

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Login</h1>
      {sent ? (
        <p>Check your inbox for a sign-in link.</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3">
          <p>Please sign in to continue.</p>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="border rounded px-3 py-2 w-72"
          />
          <div className="space-x-2">
            <button type="submit" disabled={busy} className="rounded px-4 py-2 border">
              {busy ? "Sending…" : "Send magic link"}
            </button>
            <GoogleButton callbackUrl={callbackUrl} />
          </div>
          {error ? <p className="text-red-600">{error}</p> : null}
        </form>
      )}
    </main>
  );
}
