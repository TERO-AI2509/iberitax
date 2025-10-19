export function flowBase(clientId: string, returnId: string) {
  if (!clientId || !returnId) throw new Error("Missing clientId/returnId");
  return `/client/${clientId}/flow/${returnId}`;
}

export function flowJoin(clientId: string, returnId: string, path: string) {
  const base = flowBase(clientId, returnId);
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
