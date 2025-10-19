import { create } from "zustand"

type SliceStatus = "Completed" | "Entered" | "Uploaded" | "Pending"
type Salary = { salary?: number; irpf?: number; ss?: number }
type OwnerHousing = { mortgageInterest?: number; ibi?: number; insurance?: number }
type TenantHousing = { annualRent?: number }
type Dependents = { count?: number }

type FlowState = {
  returnId: string | null
  setReturnId: (id: string) => void
  salary: Salary
  setSalary: (data: Partial<Salary>) => void
  ownerHousing: OwnerHousing
  setOwnerHousing: (data: Partial<OwnerHousing>) => void
  tenantHousing: TenantHousing
  setTenantHousing: (data: Partial<TenantHousing>) => void
  dependents: Dependents
  setDependents: (data: Partial<Dependents>) => void
  statuses: Record<string, SliceStatus>
  setStatus: (key: string, status: SliceStatus) => void
  summaryCounts: (s: Record<string, SliceStatus>) => { Completed: number; Entered: number; Uploaded: number; Pending: number }
}

const keyFor = (id: string) => `return:${id}`
let saveTimer: any = null
const debouncedSave = (id: string, snapshot: any) => {
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

// Local, module-scoped “hydrated ids” registry prevents double hydration in Strict Mode
const hydratedIds = new Set<string>()

export const useFlowStore = create<FlowState>((set, get) => ({
  returnId: null,
  setReturnId: (id) => {
    if (get().returnId === id) return
    set({ returnId: id })
    if (typeof window !== "undefined" && !hydratedIds.has(id)) {
      try {
        const raw = localStorage.getItem(keyFor(id))
        if (raw) {
          const parsed = JSON.parse(raw)
          set({
            salary: parsed.salary || {},
            ownerHousing: parsed.ownerHousing || {},
            tenantHousing: parsed.tenantHousing || {},
            dependents: parsed.dependents || {},
            statuses: parsed.statuses || {},
          })
        }
      } catch {}
      hydratedIds.add(id)
    }
  },

  salary: {},
  setSalary: (data) => {
    set({ salary: { ...get().salary, ...data } })
    const id = get().returnId
    if (id) debouncedSave(id, snapshotFor(get()))
  },

  ownerHousing: {},
  setOwnerHousing: (data) => {
    set({ ownerHousing: { ...get().ownerHousing, ...data } })
    const id = get().returnId
    if (id) debouncedSave(id, snapshotFor(get()))
  },

  tenantHousing: {},
  setTenantHousing: (data) => {
    set({ tenantHousing: { ...get().tenantHousing, ...data } })
    const id = get().returnId
    if (id) debouncedSave(id, snapshotFor(get()))
  },

  dependents: {},
  setDependents: (data) => {
    set({ dependents: { ...get().dependents, ...data } })
    const id = get().returnId
    if (id) debouncedSave(id, snapshotFor(get()))
  },

  statuses: {},
  setStatus: (key, status) => {
    set({ statuses: { ...get().statuses, [key]: status } })
    const id = get().returnId
    if (id) debouncedSave(id, snapshotFor(get()))
  },

  summaryCounts: (statuses) => {
    const base = { Completed: 0, Entered: 0, Uploaded: 0, Pending: 0 } as const
    const acc: any = { ...base }
    Object.values(statuses || {}).forEach((s) => { acc[s] = (acc[s] || 0) + 1 })
    return acc
  },
}))

export const useReturnStore = useFlowStore

const snapshotFor = (s: any) => ({
  salary: s.salary,
  ownerHousing: s.ownerHousing,
  tenantHousing: s.tenantHousing,
  dependents: s.dependents,
  statuses: s.statuses,
})
