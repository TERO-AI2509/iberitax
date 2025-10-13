const TZ = "Europe/Madrid";
function pad(n){return String(n).padStart(2,"0")}
function normalizeDate(input){
  if(!input||typeof input!=="string") return {iso:null,precision:"unknown"}
  const s=input.trim()
  let m
  m=s.match(/^(\d{4})-(\d{2})-(\d{2})$/);if(m){return {iso:`${m[1]}-${m[2]}-${m[3]}`,precision:"day"}}
  m=s.match(/^(\d{4})-(\d{2})$/);if(m){return {iso:`${m[1]}-${m[2]}-01`,precision:"month"}}
  m=s.match(/^(\d{4})$/);if(m){return {iso:`${m[1]}-01-01`,precision:"year"}}
  return {iso:null,precision:"unknown"}
}
function firstOf(period){
  return normalizeDate(period)
}
function buildRefs(refs){
  const arr=Array.isArray(refs)?refs:refs? [refs]:[]
  return arr.map(r=>({
    url:String(r.url||r.href||""),
    id:r.id??null,
    title:r.title??null,
    archive_url:r.archive_url??null,
    note:r.note??null
  })).filter(x=>x.url)
}
export function computeProvenance(inputs){
  const dates=inputs?.dates||{}
  const sources=inputs?.sources||[]
  const q=[]
  const pub=firstOf(dates.published_at||"")
  const upd=firstOf(dates.updated_at||"")
  const effFrom=firstOf(dates.effective_from||"")
  const effTo=firstOf(dates.effective_to||"")
  const retro=firstOf(dates.retroactive_to||"")
  if(pub.precision==="unknown") q.push("published_at unclear; confirm with official source")
  if(effFrom.precision==="unknown") q.push("effective_from unclear; confirm with official source")
  const off=buildRefs(inputs?.official_refs||[])
  const sup=buildRefs(inputs?.supporting_refs||[])
  const discrep=listDiscrepancies(inputs?.alt_date_claims||[])
  return {
    published_at: pub.iso,
    updated_at: upd.iso,
    effective_from: effFrom.iso,
    effective_to: effTo.iso,
    retroactive_to: retro.iso,
    official_refs: off,
    supporting_refs: sup,
    discrepancy: discrep,
    questions: q,
    date_precision: {
      published_at: pub.precision,
      updated_at: upd.precision,
      effective_from: effFrom.precision,
      effective_to: effTo.precision,
      retroactive_to: retro.precision
    }
  }
}
function listDiscrepancies(claims){
  const items=Array.isArray(claims)?claims:[]
  const mapped=items.map(c=>{
    const pv=firstOf(c.published_at||"")
    const uv=firstOf(c.updated_at||"")
    const evf=firstOf(c.effective_from||"")
    const evt=firstOf(c.effective_to||"")
    const rv=firstOf(c.retroactive_to||"")
    return {
      source:String(c.source||""),
      values:{
        published_at: pv.iso,
        updated_at: uv.iso,
        effective_from: evf.iso,
        effective_to: evt.iso,
        retroactive_to: rv.iso
      }
    }
  })
  const has = mapped.some(x=>Object.values(x.values).some(v=>v!==null))
  return { has_discrepancy: has, sources: mapped }
}
