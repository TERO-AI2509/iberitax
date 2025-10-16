#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
async function readJSON(p){ try{ return JSON.parse(await fs.readFile(p,'utf8')) }catch{ return null } }
async function main(){
  const APPLY = process.env.APPLY==='1'
  const report = await readJSON('artifacts/modelo100/cleanup.report.json') || { candidates: [] }
  const picks = report.candidates || []
  const ts = new Date().toISOString().replace(/[:.]/g,'-')
  const attic = path.join('attic', ts)
  const manifest = { created_at: ts, moved: [] }
  if(!APPLY){
    console.log(JSON.stringify({ ok:true, apply:false, count:picks.length, attic },null,2))
    return
  }
  await fs.mkdir(attic, { recursive:true })
  for(const rel of picks){
    const src = path.join(process.cwd(), rel)
    const dst = path.join(attic, rel)
    await fs.mkdir(path.dirname(dst), { recursive:true })
    try{
      await fs.rename(src, dst)
      manifest.moved.push(rel)
    }catch(e){}
  }
  await fs.writeFile(path.join(attic,'MANIFEST.json'), JSON.stringify(manifest,null,2))
  console.log(JSON.stringify({ ok:true, attic, moved:manifest.moved.length },null,2))
}
main()
