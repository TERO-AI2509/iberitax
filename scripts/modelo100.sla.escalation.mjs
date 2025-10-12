#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
const OUT_DIR='artifacts/modelo100'
const META=path.join(OUT_DIR,'rules.meta.csv')
const SLAJ=path.join(OUT_DIR,'rules.meta.sla.json')
const OUT_JSON=path.join(OUT_DIR,'owners.escalation.json')
const OUT_CSV =path.join(OUT_DIR,'owners.escalation.csv')

// Policy
const PAGE_AFTER = { critical: 3, high: 7 } // days post-breach; medium/low: none
function parseCSV(txt){
  const lines = txt.replace(/\r\n/g,'\n').replace(/\r/g,'\n').split('\n').filter(Boolean)
  if(!lines.length) return {header:[],rows:[]}
  const split=(line)=>{const o=[];let c='';let q=false;for(let i=0;i<line.length;i++){const ch=line[i];if(ch==='\"'){if(q&&line[i+1]==='\"'){c+='\"';i++}else{q=!q}}else if(ch===','&&!q){o.push(c);c=''}else{c+=ch}}o.push(c);return o}
  const header = split(lines[0]).map(h=>h.trim()); const rows = lines.slice(1).map(split)
  const idx = Object.fromEntries(header.map((h,i)=>[h,i]))
  return {header,rows,idx}
}
function asOwner(s){ const t=(s||'').trim(); return t||'_unassigned' }
function roundDown(n){ return Math.floor(n) }
function toCSVRow(arr){ return arr.map(v=>{if(v==null)return'';const s=String(v);return (/[",\n]/.test(s))?`"${s.replace(/"/g,'""')}"`:s}).join(',') }

async function main(){
  const metaTxt = await fs.readFile(META,'utf8').catch(()=>null)
  const slaTxt  = await fs.readFile(SLAJ,'utf8').catch(()=>null)
  if(!metaTxt || !slaTxt){
    console.log(JSON.stringify({ok:false,error:'missing_inputs',need:{meta:META,sla:SLAJ}}))
    process.exitCode=2; return
  }
  const {header,rows,idx} = parseCSV(metaTxt)
  const idCol = header.includes('id')?'id':(header.includes('key')?'key':null)
  const ownerCol = header.includes('owner')?'owner':null
  if(!idCol){ console.log(JSON.stringify({ok:false,error:'schema_mismatch_meta',header})); process.exitCode=3; return }
  const idIx=idx[idCol]; const ownerIx= ownerCol? idx[ownerCol] : -1
  const ownersById = new Map()
  for(const r of rows){
    const id = (r[idIx]||'').trim()
    if(!id) continue
    const owner = ownerIx>=0 ? asOwner(r[ownerIx]) : '_unassigned'
    ownersById.set(id, owner)
  }
  const sla = JSON.parse(slaTxt)
  const items = (sla.rows||[])
  const perOwner = new Map()
  for(const it of items){
    const id = it.id
    const owner = ownersById.get(id) || '_unassigned'
    const sev = (it.severity||'').toLowerCase()
    const thr = it.threshold_days ?? null
    const age = it.age_days ?? null
    const status = it.status // ok | breach | ignored | unknown
    let warn=false, page=false
    if(status==='ok' && thr!=null && age!=null){
      const warnAt = roundDown(0.75*thr)
      warn = age>=warnAt
    }
    if(status==='breach' && age!=null && thr!=null){
      const over = age - thr
      const pgAfter = PAGE_AFTER[sev]
      page = pgAfter!=null && over>=pgAfter
    }
    const rec = { id, severity: sev||null, owner, status, age_days:age, threshold_days:thr, warn, page }
    if(!perOwner.has(owner)){
      perOwner.set(owner,{ owner, total:0, ok:0, breaches:0, warns:0, pages:0, ignored:0, unknown:0, incidents:[] })
    }
    const agg = perOwner.get(owner)
    agg.total++
    if(status==='ok') agg.ok++
    else if(status==='breach') agg.breaches++
    else if(status==='ignored') agg.ignored++
    else if(status==='unknown') agg.unknown++
    if(warn) agg.warns++
    if(page) agg.pages++
    agg.incidents.push(rec)
  }
  // Summaries
  const list = Array.from(perOwner.values()).sort((a,b)=> (b.pages-b.pages) || (b.breaches-b.breaches) || (b.warns-b.warns) || a.owner.localeCompare(b.owner) )
  const summary = {
    ok:true,
    owners:list.length,
    totals:{
      total: list.reduce((s,x)=>s+x.total,0),
      breaches: list.reduce((s,x)=>s+x.breaches,0),
      pages: list.reduce((s,x)=>s+x.pages,0),
      warns: list.reduce((s,x)=>s+x.warns,0),
      ok: list.reduce((s,x)=>s+x.ok,0),
      ignored: list.reduce((s,x)=>s+x.ignored,0),
      unknown: list.reduce((s,x)=>s+x.unknown,0)
    },
    policy:{ warn_at_ratio:0.75, page_after: PAGE_AFTER },
    out:{ json: OUT_JSON, csv: OUT_CSV }
  }
  await fs.mkdir(OUT_DIR,{recursive:true})
  await fs.writeFile(OUT_JSON, JSON.stringify({summary, owners:list}, null, 2))
  const headerOut=['owner','total','breaches','pages','warns','ok','ignored','unknown']
  const lines=[headerOut.join(','), ...list.map(o=>toCSVRow([o.owner,o.total,o.breaches,o.pages,o.warns,o.ok,o.ignored,o.unknown]))]
  await fs.writeFile(OUT_CSV, lines.join('\n'))
  console.log(JSON.stringify({...summary, exit:0}))
  process.exitCode=0
}
await main()
