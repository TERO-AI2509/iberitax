#!/usr/bin/env node
import * as fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.env.RULES_DIR || 'rules'
const UPDATE_CSV = process.env.UPDATE_CSV || 'artifacts/modelo100/rules.meta.csv'

function splitCSVLine(line){
  const out=[]; let cur='', q=false
  for (let i=0;i<line.length;i++){
    const ch=line[i]
    if (ch === '"' && line[i-1] !== '\\') { q=!q; continue }
    if (ch === ',' && !q) { out.push(cur); cur=''; continue }
    cur += ch
  }
  out.push(cur)
  return out
}
function parseCSV(s){
  const lines=s.split(/\r?\n/).filter(x=>x.trim().length>0)
  if(lines.length===0) return { header:[], rows:[] }
  const header=splitCSVLine(lines[0]).map(h=>h.trim())
  const rows=lines.slice(1).map(line=>{
    const cols=splitCSVLine(line).map(x=>x.trim())
    const obj={}; header.forEach((h,i)=>obj[h]=cols[i]??'')
    return obj
  })
  return { header, rows }
}
function toCSV(header, rows){
  const esc = v => {
    const s = (v??'').toString()
    if (/[,"\n]/.test(s)) return `"${s.replace(/"/g,'""')}"`
    return s
  }
  return [header.join(','), ...rows.map(r=>header.map(k=>esc(r[k]??'')).join(','))].join('\n')+'\n'
}
function hasFrontmatter(s){ return /^---\s*\n[\s\S]*?\n---\s*\n?/m.test(s) }
function parseFrontmatter(s){
  const m=s.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/m)
  if(!m) return { meta:{}, body:s }
  const raw=m[1], body=s.slice(m[0].length)
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
  return { meta, body }
}
function buildFrontmatter(meta){
  const lines=[]
  for(const [k,v] of Object.entries(meta)){
    if(k==='tags' && Array.isArray(v)) lines.push(`tags: [${v.join(', ')}]`)
    else lines.push(`${k}: "${v??''}"`)
  }
  return `---\n${lines.join('\n')}\n---\n`
}
function isValidDateISO(d){
  if(!d) return true
  return /^\d{4}-\d{2}-\d{2}$/.test(d)
}

async function writeCSVRuleFile(p, updates){
  const s=await fs.readFile(p,'utf8')
  const { header, rows } = parseCSV(s)
  const needCols = ['owner','status','updated']
  const newHeader = [...header]
  for(const c of needCols){ if(!newHeader.includes(c)) newHeader.push(c) }
  let touched = 0
  const idKey = header.find(h=>h.toLowerCase()==='id') || 'id'
  const map = new Map(rows.map(r=>[r[idKey], r]))
  for(const [id, meta] of updates){
    const row = map.get(id)
    if(!row) continue
    if(!isValidDateISO(meta.updated)) throw new Error(`Invalid updated date for ${id}: ${meta.updated} (expected YYYY-MM-DD)`)
    row.owner = meta.owner||row.owner||''
    row.status = meta.status||row.status||''
    row.updated = meta.updated||row.updated||''
    touched++
  }
  const outRows = rows.map(r=>{
    const obj={}
    for(const h of newHeader) obj[h]=r[h]??''
    return obj
  })
  await fs.writeFile(p, toCSV(newHeader, outRows), 'utf8')
  return touched
}

async function writeMDRuleFile(p, updates){
  const s=await fs.readFile(p,'utf8')
  const id = path.basename(p).replace(/\.(md|markdown)$/i,'')
  const metaUpd = updates.get(id)
  if(!metaUpd) return 0
  if(!isValidDateISO(metaUpd.updated)) throw new Error(`Invalid updated date for ${id}: ${metaUpd.updated} (expected YYYY-MM-DD)`)
  if(hasFrontmatter(s)){
    const { meta, body } = parseFrontmatter(s)
    const next = { ...meta, owner: metaUpd.owner||meta.owner||'', status: metaUpd.status||meta.status||'', updated: metaUpd.updated||meta.updated||'' }
    const out = buildFrontmatter(next) + body
    await fs.writeFile(p,out,'utf8')
  }else{
    const pre = buildFrontmatter({ owner: metaUpd.owner||'', status: metaUpd.status||'', updated: metaUpd.updated||'' })
    await fs.writeFile(p, pre + s, 'utf8')
  }
  return 1
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
  const updS = await fs.readFile(UPDATE_CSV,'utf8')
  const { rows } = parseCSV(updS)
  const updates = new Map()
  for(const r of rows){
    if(!r.id) continue
    updates.set(r.id, { owner:(r.owner||'').trim(), status:(r.status||'').trim(), updated:(r.updated||'').trim() })
  }
  let applied=0, csvFiles=0, mdFiles=0
  await walk(ROOT, async p=>{
    if(/\.(csv)$/i.test(p)){ applied += await writeCSVRuleFile(p, updates); csvFiles++ }
    else if(/\.(md|markdown)$/i.test(p)){ applied += await writeMDRuleFile(p, updates); mdFiles++ }
  })
  console.log(JSON.stringify({ ok:true, applied, scanned:{ csv: csvFiles, md: mdFiles }, update_csv: UPDATE_CSV, root: ROOT }))
}
main().catch(e=>{ console.error(e.message||e); process.exit(1) })
