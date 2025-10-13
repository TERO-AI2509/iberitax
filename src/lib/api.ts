export async function postJSON(path: string, body: any, headers: Record<string, string> = {}) {
  // If the page has ?dev-auth=1, append it to the API URL so local auth is bypassed
  try {
    if (typeof window !== "undefined" && window.location.search.includes("dev-auth=1")) {
      const u = new URL(path, window.location.origin);
      u.searchParams.set("dev-auth", "1");
      path = u.pathname + "?" + u.searchParams.toString();
    }
  } catch {}
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
    credentials: "include"
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}
