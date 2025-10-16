#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
const OUT_DIR='artifacts/modelo100'
const ESJ=path.join(OUT_DIR,'owners.escalation.json')
const isGH = process.env.GITHUB_ACTIONS==='true'
async function main(){
  const txt = await fs.readFile(ESJ,'utf8').catch(()=>null)
  if(!txt){ console.log((isGH?'::notice ::':'')+'Escalation: no data'); return }
  const data = JSON.parse(txt)
  const attn = (data.owners||[]).filter(o=>o.pages||o.breaches||o.warns)
  const head = `Escalation owners=${attn.length} (pages/breaches/warns)`
  console.log(isGH?`::notice ::${head}`:head)
  for(const o of attn.slice(0,15)){
    const msg = `owner=${o.owner} pages=${o.pages} breaches=${o.breaches} warns=${o.warns}`
    console.log(isGH?`::warning ::${msg}`:`- ${msg}`)
  }
}
await main()
