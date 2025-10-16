export type Envelope<T = unknown> = {
  ok: boolean;
  status: number;
  data?: T;
  error?: { code: string; message: string; hint?: string };
};

export function jsonEnvelope<T>(init: {
  status?: number;
  data?: T;
  error?: { code: string; message: string; hint?: string };
}): Response {
  const status = init.status ?? (init.error ? 400 : 200);
  const body: Envelope<T> = {
    ok: !init.error,
    status,
    ...(init.data ? { data: init.data } : {}),
    ...(init.error ? { error: init.error } : {}),
  };
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}
