import fs from "fs"
import path from "path"

export type MapRow={section:string;casilla_from?:number;casilla_to?:number;aeat_label:string;questionnaire_key:string;notes?:string}
export type Mapping={rows:MapRow[]}

/** CSV helpers (quoted fields supported) */
function parseCSV(text:string){
  const lines=text.split(/\r?\n/).filter(l=>l.trim().length>0)
  if(lines.length===0) return []
  const headers=splitCSVLine(lines[0])
  return lines.slice(1).map(line=>{
    const cells=splitCSVLine(line)
    const obj:any={}
    headers.forEach((h,i)=>{obj[h]=cells[i]??""})
    return obj
  })
}
function splitCSVLine(line:string){
  const out:string[]=[]
  let cur="", inQ=false
  for(let i=0;i<line.length;i++){
    const ch=line[i]
    if(ch==='\"'){
      if(inQ && line[i+1]==='\"'){cur+='\"';i++} else {inQ=!inQ}
    }else if(ch===',' && !inQ){
      out.push(cur);cur=""
    }else{
      cur+=ch
    }
  }
  out.push(cur)
  return out.map(s=>s.trim())
}
function toInt(x:string|undefined){if(!x) return undefined;const n=Number(x);return Number.isFinite(n)?n:undefined}

/** Find mapping file from common locations (dev/prod safe) */
function findMappingFile(){
  const cwd=process.cwd()                                 // usually apps/web
  const candidates=[
    path.join(cwd,"mapping","modelo100-to-questionnaire.csv"),
    path.join(cwd,"../web/mapping","modelo100-to-questionnaire.csv"),
    path.join(cwd,"../../apps/web/mapping","modelo100-to-questionnaire.csv"),
    path.join(cwd,"apps/web/mapping","modelo100-to-questionnaire.csv"),
  ]
  for(const p of candidates){ if(fs.existsSync(p)) return p }
  throw new Error("modelo100-to-questionnaire.csv not found in known locations")
}

export function loadMapping():Mapping{
  const p=findMappingFile()
  const raw=fs.readFileSync(p,"utf8")
  const arr=parseCSV(raw)
  const rows:MapRow[]=arr.map((r:any)=>({
    section:r.section||"",
    casilla_from:toInt(r.casilla_from),
    casilla_to:toInt(r.casilla_to),
    aeat_label:r.aeat_label||"",
    questionnaire_key:r.questionnaire_key||"",
    notes:r.notes||""
  }))
  return {rows}
}

export function mapCasillaToKeys(c:number){
  const m=loadMapping()
  const keys=new Set<string>()
  for(const row of m.rows){
    const a=row.casilla_from??row.casilla_to
    const b=row.casilla_to??row.casilla_from
    if(a&&b){ if(c>=a&&c<=b && row.questionnaire_key) keys.add(row.questionnaire_key) }
    else if(a&&row.questionnaire_key){ if(c===a) keys.add(row.questionnaire_key) }
  }
  return Array.from(keys)
}

export function mapKeyToCasillas(qkey:string){
  const m=loadMapping()
  const out:number[]=[]
  for(const row of m.rows){
    if(!row.questionnaire_key) continue
    if(row.questionnaire_key.startsWith(qkey)){
      const a=row.casilla_from??row.casilla_to
      const b=row.casilla_to??row.casilla_from
      if(a&&b){ for(let i=a;i<=b;i++) out.push(i) }
      else if(a){ out.push(a) }
    }
  }
  return Array.from(new Set(out)).sort((x,y)=>x-y)
}
