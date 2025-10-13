import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
const LOG = join(process.cwd(), 'artifacts', 'modelo100', 'lawyer.review.log.jsonl');

export default async function(req,res){
  if(req.method!=='GET'){ res.statusCode=405; return res.end(); }
  const rows = [];
  if(existsSync(LOG)){
    const lines = readFileSync(LOG,'utf8').trim().split(/\n+/);
    for(const ln of lines){
      let o; try{o=JSON.parse(ln)}catch{continue}
      if(((o.state||o.type))==='closed'){
        const case_id = o.case_id ?? '';
        const who = o.who ?? '';
        const ts = o.ts ?? '';
        const snap = o.applied_rule_snapshot ? JSON.stringify(o.applied_rule_snapshot).replace(/"/g,'""') : '';
        rows.push([case_id,who,ts,snap]);
      }
    }
  }
  const header = 'case_id,who,ts,applied_rule_snapshot';
  const csv = [header, ...rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(','))].join('\n');
  res.statusCode=200;
  res.setHeader('content-type','text/csv; charset=utf-8');
  res.setHeader('content-disposition','attachment; filename="closed.csv"');
  res.end(csv);
}
