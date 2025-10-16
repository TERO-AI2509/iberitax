import * as fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.env.RULES_DIR || 'rules'
const SEVERITIES = new Set(['low','medium','high','critical'])

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

async function readCSV(p){
  const s=await fs.readFile(p,'utf8')
  const lines=s.split(/\r?\n/).filter(x=>x.trim().length>0)
  if(lines.length===0) return []
  const header=splitCSVLine(lines[0]).map(h=>h.trim())
  const rows=[]
  for(let i=1;i<lines.length;i++){
    const cols=splitCSVLine(lines[i]).map(x=>x.trim())
    const obj={}; header.forEach((h,idx)=>obj[h]=cols[idx]??'')
    rows.push({
      id: obj.id,
      severity: obj.severity?.toLowerCase(),
      tags: (obj.tags||'').split('|').map(x=>x.trim()).filter(Boolean),
      message: obj.message||'',
      rationale: obj.rationale||'',
      examples: (obj.examples||'').split('||').map(x=>x.trim()).filter(Boolean),
      owner: obj.owner||'',
      status: obj.status||'',
      updated: obj.updated||'',
      _source: p
    })
  }
  return rows
}

function parseFrontmatter(md){
  const m=md.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/m)
  if(!m) return {meta:{}, rest: md}
  const body=m[1]; const rest=md.slice(m[0].length)
  const meta={}
  for(const line of body.split(/\r?\n/)){
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
  return {meta, rest}
}

function parseSections(md){
  const out={rationale:'', examples:[]}
  const rxR=/##\s*Rationale\s*([\s\S]*?)(?=^##\s|\Z)/gmi
  const rxE=/##\s*Examples\s*([\s\S]*?)$/gmi
  const r1=rxR.exec(md); if(r1) out.rationale=r1[1].trim()
  const e1=rxE.exec(md); if(e1) out.examples=e1[1].split(/\r?\n/).map(s=>s.replace(/^\s*[-*]\s*/,'').trim()).filter(Boolean)
  return out
}

async function readMD(p){
  const s=await fs.readFile(p,'utf8')
  const {meta,rest}=parseFrontmatter(s)
  const secs=parseSections(rest)
  return [{
    id: meta.id,
    severity: (meta.severity||'').toLowerCase(),
    tags: Array.isArray(meta.tags)?meta.tags:[],
    message: meta.message||'',
    rationale: secs.rationale||'',
    examples: secs.examples||[],
    owner: meta.owner||'',
    status: meta.status||'',
    updated: meta.updated||'',
    _source: p
  }]
}

function validateRules(rules){
  const errors=[]
  for(const r of rules){
    if(!r.id) errors.push(`Missing id in ${r._source}`)
    if(r.severity && !SEVERITIES.has(r.severity)) errors.push(`Invalid severity "${r.severity}" in ${r._source}`)
  }
  return errors
}

export async function loadRules(){
  const files=[]
  async function walk(dir){
    const ents=await fs.readdir(dir,{withFileTypes:true}).catch(()=>[])
    for(const e of ents){
      if(e.name.startsWith('.')) continue
      const p=path.join(dir,e.name)
      if(e.isDirectory()) await walk(p)
      else if(/\.(csv|md|markdown)$/i.test(e.name)) files.push(p)
    }
  }
  await walk(ROOT)
  let all=[]
  for(const f of files){
    if(f.endsWith('.csv')) all=all.concat(await readCSV(f))
    else all=all.concat(await readMD(f))
  }
  const errors=validateRules(all)
  return { rules: all, errors }
}

if (import.meta.url === `file://${process.argv[1]}`){
  const {rules,errors}=await loadRules()
  console.log(JSON.stringify({ ok: errors.length===0, count: rules.length, errors }, null, 2))
  process.exit(errors.length===0 && rules.length>0 ? 0 : 1)
}
