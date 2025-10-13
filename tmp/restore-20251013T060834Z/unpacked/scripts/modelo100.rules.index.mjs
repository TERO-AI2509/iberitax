import fs from 'node:fs'
import path from 'node:path'

const OUT_DIR = 'artifacts/modelo100'
const OUT_MD  = path.join(OUT_DIR, 'rules.index.md')

const FILTER_TAGS = (process.env.RULE_TAG || '').split(',').map(s=>s.trim()).filter(Boolean)
const FILTER_SEVS = (process.env.RULE_SEVERITY || '').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean)
const VERBOSE = !!process.env.VERBOSE
function log(...a){ if(VERBOSE) console.log('[rules.index]', ...a) }
function slugify(s){ return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'') }

// ---------- helpers
function list(dir, re){ try { return fs.readdirSync(dir).filter(f=>re.test(f)).map(f=>path.join(dir,f)) } catch { return [] } }
function read(p){ try { return fs.readFileSync(p,'utf8') } catch { return null } }
function uniq(arr){ return [...new Set(arr)] }

// ---------- CSV parsing (small + robust)
function parseCSV(txt){
  if(!txt) return {rows:[], header:[]}
  const lines = txt.split(/\r?\n/).filter(l=>l.length)
  if(!lines.length) return {rows:[], header:[]}
  const header = splitCSVLine(lines[0]).map(h=>h.trim())
  const rows = []
  for(let i=1;i<lines.length;i++){
    const cells = splitCSVLine(lines[i])
    if(cells.length===1 && cells[0]==='') continue
    const obj = {}
    for(let j=0;j<header.length;j++) obj[header[j]] = (cells[j] ?? '').trim()
    rows.push(obj)
  }
  return {rows, header}
}
function splitCSVLine(line){
  const out = []; let cur = ''; let inQ=false
  for(let i=0;i<line.length;i++){
    const ch=line[i], nx=line[i+1]
    if(ch === '"'){
      if(inQ && nx === '"'){ cur+='"'; i++; continue }
      inQ = !inQ; continue
    }
    if(ch===',' && !inQ){ out.push(cur); cur=''; continue }
    cur += ch
  }
  out.push(cur); return out
}

// ---------- Column heuristics
const CAND_ID  = ['id','rule','rule_id','ruleid','code','key']
const CAND_SEV = ['severity','level','sev','priority','rank']
const CAND_TAG = ['tags','labels','group','groups','category','categories','section','topic','topics']
const CAND_MSG = ['message','title','brief','desc','description','summary','note','notes','reason','why','details','detail','explanation']

function pickCol(header, candidates){
  const lc = header.map(h=>h.toLowerCase())
  // exact
  for(const c of candidates){
    const i = lc.indexOf(c.toLowerCase()); if(i!==-1) return header[i]
  }
  // starts-with
  for(const c of candidates){
    const i = lc.findIndex(h=>h.startsWith(c.toLowerCase())); if(i!==-1) return header[i]
  }
  return null
}

function tokenizeTags(v){
  if(!v) return []
  return v.split(/[;,]/).flatMap(x=>x.split(/\s*\|\s*/)).map(s=>s.trim()).filter(Boolean)
}

function normalizeSeverity(v){
  const s = String(v||'').trim().toLowerCase()
  if(!s) return ''
  const map = { hi:'high', critical:'high', med:'medium', lo:'low', info:'info', warn:'warning' }
  if(map[s]) return map[s]
  if(s.startsWith('crit')) return 'high'
  if(s.startsWith('hi')) return 'high'
  if(s.startsWith('med')) return 'medium'
  if(s.startsWith('low')) return 'low'
  if(s.startsWith('warn')) return 'warning'
  if(['info','information'].includes(s)) return 'info'
  return s
}

function guessId(obj){
  // try explicit id-like cols first
  for(const k of Object.keys(obj)){
    const kl = k.toLowerCase()
    if(CAND_ID.includes(kl) || CAND_ID.some(c=>kl.startsWith(c))){
      const v = (obj[k]||'').trim()
      if(v) return v
    }
  }
  // otherwise look for CODE-ish tokens in any cell
  for(const k of Object.keys(obj)){
    const v = (obj[k]||'')
    const m = v.match(/\b[A-Za-z0-9][A-Za-z0-9._-]{2,}\b/)
    if(m) return m[0]
  }
  return ''
}

