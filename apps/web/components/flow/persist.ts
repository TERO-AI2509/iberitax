"use client"

type SliceStatus = "Completed" | "Entered" | "Uploaded" | "Pending"

export type Salary = { salary?: number; irpf?: number; ss?: number }
export type OwnerHousing = { mortgageInterest?: number; ibi?: number; insurance?: number }
export type TenantHousing = { annualRent?: number }
export type Dependents = { count?: number }

export type Snapshot = {
  salary?: Salary
  ownerHousing?: OwnerHousing
  tenantHousing?: TenantHousing
  dependents?: Dependents
  statuses?: Record<string, SliceStatus>
  _ts?: number
}

const keyFor = (id: string) => `return:${id}`

export function loadSnapshot(id: string): Snapshot {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(keyFor(id))
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

let saveTimer: any = null
function debouncedSave(id: string, snapshot: Snapshot) {
  if (typeof window === "undefined") return
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(keyFor(id), JSON.stringify({ ...snapshot, _ts: Date.now() }))
      fetch(`/api/returns/${id}/draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(snapshot),
      }).catch(() => {})
    } catch {}
  }, 300)
}

export function writeSlice<T extends keyof Snapshot>(id: string, slice: T, data: NonNullable<Snapshot[T]>, status?: SliceStatus) {
  const prev = loadSnapshot(id)
  const next: Snapshot = { ...prev, [slice]: data, statuses: { ...(prev.statuses || {}), ...(status ? { [slice]: status } : {}) } }
  debouncedSave(id, next)
  return next
}

export function clearSlice(id: string, slice: keyof Snapshot) {
  const prev = loadSnapshot(id)
  const next: Snapshot = { ...prev, statuses: { ...(prev.statuses || {}), [slice as string]: "Pending" } }
  delete (next as any)[slice]
  debouncedSave(id, next)
  return next
}

export function summaryCounts(statuses?: Record<string, SliceStatus>) {
  const counts: Record<SliceStatus, number> = { Completed: 0, Entered: 0, Uploaded: 0, Pending: 0 }
  Object.values(statuses || {}).forEach((s) => { counts[s] = (counts[s] || 0) + 1 })
  return counts
}
