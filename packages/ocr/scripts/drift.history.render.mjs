#!/usr/bin/env node
import fs from "node:fs"
import path from "node:path"
import url from "node:url"

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, "..")
const HISTORY_DIR = path.join(ROOT, "artifacts", "reports", "history")
const CFG_TOL = path.join(ROOT, "config", "tolerances.json")

function readJSON(p){return JSON.parse(fs.readFileSync(p,"utf8"))}
function listFields(){return fs.readdirSync(HISTORY_DIR).filter(f=>f.endsWith(".json")).map(f=>path.basename(f,".json"))}
function loadTolerance(field,tols){const t=tols?.[field];return typeof t==="number"&&t>=0?t:0}
function extents(arr){let min=Infinity,max=-Infinity;for(const v of arr){if(v<min)min=v;if(v>max)max=v}if(!isFinite(min))min=0;if(!isFinite(max))max=0;if(min===max){min-=1;max+=1}return{min,max}}

function buildSVG({data,tolerance,width=720,height=160,pad=12}){
  const values=data.map(d=>+d.value||0)
  const {min,max}=extents(values.concat([+tolerance,-tolerance]))
  const xStep=(width-pad*2)/Math.max(1,data.length-1)
  const yScale=v=>pad+(height-pad*2)*(1-(v-min)/(max-min))
  const xAt=i=>pad+i*xStep
  const bandTop=yScale(+tolerance),bandBot=yScale(-tolerance)
  const bandY=Math.min(bandTop,bandBot),bandH=Math.abs(bandTop-bandBot)
  const parts=[];data.forEach((d,i)=>{const x=xAt(i),y=yScale(+d.value||0);parts.push(i===0?`M ${x},${y}`:`L ${x},${y}`)})
  const pathD=parts.join(" ")
  const points=data.map((d,i)=>{const v=+d.value||0,oob=Math.abs(v)>+tolerance,x=xAt(i),y=yScale(v);return `<circle cx="${x}" cy="${y}" r="3" class="${oob?"pt-oob":"pt"}"><title>${d.label}: ${v}</title></circle>`}).join("")
  const zero=(min<=0&&max>=0)?`<line x1="${pad}" x2="${width-pad}" y1="${yScale(0)}" y2="${yScale(0)}" class="zero"/>`:""
  const ticks=[max,+tolerance,0,-tolerance,min].filter((v,i,a)=>a.indexOf(v)===i).map(v=>{const y=yScale(v);return `<g class="tick"><line x1="${pad}" x2="${width-pad}" y1="${y}" y2="${y}"/><text x="${width-pad}" y="${y-2}" text-anchor="end">${(+v.toFixed(3))}</text></g>`}).join("")
  return `
<svg viewBox="0 0 ${width} ${height}" class="spark" role="img" aria-label="history sparkline">
  <defs>
    <style>
      .spark{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial}
      .band{fill:currentColor;opacity:.08}
      .line{fill:none;stroke:currentColor;stroke-width:1.5}
      .pt{fill:currentColor;opacity:.85}
      .pt-oob{fill:#c00}
      .zero{stroke:#888;stroke-dasharray:2 3}
      .tick line{stroke:#eee}
      .tick text{font-size:10px;fill:#666}
      .toolbar{display:flex;gap:.75rem;align-items:center}
      .toolbar button{font:inherit;border:1px solid #ddd;background:#fafafa;padding:.35rem .6rem;border-radius:.5rem;cursor:pointer}
      .toolbar label{user-select:none}
    </style>
  </defs>
  <rect x="${pad}" y="${bandY}" width="${width-pad*2}" height="${bandH}" class="band"/>
  ${zero}
  <path d="${pathD}" class="line"/>
  ${points}
  ${ticks}
</svg>`
}

