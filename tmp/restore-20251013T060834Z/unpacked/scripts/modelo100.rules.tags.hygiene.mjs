#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { loadRules } from './modelo100.rules.load.mjs'

const ROOT=process.env.RULES_DIR || 'rules'
const APPLY=process.env.APPLY==='1'
const OUT_DIR='artifacts/modelo100'
const OUT_JSON=path.join(OUT_DIR,'rules.tags.report.json')

async function writeCSV(p, toCSV){
  const s=await fs.readFile(p,'utf8')
  const lines=s.split(/\r?\n/)
  const hdr=lines[0].split(',')
  const idx=hdr.findIndex(h=>h.trim()==='tags')
  if(idx<0) return false
  const out=[lines[0]]
  for(let i=1;i<lines.length;i++){
    const cols=lines[i].split(',')
    const val=(cols[idx]||'').split('|').map(t=>t.trim()).filter(Boolean).map(t=>t.toLowerCase()).filter((v,i,a)=>a.indexOf(v)===i).join('|')
    cols[idx]=val
    out.push(cols.join(','))
  }
  await fs.writeFile(p,out.join('\n'),'utf8')
  return true
}
function hasFrontmatter(s){ return /^---\s*\n[\s\S]*?\n---\s*\n?/m.test(s) }
function parseFrontmatter(s){
  const m=s.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/m)
  if(!m) return { meta:{}, body:s, head:'' }
  const raw=m[1], body=s.slice(m[0].length), head=m[0]
  const meta={}
  for(const line of raw.split(/\r?\n/)){
    const i=line.indexOf(':'); if(i<0) continue
    const k=line.slice(0,i).trim()
    let v=line.slice(i+1).trim()
    if(k==='tags'){
      const mm=v.match(/\[(.*?)\]/)
      meta.tags=mm?mm[1].split(',').map(s=>s.trim()).filter(Boolean):[]
    }else{
      meta[k]=v.replace(/^"(.*)"$/,'$1')
    }
  }
  return { meta, body, head }
}
function buildFrontmatter(meta){
  const lines=[]
  for(const [k,v] of Object.entries(meta)){
    if(k==='tags' && Array.isArray(v)) lines.push(`tags: [${v.join(', ')}]`)
    else lines.push(`${k}: "${v??''}"`)
  }
  return `---\n${lines.join('\n')}\n---\n`
}
async function fixMD(p){
  const s=await fs.readFile(p,'utf8')
  const {meta,body}=parseFrontmatter(s)
  const tags=(meta.tags||[]).map(t=>t.toLowerCase().trim()).filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i)
  const next={...meta,tags}
  const out=buildFrontmatter(next)+body
  await fs.writeFile(p,out,'utf8')
}
async function walk(dir, fn){
  const ents=await fs.readdir(dir,{withFileTypes:true}).catch(()=>[])
  for(const e of ents){
    if(e.name.startsWith('.')) continue
    const p=path.join(dir,e.name)
    if(e.isDirectory()) await walk(p, fn)
    else await fn(p)
  }
}
async function main(){
  const {rules,errors}=await loadRules()
  if(errors.length) throw new Error(errors.join('\n'))
  await fs.mkdir(OUT_DIR,{recursive:true})
  const empty=rules.filter(r=>(r.tags||[]).length===0).map(r=>r.id)
  const nonLower=[...new Set(rules.flatMap(r=>(r.tags||[]).filter(t=>/[A-Z]/.test(t))))].sort()
  const report={total:rules.length,empty:empty.length,nonLower:nonLower}
  await fs.writeFile(OUT_JSON, JSON.stringify(report,null,2),'utf8')
  if(APPLY){
    await walk(ROOT, async p=>{
      if(/\.(csv)$/i.test(p)) await writeCSV(p, true)
      if(/\.(md|markdown)$/i.test(p)) await fixMD(p)
    })
  }
  console.log(JSON.stringify({ok:true,report:OUT_JSON,empty:empty.length,nonLower:nonLower.length,applied:APPLY}))
}
main().catch(e=>{console.error(e.message||e);process.exit(1)})
