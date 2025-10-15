import React, { createContext, useContext, useEffect, useRef } from "react";

type Kind = "toast" | "banner";
type Payload = { type: Kind; message: string };
type Listener = (m: string) => void;
type PayloadListener = (p: Payload) => void;

const toastListeners: Listener[] = [];
const bannerListeners: Listener[] = [];

function add(kind: Kind, fn: Listener) {
  const list = kind === "toast" ? toastListeners : bannerListeners;
  list.push(fn);
  return () => {
    const i = list.indexOf(fn);
    if (i >= 0) list.splice(i, 1);
  };
}

export function listen(kind: Kind, fn: Listener): () => void;
export function listen(fn: PayloadListener): () => void;
export function listen(a: Kind | PayloadListener, b?: Listener): () => void {
  if (typeof a === "function") {
    const onPayload = a as PayloadListener;
    const wToast = (m: string) => onPayload({ type: "toast", message: m });
    const wBanner = (m: string) => onPayload({ type: "banner", message: m });
    toastListeners.push(wToast);
    bannerListeners.push(wBanner);
    return () => {
      const ti = toastListeners.indexOf(wToast);
      if (ti >= 0) toastListeners.splice(ti, 1);
      const bi = bannerListeners.indexOf(wBanner);
      if (bi >= 0) bannerListeners.splice(bi, 1);
    };
  } else {
    const kind = a as Kind;
    const fn = b as Listener;
    return add(kind, fn);
  }
}

export function showToast(m: string) {
  for (const fn of [...toastListeners]) fn(m);
}
export function showBanner(m: string) {
  for (const fn of [...bannerListeners]) fn(m);
}

type API = {
  info: (m: string) => void;
  success: (m: string) => void;
  warn: (m: string) => void;
  error: (m: string) => void;
  toast?: (m: string) => void;
  banner?: (m: string) => void;
};

const defaultApi: API = {
  info: (m: string) => console.log(m),
  success: (m: string) => console.log(m),
  warn: (m: string) => console.warn(m),
  error: (m: string) => console.error(m),
  toast: showToast,
  banner: showBanner,
};

const FeedbackCtx = createContext<API>(defaultApi);

export const useFeedback = () => useContext(FeedbackCtx);

export function FeedbackProvider(props: { children: React.ReactNode }) {
  return <FeedbackCtx.Provider value={defaultApi}>{props.children}</FeedbackCtx.Provider>;
}

export function BannerHost() { return null; }
export function ToastHost() { return null; }

export function useListen(kind: Kind, fn: Listener): void;
export function useListen(fn: PayloadListener): void;
export function useListen(a: Kind | PayloadListener, b?: Listener) {
  const ref = useRef<any>(b || a);
  ref.current = b || a;
  useEffect(() => {
    if (typeof a === "function") {
      return listen((p) => (ref.current as PayloadListener)(p));
    }
    return listen(a as Kind, (m) => (ref.current as Listener)(m));
  }, [a]);
}
