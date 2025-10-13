#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'

const OUT_DIR = 'artifacts/modelo100'
const SRC_CSV = path.join(OUT_DIR,'rules.meta.csv')
const OUT_JSON = path.join(OUT_DIR,'rules.meta.sla.json')
const OUT_CSV  = path.join(OUT_DIR,'rules.meta.sla.csv')
const NOW = new Date()

// SLA days by severity; if severity missing/unknown => "ignored"
const SLA_MAP = { critical: 14, high: 30, medium: 60, low: 90 }

function parseCSV(txt){
  const lines = txt.replace(/\r\n/g,'\n').replace(/\r/g,'\n').split('\n').filter(Boolean)
  if(!lines.length) return {header:[],rows:[]}
  const split=(line)=>{const o=[];let c='';let q=false;for(let i=0;i<line.length;i++){const ch=line[i];if(ch==='\"'){if(q&&line[i+1]==='\"'){c+='\"';i++}else{q=!q}}else if(ch===','&&!q){o.push(c);c=''}else{c+=ch}}o.push(c);return o}
  const header = split(lines[0]).map(h=>h.trim())
  const rows = lines.slice(1).map(split)
  return {header,rows}
}

const dateFieldCandidates = ['updated_at','last_updated','updated','modified','mtime','date_updated']
const severityFieldCandidates = ['severity','sev','level']
const idFieldCandidates = ['id','key','code','rule_id']

function findField(header, candidates){ return candidates.find(k=>header.includes(k)) || null }

function daysBetween(a,b){ return Math.floor(Math.abs(a-b)/(1000*60*60*24)) }

function parseDateLoose(s){
  if(!s) return null
  const t = String(s).trim()
  if(!t) return null
  const ms = Date.parse(t)
  if(!Number.isNaN(ms)) return new Date(ms)
  const m = t.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  return m ? new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00Z`) : null
}

async function main(){
  let csv; try{ csv = await fs.readFile(SRC_CSV,'utf8') }catch{
    console.error(JSON.stringify({ok:false,error:'missing_source',src:SRC_CSV}))
    process.exitCode=2; return
  }
  const {header,rows} = parseCSV(csv)
  const idCol  = findField(header, idFieldCandidates)
  const dateCol= findField(header, dateFieldCandidates)
  const sevCol = findField(header, severityFieldCandidates) // optional

  if(!idCol || !dateCol){
    console.error(JSON.stringify({
      ok:false, error:'schema_mismatch',
      required:{ id:idFieldCandidates, updated:dateFieldCandidates },
      optional:{ severity:severityFieldCandidates },
      header
    }))
    process.exitCode=3; return
  }

  const idx = Object.fromEntries(header.map((h,i)=>[h,i]))
  const recs = rows.map(r=>{
    const id = r[idx[idCol]]?.trim()
    const sevRaw = sevCol ? String(r[idx[sevCol]]||'').trim().toLowerCase() : ''
    const updated = parseDateLoose(r[idx[dateCol]])
    let age_days=null, threshold_days=null, status='unknown', status_next='unknown'
    if(updated){
      age_days = daysBetween(NOW, updated)
      if(sevRaw && SLA_MAP[sevRaw]!=null){
        threshold_days = SLA_MAP[sevRaw]
        status = age_days>threshold_days ? 'breach':'ok'
        status_next = status==='breach' ? 'overdue':'active'
      }else{
        status='ignored'
        status_next='ignored'
      }
    }
    return { id, severity: sevRaw || null, updated_at: updated?updated.toISOString():null, age_days, threshold_days, status, status_next }
  }).filter(x=>x.id)

  const breaches = recs.filter(r=>r.status==='breach').length
  const ignored  = recs.filter(r=>r.status==='ignored').length
  const unknown  = recs.filter(r=>r.status==='unknown').length
  const okCount  = recs.filter(r=>r.status==='ok').length

  const summary = {
    ok:true, total: recs.length,
    ok_count: okCount, breaches, ignored, unknown,
    policy: SLA_MAP, out:{json:OUT_JSON,csv:OUT_CSV}
  }

  const headerOut = ['id','severity','updated_at','age_days','threshold_days','status','status_next']
  const lines=[headerOut.join(','), ...recs.map(r=>headerOut.map(k=>{
    const v=r[k]; if(v==null) return ''
    const s=String(v); return s.includes(',')||s.includes('"')||s.includes('\n') ? `"${s.replace(/"/g,'""')}"`:s
  }).join(','))]

  await fs.mkdir(OUT_DIR,{recursive:true})
  await fs.writeFile(OUT_JSON, JSON.stringify({summary,rows:recs},null,2))
  await fs.writeFile(OUT_CSV, lines.join('\n'))

  const allow = process.env.SLA_ALLOW==='1'
  const exit = breaches>0 && !allow ? 1:0
  console.log(JSON.stringify({...summary, exit, allow_overrides:allow}))
  process.exitCode = exit
}
await main()
