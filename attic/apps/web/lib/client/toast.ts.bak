type Listener = (msg: string) => void
const listeners: Listener[] = []
export function onToast(l: Listener) { listeners.push(l); return () => { const i = listeners.indexOf(l); if (i>=0) listeners.splice(i,1) } }
export function toast(msg: string) { for (const l of listeners) l(msg) }
