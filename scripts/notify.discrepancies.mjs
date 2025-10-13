import fs from "node:fs";
import path from "node:path";
import { postMessage } from "./slack.util.mjs";
import { recordSlackMessage, getIndex } from "./review.store.mjs";
const BASES=["artifacts/extractions","tests/golden"];
function walk(dir, acc=[]){
  if(!fs.existsSync(dir)) return acc;
  for(const e of fs.readdirSync(dir)){const p=path.join(dir,e);const st=fs.statSync(p);if(st.isDirectory()) walk(p,acc); else if(p.endsWith(".json")) acc.push(p);}
  return acc;
}
function pickCases(jsonPath){
  let j;try{j=JSON.parse(fs.readFileSync(jsonPath,"utf8"))}catch{return []}
  const rules=Array.isArray(j.rules)?j.rules:[];
  return rules.filter(r=>r?.provenance && ((r.provenance.discrepancy&&r.provenance.discrepancy.has_discrepancy) || (Array.isArray(r.provenance.questions)&&r.provenance.questions.length>0)))
             .map(r=>({id:r.id||path.basename(jsonPath)+":idx", title:r.title||"Untitled rule", file:jsonPath, prov:r.provenance}));
}
function caseText(c){
  const disc = c.prov?.discrepancy?.has_discrepancy ? "Yes" : "No";
  const q = (c.prov?.questions||[]).join(" • ") || "—";
  return `⚠️ Provenance review needed: ${c.id}\nDiscrepancy: ${disc}\nQuestions: ${q}`;
}
function caseBlocks(c, baseUrl){
  const url = `${baseUrl}/admin/review?case=${encodeURIComponent(c.id)}&file=${encodeURIComponent(c.file)}`;
  return [
    {type:"section",text:{type:"mrkdwn",text:`*${c.id}* — ${c.title}`}},
    {type:"section",text:{type:"mrkdwn",text:caseText(c)}},
    {type:"actions",elements:[{type:"button",text:{type:"plain_text",text:"Open in Review"},url:url}]}
  ];
}
async function main(){
  const baseUrl=process.env.REVIEW_BASE_URL||"http://localhost:8089";
  const idx=getIndex();
  const files=BASES.flatMap(b=>walk(b));
  const cases=[];
  for(const f of files) cases.push(...pickCases(f));
  const newOnes = cases.filter(c=>!idx[c.id]||!idx[c.id].ts);
  for(const c of newOnes){
    const res = await postMessage({text:caseText(c),blocks:caseBlocks(c,baseUrl)});
    const ts = res.ts || (res.message && res.message.ts) || null;
    if(ts) recordSlackMessage(c.id, ts);
  }
  console.log(JSON.stringify({scanned:files.length, cases:cases.length, posted:newOnes.length},null,2));
}
main().catch(e=>{console.error(e);process.exit(1)});
