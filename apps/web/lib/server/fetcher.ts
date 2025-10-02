export async function serverFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, cache: "no-store", credentials: "include" as any });
  const env = await res.json();
  if (!env.ok) {
    const e = new Error(env?.error?.message || "Request failed");
    (e as any).code = env?.error?.code;
    (e as any).hint = env?.error?.hint;
    throw e;
  }
  return env.data as T;
}
