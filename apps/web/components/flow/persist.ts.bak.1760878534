export async function saveSectionDelta(returnId: string, section: string, patch: any) {
  await fetch(`/api/return/${returnId}/answers/${section}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ op: "merge", patch }) })
}
