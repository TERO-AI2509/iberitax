import fs from "node:fs";
import path from "node:path";
const ROOT="artifacts/review";
const LOG=path.join(ROOT,"lawyer_review.log.jsonl");
const IDX=path.join(ROOT,"slack.index.json");
export function ensureDirs(){fs.mkdirSync(ROOT,{recursive:true});if(!fs.existsSync(IDX)) fs.writeFileSync(IDX,"{}");}
export function appendLog(entry){
  ensureDirs();
  fs.appendFileSync(LOG,JSON.stringify({...entry,ts:new Date().toISOString()})+"\n");
}
export function getIndex(){ensureDirs();return JSON.parse(fs.readFileSync(IDX,"utf8")||"{}");}
export function setIndex(idx){ensureDirs();fs.writeFileSync(IDX,JSON.stringify(idx,null,2));}
export function recordSlackMessage(case_id, ts){
  const idx=getIndex();idx[case_id]=idx[case_id]||{};idx[case_id].ts=ts;setIndex(idx);
}
export function setAssignee(case_id, user){
  const idx=getIndex();idx[case_id]=idx[case_id]||{};idx[case_id].assignee=user;idx[case_id].status="in_review";setIndex(idx);
}
export function setResolved(case_id, user, note){
  const idx=getIndex();idx[case_id]=idx[case_id]||{};idx[case_id].status="resolved";idx[case_id].resolved_by=user;idx[case_id].note=note||"";setIndex(idx);
}
