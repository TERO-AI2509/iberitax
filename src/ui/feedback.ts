export const bus = new EventTarget();
export function showBanner(level: "error" | "warning" | "info", msg: string) {
  bus.dispatchEvent(new CustomEvent("banner", { detail: { level, msg } }));
}
export function showToast(level: "success" | "error" | "info", msg: string) {
  bus.dispatchEvent(new CustomEvent("toast", { detail: { level, msg } }));
}
