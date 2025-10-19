"use client"
export default function Page({ params }: { params: { clientId: string, returnId: string } }) {
  async function submit() {
    await fetch(`/api/flow/${params.clientId}/${params.returnId}/submit`, { method: "POST" })
    window.location.reload()
  }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Review & Submit</h1>
      <button className="px-4 py-2 rounded bg-black text-white" onClick={submit}>Submit & Lock</button>
    </div>
  )
}
