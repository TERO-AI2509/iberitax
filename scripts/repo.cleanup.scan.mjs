#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
const IGNORES = new Set(['.git','node_modules','artifacts/modelo100/public','artifacts/modelo100/report','.github','.vscode','.idea'])
const SUSPECT = [
  /\.bak$/i, /\.orig$/i, /~$/, /\.tmp$/i, /\.swp$/i, /\.DS_Store$/, /\.log$/i,
  /^iberitax-.*\.zip$/i, /^repo-manifest-.*\.txt$/i
]
function isSuspect(name){ return SUSPECT.some(rx=>rx.test(name)) }
async function walk(dir, base=''){
  const out=[]; const ents=await fs.readdir(dir,{ withFileTypes:true })
  for(const e of ents){
    const rel = path.posix.join(base, e.name)
    if(IGNORES.has(rel)) continue
    const full = path.join(dir, e.name)
    if(e.isDirectory()){ out.push(...await walk(full, rel)); continue }
    if(isSuspect(e.name)) out.push(rel)
  }
  return out
}
async function main(){
  const repo = process.cwd()
  const list = await walk(repo)
  const report = { ok:true, total:list.length, candidates:list }
  await fs.mkdir('artifacts/modelo100', { recursive:true })
  await fs.writeFile('artifacts/modelo100/cleanup.report.json', JSON.stringify(report,null,2))
  console.log(JSON.stringify(report,null,2))
}
main()
