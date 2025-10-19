"use client"
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getOrCreateReturnId } from "@/components/flow/client-id"
export default function RedirectLegacy() {
  const router = useRouter()
  const path = usePathname()
  useEffect(() => {
    const id = getOrCreateReturnId()
    const suffix = path.replace(/^\/flow/, "")
    router.replace(`/flow/${id}${suffix}`)
  }, [router, path])
  return null
}
