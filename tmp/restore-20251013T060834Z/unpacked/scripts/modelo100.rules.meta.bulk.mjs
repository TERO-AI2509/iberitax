#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { loadRules } from './modelo100.rules.load.mjs'

const OUT_DIR='artifacts/modelo100'
const OUT_BULK=path.join(OUT_DIR,'rules.meta.bulk.csv')
const APPLY=process.env.APPLY==='1'
const MATCH_TAGS=(process.env.MATCH_TAGS||'').split(',').map(s=>s.trim()).filter(Boolean)
const MATCH_SEVERITY=(process.env.MATCH_SEVERITY||'').toLowerCase()
const OWNER=process.env.OWNER||''
const STATUS=process.env.STATUS||''
const UPDATED=process.env.UPDATED||''

function toCSV(rows){
  const head=['id','owner','status','updated']
  const esc=v=>{const s=(v??'').toString(); return /[,"\n]/.test(s)?`"${s.replace(/"/g,'""')}"`:s}
  return [head.join(','),...rows.map(r=>head.map(k=>esc(r[k])).join(','))].join('\n')+'\n'
}
function pick(r){
  if(MATCH_TAGS.length && !(r.tags||[]).some(t=>MATCH_TAGS.includes(t))) return false
  if(MATCH_SEVERITY && (r.severity||'')!==MATCH_SEVERITY) return false
  return true
}
function mergeCSV(baseCSV,newRows){
  const lines=baseCSV.trim()?baseCSV.split(/\r?\n/):[]
  let header=['id','owner','status','updated'], rows=[]
  if(lines.length>0){
    header=lines[0].split(',').map(s=>s.trim()); rows=lines.slice(1).map(l=>{const c=l.split(','); return {id:c[0]||'',owner:c[1]||'',status:c[2]||'',updated:c[3]||''}})
  }
  const map=new Map(rows.map(r=>[r.id,r]))
  for(const r of newRows){ const cur=map.get(r.id)||{id:r.id,owner:'',status:'',updated:''}; map.set(r.id,{...cur,...r}) }
  const out=[...map.values()]
  return toCSV(out)
}

async function main(){
  const {rules,errors}=await loadRules()
  if(errors.length) throw new Error(errors.join('\n'))
  await fs.mkdir(OUT_DIR,{recursive:true})
  const selected=rules.filter(pick).map(r=>({id:r.id,owner:OWNER||r.owner||'',status:STATUS||r.status||'',updated:UPDATED||r.updated||''}))
  const csv=toCSV(selected)
  await fs.writeFile(OUT_BULK,csv,'utf8')
  if(APPLY){
    const base = await fs.readFile(path.join(OUT_DIR,'rules.meta.csv'),'utf8').catch(()=> 'id,owner,status,updated\n')
    const merged=mergeCSV(base,selected)
    await fs.writeFile(path.join(OUT_DIR,'rules.meta.csv'),merged,'utf8')
    console.log(JSON.stringify({ok:true,bulk:OUT_BULK,merged:'artifacts/modelo100/rules.meta.csv',selected:selected.length,applied:true}))
  }else{
    console.log(JSON.stringify({ok:true,bulk:OUT_BULK,selected:selected.length,applied:false}))
  }
}
main().catch(e=>{console.error(e.message||e);process.exit(1)})
