#!/usr/bin/env node
import fs from 'node:fs/promises'
import {exec as _exec} from 'node:child_process'
import {promisify} from 'node:util'
const exec = promisify(_exec)

const QIDX='artifacts/modelo100/notify/index.json'
const ENABLE = process.env.NOTIFY_ENABLE==='1'

async function curlPost(url, file){
  const cmd = `curl -sS -X POST -H 'Content-Type: application/json' --data @'${file}' '${url}' -o /dev/stderr -w '%{http_code}'`
  const { stdout } = await exec(cmd)
  const code = parseInt(stdout.trim(),10)
  return Number.isFinite(code) ? code : 0
}

async function main(){
  const idx = await fs.readFile(QIDX,'utf8').then(s=>JSON.parse(s)).catch(()=>null)
  if(!idx){ console.log(JSON.stringify({ok:false,error:'missing_queue',file:QIDX})); process.exitCode=2; return }
  if((idx.total||0)===0){ console.log(JSON.stringify({ok:true, sent:0, dry_run:!ENABLE })); return }
  let sent=0, failed=0
  if(!ENABLE){
    console.log(JSON.stringify({ok:true, dry_run:true, queued:idx.total}))
    return
  }
  for(const q of idx.queue){
    try{
      const code = await curlPost(q.webhook, q.file)
      if(code>=200 && code<300) sent++; else failed++
    }catch{ failed++ }
  }
  console.log(JSON.stringify({ok: failed===0, sent, failed}))
  process.exitCode = failed? 1:0
}
await main()
