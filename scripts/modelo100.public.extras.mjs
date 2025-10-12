#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]

function today(){ const d=new Date(); const y=d.getUTCFullYear(); const m=String(d.getUTCMonth()+1).padStart(2,'0'); const dd=String(d.getUTCDate()).padStart(2,'0'); return `${y}${m}${dd}` }
function shortsha(){ try{ return execSync('git rev-parse --short HEAD').toString().trim() }catch{ return 'unknown' } }
function readJsonSync(p){ try{ return JSON.parse(require('node:fs').readFileSync(p,'utf8')) }catch{ return null } }
async function exists(p){ try{ await fs.access(p); return true }catch{ return false } }

async function modeVersioning(root){
  const exportPath = path.join(root,'sla.export.json')
  if(!(await exists(exportPath))) throw new Error('missing sla.export.json')
  const vdir = path.join(root, `v-${today()}-${shortsha()}`)
  await fs.mkdir(vdir,{ recursive:true })
  const names = ['index.html','style.css','rules.insights.html','rules.dashboard.html','sla.owners.html','sla.export.json']
  for(const n of names){
    const src = path.join(root,n)
    const dst = path.join(vdir,n)
    const buf = await fs.readFile(src)
    await fs.writeFile(dst,buf)
  }
  const idxPath = path.join(root,'index.json')
  const current = await exists(idxPath) ? JSON.parse(await fs.readFile(idxPath,'utf8')) : { latest:null, history:[] }
  const vname = path.basename(vdir)
  if(!current.history.includes(vname)) current.history.unshift(vname)
  current.latest = vname
  await fs.writeFile(idxPath, JSON.stringify(current,null,2))
  return { ok:true, version_dir:vdir, index:idxPath }
}

async function modeDiscoverability(root){
  const base = ''
  const files = ['index.html','rules.insights.html','rules.dashboard.html','sla.owners.html','sla.export.json','index.json']
  const vers = (await fs.readdir(root)).filter(x=>x.startsWith('v-'))
  const urls = [
    ...files.map(f=>`${base}/${f}`),
    ...vers.flatMap(v=>['index.html','rules.insights.html','rules.dashboard.html','sla.owners.html','sla.export.json'].map(f=>`${base}/${v}/${f}`))
  ]
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` + urls.map(u=>`<url><loc>${u.replace(/^\/+/,'/')}</loc></url>`).join('') + `</urlset>`
  await fs.writeFile(path.join(root,'sitemap.xml'), sitemap)
  const robots = `User-agent: *\nAllow: /\nSitemap: /sitemap.xml\n`
  await fs.writeFile(path.join(root,'robots.txt'), robots)
  return { ok:true, wrote:['sitemap.xml','robots.txt'] }
}

async function modeBadges(root){
  const exp = JSON.parse(await fs.readFile(path.join(root,'sla.export.json'),'utf8'))
  const owners = exp.payload.summary.owners || 0
  const alerts = exp.payload.summary.alerts || 0
  const escalations = exp.payload.summary.escalations || 0
  const bdir = path.join(root,'badges')
  await fs.mkdir(bdir,{ recursive:true })
  await fs.writeFile(path.join(bdir,'owners.json'), JSON.stringify({schemaVersion:1,label:'owners',message:String(owners)},null,2))
  await fs.writeFile(path.join(bdir,'alerts.json'), JSON.stringify({schemaVersion:1,label:'alerts',message:String(alerts)},null,2))
  await fs.writeFile(path.join(bdir,'escalations.json'), JSON.stringify({schemaVersion:1,label:'escalations',message:String(escalations)},null,2))
  return { ok:true, dir:bdir }
}

async function main(){
  const APPLY = process.env.APPLY === '1'
  const MODE = process.env.MODE || 'all'
  const repo = process.cwd()
  const root = path.join(repo,'artifacts','modelo100','public')
  if(!APPLY){
    console.log(JSON.stringify({ ok:true, apply:false, mode:MODE, root }, null, 2))
    return
  }
  let res = {}
  if(MODE==='versioning' || MODE==='all'){ res.versioning = await modeVersioning(root) }
  if(MODE==='discoverability' || MODE==='all'){ res.discoverability = await modeDiscoverability(root) }
  if(MODE==='badges' || MODE==='all'){ res.badges = await modeBadges(root) }
  console.log(JSON.stringify({ ok:true, mode:MODE, root, res }, null, 2))
}

if(isMain){ main() }
