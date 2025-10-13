import http from "node:http";
import url from "node:url";
import fs from "node:fs";
import { updateMessage } from "./slack.util.mjs";
import { getIndex, setAssignee, setResolved, appendLog } from "./review.store.mjs";
const PORT = Number(process.env.REVIEW_PORT||8089);
function html(body){return `<!doctype html><meta charset="utf-8"><title>Review</title><body style="font-family:system-ui;max-width:720px;margin:40px auto">${body}</body>`}
function form(case_id, file){
  return `
  <h2>Case ${case_id}</h2>
  <p>Source file: <code>${file||"unknown"}</code></p>
  <form method="POST" action="/claim">
    <input type="hidden" name="case" value="${case_id}">
    <label>Assignee (Slack @handle or name): <input name="user" required></label>
    <button type="submit">Start review</button>
  </form>
  <hr>
  <form method="POST" action="/resolve">
    <input type="hidden" name="case" value="${case_id}">
    <label>Resolved by: <input name="user" required></label>
    <label>Note: <input name="note" placeholder="short note"></label>
    <button type="submit">Resolve</button>
  </form>`
}
function parseBody(req){
  return new Promise(resolve=>{
    let b="";req.on("data",d=>b+=d);req.on("end",()=>{const p=new URLSearchParams(b);const o={};for(const [k,v] of p.entries()) o[k]=v;resolve(o);});
  });
}
async function markClaimed(case_id, user){
  const idx=getIndex();const ts=idx[case_id]?.ts;
  setAssignee(case_id, user);
  appendLog({case_id, action:"claim", user});
  if(ts) await updateMessage({ts, text:`${case_id} — In review by ${user}`, blocks: undefined}).catch(()=>{});
}
async function markResolved(case_id, user, note){
  const idx=getIndex();const ts=idx[case_id]?.ts;
  setResolved(case_id, user, note);
  appendLog({case_id, action:"resolve", user, note});
  if(ts) await updateMessage({ts, text:`${case_id} — Resolved by ${user}${note?` — ${note}`:""}`, blocks: undefined}).catch(()=>{});
}
const srv = http.createServer(async (req,res)=>{
  const u = url.parse(req.url,true);
  if(req.method==="GET" && u.pathname==="/admin/review"){
    const body = form(u.query.case||"", u.query.file||"");
    res.writeHead(200,{"content-type":"text/html"});res.end(html(body));return;
  }
  if(req.method==="POST" && u.pathname==="/claim"){
    const b = await parseBody(req);await markClaimed(b.case,b.user);
    res.writeHead(302,{"Location":`/admin/review?case=${encodeURIComponent(b.case)}`});res.end();return;
  }
  if(req.method==="POST" && u.pathname==="/resolve"){
    const b = await parseBody(req);await markResolved(b.case,b.user,b.note||"");
    res.writeHead(302,{"Location":`/admin/review?case=${encodeURIComponent(b.case)}`});res.end();return;
  }
  res.writeHead(404);res.end("Not found");
});
srv.listen(PORT,()=>console.log(`review server on :${PORT}`));
