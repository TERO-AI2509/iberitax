import { requirePostSecret } from './_auth.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { slackNotify } from '../tools/slack.mjs';

const LOG = path.resolve(process.cwd(), 'artifacts/modelo100/lawyer.review.log.jsonl');

async function readJson(req){
  const chunks = [];
  for await (const ch of req) chunks.push(ch);
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')||'{}'); }
  catch { return {}; }
}

function mkEvt(state,{case_id,who,note}){
  return { state, case_id, who, note, ts: new Date().toISOString() };
}

async function append(evt){
  const dir = path.dirname(LOG);
  await fs.mkdir(dir, { recursive: true });
  await fs.appendFile(LOG, JSON.stringify(evt)+'\n', 'utf8');
}

export default async function handler(req,res){
  if(!requirePostSecret(req,res)) return;
  if(req.method!=='POST'){ res.statusCode=405; return res.end(); }

  const body = await readJson(req);
  const { case_id } = body || {};
  if(!case_id){ res.statusCode=400; return res.end(JSON.stringify({ok:false, error:'missing-case-id'})); }

  const evt = mkEvt('answered', body);
  await append(evt);
  await slackNotify(process.env.SLACK_WEBHOOK_URL, {text:`📝 Respuesta en ${evt.case_id} por ${evt.who}`});
  res.statusCode=200; res.setHeader('content-type','application/json'); res.end(JSON.stringify({ok:true,evt}));
}
