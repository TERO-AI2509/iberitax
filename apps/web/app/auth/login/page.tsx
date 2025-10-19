"use client"
import { signIn } from "next-auth/react"
export default function Page() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <button className="px-4 py-2 rounded bg-black text-white" onClick={() => signIn()}>
        Continue
      </button>
    </div>
  )
}
