type GoTo = (url: string) => void
let goTo: GoTo = (url) => { window.location.assign(url) }
export function setGoTo(custom: GoTo) { goTo = custom }
export function navigate(url: string) { goTo(url) }
