export async function fetchCases(query: string) {
  const url = '/api/lawyer/cases' + (query ? `?${query}` : '');
  const r = await fetch(url, { cache: 'no-store' });
  if (!r.ok) throw new Error('cases fetch failed');
  const t = r.headers.get('content-type') || '';
  return t.includes('application/json') ? r.json() : r.text();
}
export async function postCollect(id: string) {
  const r = await fetch('/api/lawyer/picked_up', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id }) });
  if (!r.ok) throw new Error('collect failed');
  return r.json();
}
export async function postReply(id: string, message: string) {
  const r = await fetch('/api/lawyer/answered', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id, message }) });
  if (!r.ok) throw new Error('reply failed');
  return r.json();
}
export async function postClose(id: string) {
  const r = await fetch('/api/lawyer/closed', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id }) });
  if (!r.ok) throw new Error('close failed');
  return r.json();
}
export function exportCSVUrl(q: string) {
  return '/api/lawyer/export.csv' + (q ? `?${q}` : '');
}
