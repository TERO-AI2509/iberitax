import http from 'node:http';
import https from 'node:https';

function go(url, method='GET', body=null, headers={}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url, 'http://localhost:3000');
    const mod = u.protocol === 'https:' ? https : http;
    const req = mod.request({ hostname: u.hostname, port: u.port, path: u.pathname + (u.search||''), method, headers }, res => {
      const chunks = [];
      res.on('data', d => chunks.push(d));
      res.on('end', () => resolve({ status: res.statusCode || 0, body: Buffer.concat(chunks).toString(), headers: res.headers }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function mustOk(promise) {
  const r = await promise;
  if (r.status < 200 || r.status > 299) throw new Error('bad status ' + r.status);
  return r;
}

async function run() {
  await mustOk(go('http://localhost:3000/api/lawyer/cases'));
  await mustOk(go('http://localhost:3000/api/lawyer/picked_up', 'POST', JSON.stringify({ id: 'CASE-TEST' }), { 'content-type': 'application/json' }));
  await mustOk(go('http://localhost:3000/api/lawyer/answered', 'POST', JSON.stringify({ id: 'CASE-TEST', message: 'ok' }), { 'content-type': 'application/json' }));
  await mustOk(go('http://localhost:3000/api/lawyer/closed', 'POST', JSON.stringify({ id: 'CASE-TEST' }), { 'content-type': 'application/json' }));
  const csv = await mustOk(go('http://localhost:3000/api/lawyer/export.csv'));
  if (!/case_id|applied_rule_snapshot/i.test(csv.body)) throw new Error('csv header missing');
  console.log('OK 11.11.dashboard');
}
run().catch(e => { console.error(e.message || e); process.exit(1); });
