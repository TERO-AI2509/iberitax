import http from 'http';
const port = process.env.PORT || 8787;
const send = (res, code, body, type='application/json') => {res.writeHead(code, {'content-type':type});res.end(body);};
const server = http.createServer((req,res) => {
  if (req.method==='GET' && req.url.startsWith('/recent-uploads')) return send(res,200,'[]');
  if (req.method==='POST' && req.url.startsWith('/backfill')) return send(res,200,'{"ok":true}');
  if (req.method==='GET' && req.url.startsWith('/')) return send(res,200,'OK','text/plain');
  send(res,404,'{"error":"not found"}');
});
server.listen(port, ()=>process.stdout.write(`stub-mini on :${port}\n`));