// ---------- Build from CSVs (cross-file join by id)
function parseFromCSVFiles(){
  const csvs = list(OUT_DIR, /\.csv$/i)
  const acc = new Map() // id -> {id,severity,tags[],message}
  for(const f of csvs){
    const txt = read(f); if(!txt) continue
    const {rows, header} = parseCSV(txt)
    if(!rows.length) continue
    const colId  = pickCol(header, CAND_ID)
    const colSev = pickCol(header, CAND_SEV)
    const colTag = pickCol(header, CAND_TAG)
    const colMsg = pickCol(header, CAND_MSG)
    log(`csv ${path.basename(f)} → id=${colId||'-'} sev=${colSev||'-'} tags=${colTag||'-'} msg=${colMsg||'-'}`)
    for(const r of rows){
      const id = (colId ? r[colId] : guessId(r)).trim()
      if(!id) continue
      const prev = acc.get(id) || { id, severity:'', tags:[], message:'' }
      const sev = normalizeSeverity(colSev ? r[colSev] : prev.severity)
      // prefer non-empty, and prefer higher severities when merging
      prev.severity = chooseSeverity(prev.severity, sev)
      const tags = uniq(prev.tags.concat(tokenizeTags(colTag ? r[colTag] : '')))
      prev.tags = tags
      const msgCandidate = (colMsg ? r[colMsg] : '')
      if(msgCandidate && (!prev.message || msgCandidate.length > prev.message.length)) prev.message = msgCandidate
      acc.set(id, prev)
    }
  }
  return Array.from(acc.values())
}

function chooseSeverity(a,b){
  const order = ['','info','low','medium','warning','high','critical']
  const ai = order.indexOf(String(a||'').toLowerCase())
  const bi = order.indexOf(String(b||'').toLowerCase())
  return (bi>ai ? b : a)
}

// ---------- Markdown parsing (skip self)
function parseMDTables(md){
  const rules=[]
  if(!md) return rules
  const lines = md.split(/\r?\n/)
  const headerIdx = lines.findIndex(l=>/\|\s*id\s*\|/i.test(l) && /\|\s*severity\s*\|/i.test(l))
  if(headerIdx===-1) return rules
  for(let i=headerIdx+1;i<lines.length;i++){
    const row = lines[i]
    if(!/^\s*\|/.test(row)) break
    if(/^\s*\|\s*:?-/.test(row)) continue // divider
    const cells = row.split('|').map(c=>c.trim())
    if(cells.length<6) continue
    const id=cells[1], sev=cells[2], tags=(cells[3]||'').split(',').map(s=>s.trim()).filter(Boolean), msg=cells[4]||''
    if(id) rules.push({id, severity:normalizeSeverity(sev), tags, message:msg})
  }
  return rules
}

