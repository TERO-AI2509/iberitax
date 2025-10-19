export type Density = "comfy" | "compact"

export const density: Record<Density, { rowPaddingY: string; rowPaddingX: string; radius: string; gap: string }> = {
  comfy:   { rowPaddingY: "py-3", rowPaddingX: "px-4", radius: "rounded-xl", gap: "gap-3" },
  compact: { rowPaddingY: "py-2", rowPaddingX: "px-3", radius: "rounded-lg",  gap: "gap-2" },
}
