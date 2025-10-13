import {promises as fs} from 'node:fs'
import path from 'node:path'
import {execSync} from 'node:child_process'
const outDir = path.join(process.cwd(),'artifacts','backups')
const files = await fs.readdir(outDir)
const zips = files.filter(f=>f.endsWith('.zip')).sort()
if (!zips.length) { console.error('No zip'); process.exit(1) }
const zip = zips[zips.length-1]
const zipPath = path.join(outDir,zip)
const shaPath = zipPath+'.sha256'
const metaPath = zipPath.replace(/\.zip$/,'.meta.json')
const stat = await fs.stat(zipPath)
let sha=''; try{ sha=(await fs.readFile(shaPath,'utf8')).trim().split(/\s+/)[0] }catch{ sha='' }
let commit=''; try{ commit=execSync('git rev-parse --short HEAD',{stdio:['ignore','pipe','ignore']}).toString().trim() }catch{}
const meta = {
  name: path.basename(zipPath),
  size: stat.size,
  sha256: sha || null,
  commit: commit || null,
  created_at: new Date().toISOString(),
  verify_report: 'verify.html',
  retention_report: 'retention.html'
}
await fs.writeFile(metaPath, JSON.stringify(meta,null,2))
console.log(metaPath)
