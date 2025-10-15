"use client";
import { signIn } from "next-auth/react";

export default function GoogleButton({ callbackUrl = "/dashboard" }: { callbackUrl?: string }) {
  return (
    <button
      className="rounded px-4 py-2 border"
      onClick={() => signIn("google", { callbackUrl })}
    >
      Continue with Google
    </button>
  );
}
