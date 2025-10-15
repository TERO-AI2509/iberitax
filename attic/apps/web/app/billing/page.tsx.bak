import Link from "next/link"
import { isLoggedIn, isPro } from "@/lib/session"

export default async function BillingPage() {
  const loggedIn = await isLoggedIn()
  const pro = await isPro()

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Billing</h1>

      <p className="opacity-80">
        Plan: <strong>{pro ? "Pro active" : "Free"}</strong>
      </p>

      {!pro && (
        <div className="space-y-2">
          <p>Upgrade to Pro to unlock all features.</p>
          <Link href="/account" className="underline">
            Go to Account
          </Link>
        </div>
      )}

      {!loggedIn && (
        <p className="opacity-80">
          You are not signed in. <Link href="/login" className="underline">Sign in</Link>
        </p>
      )}
    </main>
  )
}
