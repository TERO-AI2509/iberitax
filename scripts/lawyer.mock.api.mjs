import http from 'node:http';
import fs from 'node:fs';
const PORT = process.env.MOCK_PORT ? Number(process.env.MOCK_PORT) : 8788;
function json(res, code, obj){ res.statusCode=code; res.setHeader('content-type','application/json'); res.end(JSON.stringify(obj)); }
function text(res, code, body){ res.statusCode=code; res.setHeader('content-type','text/plain'); res.end(body); }
function readBody(req){ return new Promise(r=>{ let b=''; req.on('data',d=>b+=d); req.on('end',()=>r(b||'')); }); }
function listCases(){
  const p='artifacts/modelo100/conflicts.json';
  if(!fs.existsSync(p)) return [];
  const arr=JSON.parse(fs.readFileSync(p,'utf8'));
  return Array.isArray(arr)?arr.map(x=>({id:x.id||String(Math.random()),title:x.title_es||x.id,state:'open',updated_at:new Date().toISOString()})):[];
}
function appendReview(evt){
  const p='artifacts/modelo100/lawyer.review.log.jsonl';
  fs.mkdirSync('artifacts/modelo100',{recursive:true});
  fs.appendFileSync(p,JSON.stringify(evt)+'\n');
}
function csvExport(){
  const p='artifacts/modelo100/lawyer.review.log.jsonl';
  let out='case_id,who,ts,applied_rule_snapshot\n';
  if(fs.existsSync(p)){
    const lines=fs.readFileSync(p,'utf8').split(/\r?\n/).filter(Boolean);
    for(const line of lines){
      try{
        const o=JSON.parse(line);
        const cid=String(o.case_id||'');
        const who=String(o.who||'');
        const ts=String(o.ts||'');
        const snap=JSON.stringify(o.applied_rule_snapshot||{});
        out+=[cid,who,ts,snap.replace(/"/g,'""')].map(v=>`"${v}"`).join(',')+'\n';
      }catch{}
    }
  }
  return out;
}
const server=http.createServer(async (req,res)=>{
  const u=new URL(req.url||'/',`http://${req.headers.host}`);
  if(req.method==='GET' && u.pathname==='/api/lawyer/cases'){ return json(res,200,listCases()); }
  if(req.method==='GET' && u.pathname==='/api/lawyer/export.csv'){ res.statusCode=200; res.setHeader('content-type','text/csv; charset=utf-8'); return res.end(csvExport()); }
  if(req.method==='POST' && u.pathname==='/api/lawyer/picked_up'){
    const b=JSON.parse(await readBody(req)||'{}'); appendReview({type:'picked_up',case_id:b.id||'',who:'dev',ts:new Date().toISOString(),applied_rule_snapshot:{}});
    return json(res,200,{ok:true,evt:'picked_up'});
  }
  if(req.method==='POST' && u.pathname==='/api/lawyer/answered'){
    const b=JSON.parse(await readBody(req)||'{}'); appendReview({type:'answered',case_id:b.id||'',who:'dev',ts:new Date().toISOString(),applied_rule_snapshot:{msg:b.message||''}});
    return json(res,200,{ok:true,evt:'answered'});
  }
  if(req.method==='POST' && u.pathname==='/api/lawyer/closed'){
    const b=JSON.parse(await readBody(req)||'{}'); appendReview({type:'closed',case_id:b.id||'',who:'dev',ts:new Date().toISOString(),applied_rule_snapshot:{}});
    return json(res,200,{ok:true,evt:'closed'});
  }
  return text(res,404,'not found');
});
server.listen(PORT,()=>process.stdout.write(`mock on http://localhost:${PORT}\n`));
