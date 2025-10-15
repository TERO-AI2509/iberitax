"use client"
import React from "react"

export default function StartTestCheckout() {
  const [loading, setLoading] = React.useState(false)
  const [url, setUrl] = React.useState<string | null>(null)
  const onClick = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/checkout/create", { method: "POST" })
      const json = await res.json()
      if (json?.ok && json?.data?.url) {
        window.location.assign(json.data.url)
        return
      }
      if (json?.data?.url) setUrl(json.data.url)
      else alert(json?.error?.message || "Could not start checkout")
    } catch (e: any) {
      alert(e?.message || "Network error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <button disabled={loading} onClick={onClick} className="px-4 py-2 rounded-xl shadow">
        {loading ? "Starting…" : "Start test checkout"}
      </button>
      {url && (
        <p>
          Can’t redirect? <a href={url}>Continue to Stripe</a>
        </p>
      )}
    </div>
  )
}
