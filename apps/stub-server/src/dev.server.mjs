import http from 'node:http';
import {parse} from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(fileURLToPath(new URL('../../..', import.meta.url)));
process.chdir(ROOT);

const PORT = process.env.PORT ? Number(process.env.PORT) : 8787;
const pub = path.resolve('apps/stub-server/public');

async function runHandler(modPath, req, res){
  try{
    const mod = await import(modPath);
    return mod.default(req, res);
  }catch(e){
    res.statusCode = 500;
    res.setHeader('content-type','application/json');
    res.end(JSON.stringify({ok:false,error:String(e)}));
  }
}

function serveStatic(req, res){
  const u = parse(req.url).pathname || '/';
  let file = u === '/' ? '/index.html' : u;
  if (file.endsWith('/')) file += 'index.html';
  const fp = path.join(pub, file);
  if (!fp.startsWith(pub)) { res.statusCode=403; return res.end('forbidden'); }
  import('node:fs').then(fs=>{
    fs.stat(fp, (err, st)=>{
      if(err){ res.statusCode=404; return res.end('not found'); }
      if(st.isDirectory()){
        const idx = path.join(fp, 'index.html');
        fs.stat(idx, (err2, st2)=>{
          if(err2){ res.statusCode=404; return res.end('not found'); }
          res.setHeader('content-type', guess(fp));
          fs.createReadStream(idx).pipe(res);
        });
      }else{
        res.setHeader('content-type', guess(fp));
        fs.createReadStream(fp).pipe(res);
      }
    });
  });
}
function guess(fp){
  if (fp.endsWith('.html')) return 'text/html; charset=utf-8';
  if (fp.endsWith('.js')) return 'application/javascript; charset=utf-8';
  if (fp.endsWith('.css')) return 'text/css; charset=utf-8';
  if (fp.endsWith('.json')) return 'application/json; charset=utf-8';
  if (fp.endsWith('.svg')) return 'image/svg+xml';
  return 'application/octet-stream';
}


const server = http.createServer((req, res)=>{
  const { pathname } = parse(req.url);
  if (pathname === '/api/lawyer/review.jsonl' && req.method === 'GET') {
    return runHandler('./routes/lawyer.review.get.mjs', req, res);
  }
  if (pathname === '/api/lawyer/picked_up' && req.method === 'POST') {
    return runHandler('./routes/lawyer.picked_up.post.mjs', req, res);
  }
  if (pathname === '/api/lawyer/answered' && req.method === 'POST') {
    return runHandler('./routes/lawyer.answered.post.mjs', req, res);
  }
  if (pathname === '/api/lawyer/closed' && req.method === 'POST') {
    return runHandler('./routes/lawyer.closed.post.mjs', req, res);
  }
    if (pathname === '/api/lawyer/closed.csv' && req.method === 'GET') {
    return runHandler('./routes/lawyer.closed_csv.get.mjs', req, res);
  }
  if (pathname === '/api/lawyer/closed/csv' && req.method === 'GET') {
    return runHandler('./routes/lawyer.closed_csv.get.mjs', req, res);
  }
return serveStatic(req, res);
});

server.listen(PORT, ()=>console.log(`dev.server listening on http://localhost:${PORT} (root=${ROOT})`));
