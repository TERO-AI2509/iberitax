type T = 'toast'|'banner';
type P = { type: T; message: string };
const ev = 'ui-feedback';
export function showToast(message: string) {
  window.dispatchEvent(new CustomEvent(ev, { detail: { type: 'toast', message } as P }));
}
export function showBanner(message: string) {
  window.dispatchEvent(new CustomEvent(ev, { detail: { type: 'banner', message } as P }));
}
export function listen(handler: (p: P)=>void) {
  const fn = (e: Event) => handler((e as CustomEvent).detail as P);
  window.addEventListener(ev, fn as any);
  return () => window.removeEventListener(ev, fn as any);
}
