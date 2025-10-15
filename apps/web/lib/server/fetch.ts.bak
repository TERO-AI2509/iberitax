export type FetchResult<T> = { data?: T; error?: { code: string; message?: string; hint?: string } };

export async function serverFetch<T>(input: RequestInfo | URL, init?: RequestInit): Promise<FetchResult<T>> {
  const res = await fetch(input, init);
  const ct = res.headers.get("content-type") || "";
  const isJson = ct.includes("application/json");
  const payload = isJson ? await res.json() : {};
  return payload;
}
