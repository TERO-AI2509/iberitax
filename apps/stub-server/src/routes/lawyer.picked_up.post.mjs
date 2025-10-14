import { requirePostSecret } from './_auth.mjs';
import { acquireCaseLock } from './_locks.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';

const LOG = path.resolve(process.cwd(), 'artifacts/modelo100/lawyer.review.log.jsonl');

async function readJson(req){
  const chunks=[]; for await (const ch of req) chunks.push(ch);
  try{ return JSON.parse(Buffer.concat(chunks).toString('utf8')||'{}'); }catch{ return {}; }
}
async function append(evt){
  await fs.mkdir(path.dirname(LOG),{recursive:true});
  await fs.appendFile(LOG, JSON.stringify(evt)+'\n','utf8');
}
async function inferOwner(case_id){
  try{
    const txt = await fs.readFile(LOG,'utf8');
    const lines = txt.trim().split(/\n+/).reverse();
    for(const line of lines){
      try{ const j=JSON.parse(line); if(j.case_id===case_id && j.state==='picked_up' && j.who) return j.who; }catch{}
    }
  }catch{}
  return null;
}

export default async function handler(req,res){
  requirePostSecret(req);
  const body = req.body && Object.keys(req.body).length ? req.body : await readJson(req);
  const case_id = body.case_id;
  const who = body.who;

  if(!case_id || !who){
    res.statusCode=400; res.setHeader('content-type','application/json');
    return res.end(JSON.stringify({ok:false,error:'bad-request',missing:!case_id?'case_id':'who'}));
  }

  const got = acquireCaseLock(case_id);
  if(!got){
    const owner = await inferOwner(case_id);
    res.statusCode=409; res.setHeader('content-type','application/json');
    return res.end(JSON.stringify({ ok:false, error:'already-picked', case_id, owner }));
  }

  const evt = { state:'picked_up', case_id, who, ts:new Date().toISOString(), applied_rule_snapshot:"" };
  await append(evt);
  res.statusCode=200; res.setHeader('content-type','application/json');
  res.end(JSON.stringify({ ok:true, evt }));
}
