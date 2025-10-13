import Link from "next/link"
import { cookies } from "next/headers"

function isLoggedIn(): boolean {
  const c = cookies().get("ibx_session")?.value || ""
  return c.length > 10
}

export default async function HealthPage() {
  const ok = isLoggedIn()
  if (!ok) {
    return (
      <main style={{padding:"2rem",fontFamily:"ui-sans-serif,system-ui"}}>
        <p>Not logged in.</p>
        <p><Link href="/login">Go to Login</Link></p>
      </main>
    )
  }
  return (
    <main style={{padding:"2rem",fontFamily:"ui-sans-serif,system-ui"}}>
      <p>OK</p>
      <p><Link href="/billing">Billing</Link></p>
    </main>
  )
}