function fieldHTML({field,svg,count}){
  return `<!doctype html>
<html lang="en">
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${field} · History</title>
<link rel="stylesheet" href="../styles.css"/>
<body class="history-page">
  <header class="toolbar">
    <h1 style="margin:0;font-size:1.1rem">${field}</h1>
    <label style="display:inline-flex;gap:.5rem;align-items:center">
      <input id="last5" type="checkbox"/>
      <span>Last 5 runs</span>
    </label>
    <span id="seriesCount" style="color:#666;font-size:.9rem">Series: ${count}</span>
    <button id="downloadCsv" type="button">Download CSV</button>
  </header>
  <main id="sparkHost">
    ${svg}
  </main>
  <script>
    (function(){
      const payload=window.__DATA__
      const host=document.getElementById('sparkHost')
      const seriesCount=document.getElementById('seriesCount')
      const last5=document.getElementById('last5')
      const btn=document.getElementById('downloadCsv')

      function buildSVG(data,tol){
        const width=720,height=160,pad=12
        const vals=data.map(d=>+d.value||0).concat([+tol,-+tol])
        let min=Math.min.apply(null,vals),max=Math.max.apply(null,vals)
        if(!isFinite(min))min=0;if(!isFinite(max))max=0;if(min===max){min-=1;max+=1}
        const xStep=(width-pad*2)/Math.max(1,data.length-1)
        const yScale=v=>pad+(height-pad*2)*(1-(v-min)/(max-min))
        const xAt=i=>pad+i*xStep
        const bandTop=yScale(+tol),bandBot=yScale(-+tol)
        const bandY=Math.min(bandTop,bandBot),bandH=Math.abs(bandTop-bandBot)
        let d='';data.forEach((p,i)=>{const x=xAt(i),y=yScale(+p.value||0);d+=(i?'L':'M')+' '+x+','+y})
        const zero=(min<=0&&max>=0)?'<line x1="'+pad+'" x2="'+(width-pad)+'" y1="'+yScale(0)+'" y2="'+yScale(0)+'" class="zero"/>':''
        const pts=data.map((p,i)=>{const v=+p.value||0,oob=Math.abs(v)>+tol,x=xAt(i),y=yScale(v);return '<circle cx="'+x+'" cy="'+y+'" r="3" class="'+(oob?'pt-oob':'pt')+'"><title>'+p.label+': '+v+'</title></circle>'}).join('')
        const ticksVals=Array.from(new Set([max,+tol,0,-+tol,min]))
        const ticks=ticksVals.map(v=>{const y=yScale(v);return '<g class="tick"><line x1="'+pad+'" x2="'+(width-pad)+'" y1="'+y+'" y2="'+y+'"/><text x="'+(width-pad)+'" y="'+(y-2)+'" text-anchor="end">'+(+v.toFixed(3))+'</text></g>'}).join('')
        return '<svg viewBox="0 0 '+width+' '+height+'" class="spark" role="img" aria-label="history sparkline">'
          +'<rect x="'+pad+'" y="'+bandY+'" width="'+(width-pad*2)+'" height="'+bandH+'" class="band"/>'
          +zero
          +'<path d="'+d+'" class="line"/>'
          +pts
          +ticks
          +'</svg>'
      }

      function render(){
        const useLast5=!!last5.checked
        const series=useLast5?payload.series.slice(-5):payload.series
        seriesCount.textContent='Series: '+series.length
        host.innerHTML=buildSVG(series,payload.tolerance)
      }

      function toCsv(rows){
        const esc=s=>String(s).replace(/"/g,'""')
        const lines=[['label','value'].join(',')]
        for(const r of rows) lines.push(['"'+esc(r.label)+'"',String(r.value)].join(','))
        return lines.join('\\n')
      }

      function downloadCsv(){
        const useLast5=!!last5.checked
        const series=useLast5?payload.series.slice(-5):payload.series
        const csv=toCsv(series)
        const blob=new Blob([csv],{type:'text/csv;charset=utf-8'})
        const a=document.createElement('a')
        a.href=URL.createObjectURL(blob)
        a.download=payload.field+'-history.csv'
        document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000)
      }

      last5.addEventListener('change',render)
      btn.addEventListener('click',downloadCsv)
      render()
    })();
  </script>
</body>
</html>`
}

function run(){
  if(!fs.existsSync(HISTORY_DIR)){console.error("[history] missing history dir:",HISTORY_DIR);process.exit(0)}
  const tolerances=fs.existsSync(CFG_TOL)?readJSON(CFG_TOL):{}
  const fields=listFields()
  for(const field of fields){
    const jsonPath=path.join(HISTORY_DIR,`${field}.json`)
    const seriesRaw=readJSON(jsonPath)
    const series=(Array.isArray(seriesRaw)?seriesRaw:[]).map((p,i)=>{const label=(p.ts??p.run??String(i+1));const value=Number(p.value??0);return{label:String(label),value}})
    const tolerance=loadTolerance(field,tolerances)
    const svg=buildSVG({data:series,tolerance})
    const html=fieldHTML({field,svg,count:series.length})
    const outPath=path.join(HISTORY_DIR,`${field}.html`)
    const withData=html.replace("</script>","")
    const injection=`\n<script>window.__DATA__=${JSON.stringify({field:field,tolerance:tolerance,series:series})};</script>\n</script>`
    const finalHTML=withData.replace("</body>",`${injection}\n</body>`)
    fs.writeFileSync(outPath,finalHTML,"utf8")
    console.log("[history] wrote",path.relative(ROOT,outPath))
  }
}
run()
