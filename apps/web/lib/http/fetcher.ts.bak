export async function clientFetch<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, { ...init, credentials: "include" });
  const env = await res.json();
  if (!env.ok) {
    const err = new Error(env?.error?.message || "Request failed");
    (err as any).code = env?.error?.code;
    (err as any).hint = env?.error?.hint;
    throw err;
  }
  return env.data as T;
}
