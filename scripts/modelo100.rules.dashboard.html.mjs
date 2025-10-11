#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'

const OUT_DIR = 'artifacts/modelo100'
const OUT_HTML = path.join(OUT_DIR, 'rules.dashboard.html')
const INSIGHTS = 'rules.insights.html'
const EXPLORER = 'rules.index.html'

function qpSyncScript(){
return `(()=>{
// read current query params
const getParams=()=>{const u=new URL(location.href);return{
  severity:u.searchParams.get('severity')||'',
  tag:u.searchParams.get('tag')||'',
  q:u.searchParams.get('q')||''
}}
const setParam=(k,v)=>{const u=new URL(location.href);if(v)u.searchParams.set(k,v);else u.searchParams.delete(k);history.replaceState(null,'',u)}
const buildUrl=(base,p)=>base+'?'+Object.entries(p).filter(([,v])=>v).map(([k,v])=>encodeURIComponent(k)+'='+encodeURIComponent(v)).join('&')

// set iframes src based on current qp
const insights=document.getElementById('insights')
const explorer=document.getElementById('explorer')
function refresh(){
  const p=getParams()
  insights.src = buildUrl('${INSIGHTS}', p)
  explorer.src = buildUrl('${EXPLORER}', p)
}
refresh()

// Listen for messages from iframes (when user clicks a bar or a tag)
window.addEventListener('message', (ev)=>{
  if(!ev || !ev.data || typeof ev.data!=='object') return
  const {severity, tag, q, action} = ev.data||{}
  if(action!=='set-filters') return
  if(typeof severity==='string') setParam('severity', severity)
  if(typeof tag==='string') setParam('tag', tag)
  if(typeof q==='string') setParam('q', q)
  refresh()
})

// Inject a tiny bridge into iframes after load so clicks can postMessage up.
function injectBridge(iframe){
  try{
    const w = iframe.contentWindow
    const d = w.document
    if(!w || !d) return
    // decorate all <a href="rules.index.html?..."> and tag links to postMessage
    d.querySelectorAll('a[href*="rules.index.html"]').forEach(a=>{
      a.addEventListener('click', (e)=>{
        try{
          const u=new URL(a.href, location.href)
          const payload={ action:'set-filters',
            severity:u.searchParams.get('severity')||'',
            tag:u.searchParams.get('tag')||'',
            q:u.searchParams.get('q')||''
          }
          parent.postMessage(payload, '*')
          e.preventDefault()
        }catch(_){}
      })
    })
  }catch(_){}
}
insights.addEventListener('load', ()=>injectBridge(insights))
explorer.addEventListener('load', ()=>injectBridge(explorer))

// Simple size observers so content fits
const ro = new ResizeObserver(()=>{/* no-op; if needed we could autosize */})
ro.observe(document.body)
})();`
}

async function main(){
  if(process.env.ENABLE_RULES_DASHBOARD!=='1'){
    console.log(JSON.stringify({ok:false,skipped:true,reason:'ENABLE_RULES_DASHBOARD!=1'}))
    return
  }
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Rules Dashboard — Modelo 100</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  :root{ --bg:#fff; --fg:#111; --muted:#666; --card:#f7f7f7 }
  body{ margin:0; background:var(--bg); color:var(--fg); font:14px/1.4 system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif }
  header{ padding:16px 20px; position:sticky; top:0; background:var(--bg); box-shadow:0 1px 0 rgba(0,0,0,.06); z-index:5 }
  h1{ margin:0; font-size:18px }
  .grid{ display:grid; gap:16px; padding:16px 20px; grid-template-columns:1fr; }
  @media(min-width:1200px){ .grid{ grid-template-columns:1.2fr 1fr } }
  iframe{ width:100%; border:0; background:#fff; border-radius:12px; box-shadow:0 1px 2px rgba(0,0,0,.06) }
  #insights{ height:680px }
  #explorer{ height:800px }
  .tip{ color:var(--muted); font-size:12px; margin-top:6px }
</style>
</head>
<body>
  <header><h1>Rules Dashboard</h1>
    <div class="tip">Filters in either panel (clicking bars/tags) will sync across both.</div>
  </header>
  <main class="grid">
    <iframe id="insights" title="Insights"></iframe>
    <iframe id="explorer" title="Explorer"></iframe>
  </main>
  <script>${qpSyncScript()}</script>
</body>
</html>`
  await fs.mkdir(OUT_DIR,{recursive:true})
  await fs.writeFile(OUT_HTML, html, 'utf8')
  console.log(JSON.stringify({ok:true,out:OUT_HTML}))
}
main().catch(e=>{console.error(e);process.exit(1)})
