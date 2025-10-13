import https from "node:https";
const BOT = process.env.SLACK_BOT_TOKEN || "";
const CHANNEL = process.env.SLACK_CHANNEL_ID || "";
const DRY = String(process.env.DRY_RUN||"0")==="1";
function callSlack(method, body){
  if(DRY) return Promise.resolve({ok:true,dry:true,method,body});
  const data = JSON.stringify(body);
  return new Promise((resolve,reject)=>{
    const req = https.request({
      hostname: "slack.com",
      path: `/api/${method}`,
      method: "POST",
      headers: {
        "Content-Type":"application/json; charset=utf-8",
        "Authorization":`Bearer ${BOT}`,
        "Content-Length": Buffer.byteLength(data)
      }
    },res=>{
      let out="";res.on("data",d=>out+=d);res.on("end",()=>resolve(JSON.parse(out||"{}")));});
    req.on("error",reject);req.write(data);req.end();
  });
}
export async function postMessage({text, blocks, thread_ts}){
  if(!CHANNEL) throw new Error("SLACK_CHANNEL_ID required");
  return callSlack("chat.postMessage",{channel:CHANNEL,text,blocks,thread_ts});
}
export async function updateMessage({ts, text, blocks}){
  if(!CHANNEL) throw new Error("SLACK_CHANNEL_ID required");
  if(!ts) throw new Error("ts required");
  return callSlack("chat.update",{channel:CHANNEL,ts,text,blocks});
}
