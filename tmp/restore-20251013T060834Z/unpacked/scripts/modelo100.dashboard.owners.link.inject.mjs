#!/usr/bin/env node
import fs from 'node:fs/promises'
const SRC='artifacts/modelo100/rules.dashboard.html'
const CHUNK=`\n<p style="margin-top:8px"><a href="./sla.owners.html" style="text-decoration:none" class="badge">Owner SLA Rollups →</a></p>\n`
let src=await fs.readFile(SRC,'utf8').catch(()=>null)
if(!src){ const out='/tmp/rules.dashboard.with-owners-link.html'; await fs.writeFile(out,CHUNK); console.log(JSON.stringify({ok:false,preview:out})); process.exit(0) }
let out=src.replace('</body>', CHUNK+'</body>'); if(out===src) out=src+CHUNK
await fs.writeFile(SRC,out); console.log(JSON.stringify({ok:true,updated:SRC}))
