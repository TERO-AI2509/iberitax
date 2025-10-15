import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "node:crypto";

const SESSION_COOKIE_NAME = "ibx_session";
const MAX_AGE_SEC = 60 * 60 * 24 * 7;

function b64url(input: Buffer | string) {
  return Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function b64urlDecode(s: string) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return Buffer.from(s, "base64");
}

function getSecrets() {
  const cur = process.env.IBX_SESSION_SECRET_CURRENT || "";
  const prev = process.env.IBX_SESSION_SECRET_PREVIOUS || "";
  if (!cur) throw new Error("IBX_SESSION_SECRET_CURRENT is required");
  const keys: Array<{ id: "current"|"previous"; key: Buffer }> = [{ id:"current", key: Buffer.from(cur, "utf8") }];
  if (prev) keys.push({ id:"previous", key: Buffer.from(prev, "utf8") });
  return keys;
}

export type SessionPayload = { email: string; sub?: string; iat: number };

function sign(key: Buffer, data: string) {
  return crypto.createHmac("sha256", key).update(data).digest();
}

function serialize(payload: SessionPayload, sig: Buffer) {
  const head = b64url(JSON.stringify({ alg: "HS256", typ: "IBX" }));
  const body = b64url(JSON.stringify(payload));
  const mac = b64url(sig);
  return `${head}.${body}.${mac}`;
}

function parseCookie(raw: string) {
  const parts = raw.split(".");
  if (parts.length !== 3) return null;
  const [, body, mac] = parts;
  return { body, mac };
}

export function setSignedSessionCookie(payload: SessionPayload, res?: NextResponse) {
  const key = getSecrets()[0].key;
  const body = b64url(JSON.stringify(payload));
  const head = b64url(JSON.stringify({ alg:"HS256", typ:"IBX" }));
  const sig = sign(key, `${head}.${body}`);
  const value = `${head}.${body}.${b64url(sig)}`;

  const isProd = process.env.NODE_ENV === "production";
  const cookieAttrs = {
    name: SESSION_COOKIE_NAME,
    value,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isProd,
    maxAge: MAX_AGE_SEC,
    path: "/",
  };

  if (res) {
    res.cookies.set(cookieAttrs);
    return res;
  }
  cookies().set(cookieAttrs);
}

export function clearSessionCookie(res?: NextResponse) {
  const attrs = { name: SESSION_COOKIE_NAME, value: "", maxAge: 0, path: "/", httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production" };
  if (res) { res.cookies.set(attrs); return res; }
  cookies().set(attrs);
}

export type ReadResult =
  | { ok: true; payload: SessionPayload; rotated: boolean }
  | { ok: false };

export function readSignedSessionCookie(): ReadResult {
  const c = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!c) return { ok: false };
  const parsed = parseCookie(c);
  if (!parsed) return { ok: false };

  const keys = getSecrets();
  const head = c.split(".")[0];
  let rotated = false;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const sig = sign(key.key, `${head}.${parsed.body}`);
    const mac = b64url(sig);
    if (crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(parsed.mac))) {
      const payload = JSON.parse(b64urlDecode(parsed.body).toString("utf8")) as SessionPayload;
      if (key.id === "previous") {
        const res = NextResponse.next();
        setSignedSessionCookie(payload, res);
        rotated = true;
        const setCookie = res.headers.get("set-cookie");
        if (setCookie) {
          // apply rotation header to current response context
          // For Server Components/API: caller can forward res if needed; for simple reads ignore.
        }
      }
      return { ok: true, payload, rotated };
    }
  }
  return { ok: false };
}
