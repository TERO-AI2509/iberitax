import {promises as fs} from 'node:fs'
import {execSync} from 'node:child_process'
import path from 'node:path'

async function slackNotify(url, summary){
  if(!url) return;
  const ok = !!summary.ok;
  const emoji = ok ? ":white_check_mark:" : ":x:";
  const title = ok ? "Backup offsite: Success" : "Backup offsite: Failure";
  const fields = [];
  if(summary.name) fields.push({type:"mrkdwn",text:"*Artifact:* " + summary.name});
  if(summary.mode) fields.push({type:"mrkdwn",text:"*Mode:* " + summary.mode});
  if(summary.ts)   fields.push({type:"mrkdwn",text:"*Time:* " + summary.ts});
  if(summary.offsite && summary.offsite.index) fields.push({type:"mrkdwn",text:"*Index:* <"+summary.offsite.index+"|open>"});
  if(summary.error) fields.push({type:"mrkdwn",text:"*Error:* " + String(summary.error).slice(0,400)});
  const payload = {
    text: (ok?"SUCCESS":"FAIL") + " · " + (summary.name||"") + " · " + (summary.mode||"") ,
    blocks: [
      {type:"header", text:{type:"plain_text", text: emoji+"  "+title }},
      {type:"section", fields: fields.length?fields:[{type:"mrkdwn",text:"No details"}]}
    ]
  };
  try { await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body: JSON.stringify(payload)}); } catch(e) {}
}
const DRY = process.env.DRY_RUN === '1'
const ENABLE = process.env.OFFSITE_ENABLE === '1'
const MODE = (process.env.OFFSITE_MODE || 's3').toLowerCase()
const S3_URI = process.env.OFFSITE_S3_URI || ''
const GH_TAG = process.env.OFFSITE_GH_TAG || ''
const WEBHOOK = process.env.NOTIFY_WEBHOOK || ''
const REQ_VERIFY = process.env.REQUIRE_VERIFY !== '0'
const nowIso = new Date().toISOString().replace(/[:.]/g,'').replace('Z','Z')
const baseDir = process.cwd()
const outDir = path.join(baseDir,'artifacts','backups')

function sh(cmd) {
  if (DRY || !ENABLE) return {code:0,stdout:'',stderr:'',cmd}
  execSync(cmd,{stdio:'inherit'})
  return {code:0}
}

function urlJoin(a,b){return a.replace(/\/+$/,'')+'/'+b.replace(/^\/+/,'')}

function pickLatest(files){return files.sort((a,b)=>b.localeCompare(a))[0]}

async function fileExists(f){try{await fs.stat(f);return true}catch{return false}}

async function main(){
  const files = await fs.readdir(outDir)
  const zips = files.filter(f=>f.endsWith('.zip')).map(f=>path.join(outDir,f)).sort()
  if (!zips.length) throw new Error('No backup zip found')
  const zip = zips[zips.length-1]
  const sha = zip+'.sha256'
  const meta = zip.replace(/\.zip$/,'.meta.json')
  if (!(await fileExists(sha))) throw new Error('Missing .sha256 for '+zip)
  if (!(await fileExists(meta))) throw new Error('Missing .meta.json for '+zip)

  const verifyHtml = path.join(outDir,'verify.html')
  const retentionHtml = path.join(outDir,'retention.html')
  if (REQ_VERIFY){
    for (const f of [verifyHtml,retentionHtml]){
      if (!(await fileExists(f))) throw new Error('Missing required report: '+f)
      const size = (await fs.stat(f)).size
      if (size < 100) throw new Error('Report too small: '+f)
    }
  }

  const name = path.basename(zip).replace(/\.zip$/,'')
  const indexHtml = path.join(outDir,'index.html')
  const ts = nowIso
  let offsite = {mode:MODE, objects:[], index:''}

  if (MODE === 's3'){
    if (!S3_URI) throw new Error('OFFSITE_S3_URI required for s3 mode')
    const prefix = urlJoin(S3_URI,name)
    const destZip = urlJoin(prefix, path.basename(zip))
    const destSha = urlJoin(prefix, path.basename(sha))
    const destMeta = urlJoin(prefix, path.basename(meta))
    sh(`aws s3 cp "${zip}" "${destZip}"`)
    sh(`aws s3 cp "${sha}" "${destSha}"`)
    sh(`aws s3 cp "${meta}" "${destMeta}"`)
    offsite.objects = [destZip,destSha,destMeta]
    const idx = [
      '<!doctype html>',
      '<meta charset="utf-8">',
      `<title>Backups — ${name}</title>`,
      `<h1>Backups — ${name}</h1>`,
      `<p>Uploaded: ${ts}</p>`,
      '<ul>',
      `<li><a href="${destZip}">Zip</a></li>`,
      `<li><a href="${destSha}">SHA256</a></li>`,
      `<li><a href="${destMeta}">Meta</a></li>`,
      '</ul>',
      '<h2>Latest Reports</h2>',
      '<ul>',
      `<li><a href="verify.html">Verify Report</a></li>`,
      `<li><a href="retention.html">Retention Report</a></li>`,
      '</ul>'
    ].join('\n')
    await fs.writeFile(indexHtml, idx)
    try{ sh(`aws s3 cp "${indexHtml}" "${urlJoin(prefix,'index.html')}" --content-type text/html`) }catch{}
    offsite.index = urlJoin(prefix,'index.html')
  } else if (MODE === 'gh'){
    if (!GH_TAG) throw new Error('OFFSITE_GH_TAG required for gh mode')
    try{ sh(`gh release view "${GH_TAG}" >/dev/null 2>&1 || gh release create "${GH_TAG}" -t "${GH_TAG}" -n "Automated backup ${ts}"`) }catch{}
    sh(`gh release upload "${GH_TAG}" "${zip}" --clobber`)
    sh(`gh release upload "${GH_TAG}" "${sha}" --clobber`)
    sh(`gh release upload "${GH_TAG}" "${meta}" --clobber`)
    offsite.objects = [path.basename(zip),path.basename(sha),path.basename(meta)]
    const idx = [
      '<!doctype html>',
      '<meta charset="utf-8">',
      `<title>Backups — ${name}</title>`,
      `<h1>Backups — ${name}</h1>`,
      `<p>Uploaded: ${ts} to GitHub Release ${GH_TAG}</p>`,
      '<ul>',
      `<li>Zip: GitHub Release asset</li>`,
      `<li>SHA256: GitHub Release asset</li>`,
      `<li>Meta: GitHub Release asset</li>`,
      '</ul>',
      '<h2>Latest Reports</h2>',
      '<ul>',
      `<li><a href="verify.html">Verify Report</a></li>`,
      `<li><a href="retention.html">Retention Report</a></li>`,
      '</ul>'
    ].join('\n')
    await fs.writeFile(indexHtml, idx)
  } else {
    throw new Error('Unsupported OFFSITE_MODE: '+MODE)
  }

  const summary = {ok:true, name, ts, mode:MODE, offsite}
  const payload = JSON.stringify(summary)
  await slackNotify(WEBHOOK, summary);
console.log(payload)
  }
}

main().catch(async err=>{
  const msg = JSON.stringify({ok:false,error:String(err.message||err)})
  console.error(msg)
  if (process.env.NOTIFY_WEBHOOK){
    try{ execSync(`curl -sS -X POST -H 'Content-Type: application/json' --data '${msg.replace(/'/g,"'\\''")}' "${process.env.NOTIFY_WEBHOOK}"`,{stdio:'inherit'}) }catch{}
  }
  process.exit(1)
})
