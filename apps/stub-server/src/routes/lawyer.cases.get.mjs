import fs from 'node:fs';
export default async function handler(req, res, url) {
  try {
    let cases = [];
    const p = 'artifacts/modelo100/conflicts.json';
    if (fs.existsSync(p)) {
      const arr = JSON.parse(fs.readFileSync(p, 'utf8'));
      cases = Array.isArray(arr) ? arr.map(x => ({ id: x.id || String(Math.random()), title: x.title_es || x.id, state: 'open', updated_at: new Date().toISOString() })) : [];
    }
    res.statusCode = 200;
    res.setHeader('content-type','application/json');
    res.end(JSON.stringify(cases));
  } catch (e) {
    res.statusCode = 200;
    res.setHeader('content-type','application/json');
    res.end(JSON.stringify([]));
  }
}
