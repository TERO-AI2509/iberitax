import Link from "next/link"
import { isLoggedIn, isPro } from "@/lib/session"

export default async function DashboardPage() {
  const loggedIn = await isLoggedIn()
  const pro = await isPro()

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <p className="opacity-80">
        Status: <strong>{loggedIn ? "Signed in" : "Guest"}</strong> • Plan: <strong>{pro ? "Pro" : "Free"}</strong>
      </p>
      {!loggedIn && (
        <p>
          Please <Link href="/login" className="underline">sign in</Link> to see your data.
        </p>
      )}
    </main>
  )
}
