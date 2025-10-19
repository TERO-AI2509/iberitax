"use client"
export default function Gate({ locked, children }: { locked: boolean; children: React.ReactNode }) {
  if (!locked) return <>{children}</>
  return (
    <div className="space-y-4">
      <div className="rounded border px-3 py-2 text-sm">This return is locked and read-only.</div>
      <fieldset disabled>{children}</fieldset>
    </div>
  )
}
