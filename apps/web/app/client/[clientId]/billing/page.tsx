"use client"
export default function Page({ params }: { params: { clientId: string } }) {
  async function go() {
    const res = await fetch(`/api/billing/checkout?clientId=${params.clientId}`, { method: "POST" })
    const data = await res.json()
    if (data.url) window.location.href = data.url
  }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Billing</h1>
      <button className="px-4 py-2 rounded bg-black text-white" onClick={go}>Pay with Stripe</button>
    </div>
  )
}
