"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

function findLatestReturnId(): string | null {
  if (typeof window === "undefined") return null
  let latest: { id: string; ts: number } | null = null
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i) || ""
    if (!k.startsWith("return:")) continue
    try {
      const parsed = JSON.parse(localStorage.getItem(k) || "{}")
      const ts = Number(parsed?._ts || 0)
      const id = k.split(":")[1]
      if (!latest || ts > latest.ts) latest = { id, ts }
    } catch {}
  }
  return latest?.id || null
}

export default function LegacyRedirect({ to }: { to: (id: string) => string }) {
  const router = useRouter()
  useEffect(() => {
    const id = findLatestReturnId()
    if (id) router.replace(to(id))
    else router.replace("/flow") 
  }, [router, to])
  return null
}
