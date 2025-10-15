"use client";
let goToImpl: (href: string) => void = (href) => {
  window.location.assign(href);
};
export function setGoTo(fn: (href: string) => void) {
  goToImpl = fn;
}
export function goTo(href: string) {
  goToImpl(href);
}