function parseMDHeadings(md){
  const rules=[]
  if(!md) return rules
  const blocks = md.split(/\n(?=###\s+)/g)
  for(const b of blocks){
    const mHead = b.match(/^###\s+([A-Za-z0-9._-]+)(?:\s*[—:-]\s*(.+))?/m)
    if(!mHead) continue
    const id = mHead[1].trim()
    let message = (mHead[2]||'').trim()
    const mSev = b.match(/^\s*Severity\s*[:|-]\s*([A-Za-z0-9_-]+)/im)
    const severity = normalizeSeverity(mSev ? mSev[1].trim() : '')
    const mTags = b.match(/^\s*Tags?\s*[:|-]\s*([^\n]+)/im)
    const tags = mTags ? mTags[1].split(',').map(s=>s.trim()).filter(Boolean) : []
    if(!message){
      const mMsg = b.match(/^\s*Message\s*[:|-]\s*(.+)$/im)
      if(mMsg) message = mMsg[1].trim()
    }
    if(id) rules.push({ id, message, severity, tags })
  }
  return rules
}

function parseAllSources(){
  const fromCSV = parseFromCSVFiles()
  if(fromCSV.length) log('parsed from csv:', fromCSV.length)
  const mdfiles = list(OUT_DIR, /\.md$/i).filter(p=>path.basename(p)!=='rules.index.md')
  const tried = []
  let fromMD = []
  for(const f of mdfiles){
    const txt = read(f); if(!txt) continue
    tried.push(path.basename(f))
    const t = parseMDTables(txt)
    const h = parseMDHeadings(txt)
    const got = [...t, ...h]
    if(got.length) log(`parsed ${got.length} from ${path.basename(f)}`)
    fromMD.push(...got)
  }
  // merge: CSV has priority, fill gaps from MD
  const map = new Map(fromCSV.map(r=>[r.id, r]))
  for(const r of fromMD){
    const prev = map.get(r.id) || {id:r.id, severity:'', tags:[], message:''}
    prev.severity = chooseSeverity(prev.severity, r.severity)
    prev.tags = uniq(prev.tags.concat(r.tags || []))
    if(r.message && (!prev.message || r.message.length > prev.message.length)) prev.message = r.message
    map.set(r.id, prev)
  }
  return { rules: Array.from(map.values()), tried }
}

function filterRules(rules){
  return rules.filter(r=>{
    if(FILTER_SEVS.length && !FILTER_SEVS.includes(String(r.severity||'').toLowerCase())) return false
    if(FILTER_TAGS.length){
      const tags = (r.tags||[]).map(t=>t.toLowerCase())
      const hit = FILTER_TAGS.some(t=>tags.includes(t.toLowerCase()))
      if(!hit) return false
    }
    return true
  })
}

function summarizeBySeverity(rules){
  const map = new Map()
  for(const r of rules){
    const k = String(r.severity||'').trim() || 'unspecified'
    map.set(k, (map.get(k)||0)+1)
  }
  return Array.from(map.entries()).sort((a,b)=>a[0].localeCompare(b[0]))
}

function links(r){
  const ruleLink = `[details](rules.rollup.md#${r.id})`
  const tagLinks = (r.tags||[]).map(t=>`[${t}](rules.groups.rollup.md#${slugify(t)})`).join(', ')
  return `${ruleLink}${tagLinks ? ' · '+tagLinks : ''}`
}

function renderMD(all, shown, tried){
  const summary = summarizeBySeverity(shown)
  let md = ''
  md += `# Modelo 100 — Rules Index\n\n`
  md += `Generated: ${new Date().toISOString()}\n\n`
  if(tried?.length) md += `_Parsed from_: ${tried.join(', ')} and CSV files\n\n`
  if(FILTER_SEVS.length || FILTER_TAGS.length){
    md += `**Filters:**`
    if(FILTER_SEVS.length) md += ` Severity = ${FILTER_SEVS.join(', ')}`
    if(FILTER_SEVS.length && FILTER_TAGS.length) md += `;`
    if(FILTER_TAGS.length) md += ` Tags = ${FILTER_TAGS.join(', ')}`
    md += `\n\n`
  }
  md += `## Summary (Counts by Severity)\n\n`
  md += `| Severity | Count |\n|---|---:|\n`
  for(const [sev,count] of summary) md += `| ${sev} | ${count} |\n`
  if(summary.length===0) md += `| (no matches) | 0 |\n`
  md += `\n## Rules\n\n`
  md += `| ID | Severity | Tags | Message | Links |\n|---|---|---|---|---|\n`
  for(const r of shown){
    md += `| ${r.id} | ${r.severity||''} | ${(r.tags||[]).join(', ')} | ${(r.message||'').replace(/\|/g,'\\|')} | ${links(r)} |\n`
  }
  if(shown.length===0) md += `| — | — | — | — | — |\n`
  md += `\nSee also: [rules.rollup.md](rules.rollup.md) · [rules.groups.rollup.md](rules.groups.rollup.md)\n`
  return md
}

const { rules: parsed, tried } = parseAllSources()
if(!parsed.length){
  console.error('[rules.index] No rules found. Checked MD:', tried?.join(', ') || '(none)', 'and CSV files.')
  process.exit(2)
}
const shown = filterRules(parsed)
const out = renderMD(parsed, shown, tried)
fs.writeFileSync(OUT_MD, out, 'utf8')
console.log(JSON.stringify({ok:true, total:parsed.length, shown:shown.length, out:OUT_MD}, null, 2))
