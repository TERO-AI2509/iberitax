import fs from 'node:fs';
export default async function handler(req, res, url) {
  const p = 'artifacts/modelo100/lawyer.review.log.jsonl';
  let out = 'case_id,who,ts,applied_rule_snapshot\n';
  if (fs.existsSync(p)) {
    const lines = fs.readFileSync(p, 'utf8').split(/\r?\n/).filter(Boolean);
    for (const line of lines) {
      try {
        const o = JSON.parse(line);
        const cid = String(o.case_id || '');
        const who = String(o.who || '');
        const ts = String(o.ts || '');
        const snap = JSON.stringify(o.applied_rule_snapshot || {});
        out += [cid,who,ts,snap.replace(/"/g,'""')].map(v => `"${v}"`).join(',') + '\n';
      } catch {}
    }
  }
  res.statusCode = 200;
  res.setHeader('content-type','text/csv; charset=utf-8');
  res.end(out);
}
