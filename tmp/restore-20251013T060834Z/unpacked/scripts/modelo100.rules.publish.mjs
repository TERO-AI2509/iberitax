#!/usr/bin/env node
import fs from 'node:fs/promises'
import fssync from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ENABLED = process.env.ENABLE_RULES_PUBLISH === '1'
if (!ENABLED) {
  console.error('[publish] Set ENABLE_RULES_PUBLISH=1 to run.')
  process.exit(1)
}

const ROOT = process.cwd()
const OUT_DIR = path.join(ROOT, 'artifacts', 'modelo100')
const DIST_DIR = path.join(OUT_DIR, 'dist')
const SRC_FILES = [
  path.join(OUT_DIR, 'rules.dashboard.html'),
  path.join(OUT_DIR, 'rules.index.html'),
  path.join(OUT_DIR, 'rules.insights.html'),
]
const HISTORY_DIR = path.join(OUT_DIR, 'history')
const ZIP_PATH = path.join(OUT_DIR, 'rules-dashboard-bundle.zip')

const ts = new Date()
const VERSION = [
  ts.getUTCFullYear(),
  String(ts.getUTCMonth()+1).padStart(2,'0'),
  String(ts.getUTCDate()).padStart(2,'0'),
  'T',
  String(ts.getUTCHours()).padStart(2,'0'),
  String(ts.getUTCMinutes()).padStart(2,'0'),
  String(ts.getUTCSeconds()).padStart(2,'0'),
  'Z'
].join('')

async function rimraf(p) {
  await fs.rm(p, { recursive: true, force: true }).catch(()=>{})
}
async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true })
}
function collapseWhitespace(html) {
  let s = html.replace(/>\s+</g, '><')
  s = s.replace(/[ \t]{2,}/g, ' ')
  s = s.replace(/\s+\n/g, '\n').replace(/\n\s+/g, '\n')
  return s
}
function injectStamp(html, name) {
  const meta = `<meta name="x-build" content="${VERSION}"><meta name="x-name" content="${name}">`
  if (html.includes('</head>')) return html.replace('</head>', `${meta}</head>`)
  return `${meta}${html}`
}
function rewriteRelative(html) {
  let s = html
  s = s.replace(/(["'])\/?artifacts\/modelo100\/(rules\.(?:dashboard|index|insights)\.html)\1/g, '"$2"')
  s = s.replace(/(["'])\/?artifacts\/modelo100\/history\//g, '"history/')
  s = s.replace(/(["'])\.\/history\//g, '"history/')
  s = s.replace(/(["'])\/?history\//g, '"history/')
  s = s.replace(/(["'])https?:\/\/[^"']+\/(rules\.(?:dashboard|index|insights)\.html)\1/g, '"$2"')
  return s
}
async function copyHistory() {
  if (!fssync.existsSync(HISTORY_DIR)) return
  const target = path.join(DIST_DIR, 'history')
  await ensureDir(target)
  const entries = await fs.readdir(HISTORY_DIR, { withFileTypes: true })
  for (const e of entries) {
    if (e.isFile() && e.name.endsWith('.json')) {
      await fs.copyFile(path.join(HISTORY_DIR, e.name), path.join(target, e.name))
    }
  }
}
async function writeLanding() {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Modelo 100 · Rules Bundle</title><style>body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;background:#0b1020;color:#e7ecff;margin:0}main{max-width:720px;width:100%;padding:32px;border-radius:20px;background:linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,.02));box-shadow:0 10px 30px rgba(0,0,0,.45)}h1{font-size:24px;margin:0 0 8px}p{opacity:.8;margin:0 0 20px}section{display:grid;gap:12px;grid-template-columns:1fr}a{display:block;text-decoration:none;padding:14px 16px;border-radius:14px;background:#121a38;color:#e7ecff;text-align:center;font-weight:600;border:1px solid rgba(231,236,255,.12)}a:focus,a:hover{outline:none;border-color:#7aa2ff;background:#16214a}</style></head><body><main><h1>Modelo 100 · Rules Bundle</h1><p>Build <strong>${VERSION}</strong></p><section><a href="rules.dashboard.html">Open Dashboard</a><a href="rules.index.html">Open Explorer</a><a href="rules.insights.html">Open Insights</a></section></main></body></html>`
  await fs.writeFile(path.join(DIST_DIR, 'index.html'), html, 'utf8')
}
async function processHtml(srcPath) {
  const name = path.basename(srcPath)
  const dest = path.join(DIST_DIR, name)
  let html = await fs.readFile(srcPath, 'utf8')
  html = rewriteRelative(html)
  html = injectStamp(html, name)
  if (process.env.MINIFY_HTML === '1') {
    html = collapseWhitespace(html)
  }
  await fs.writeFile(dest, html, 'utf8')
}
function crc32(buf) {
  let c = ~0 >>> 0
  for (let i = 0; i < buf.length; i++) {
    c = (c >>> 8) ^ CRC_TABLE[(c ^ buf[i]) & 0xff]
  }
  return (~c) >>> 0
}
const CRC_TABLE = (() => {
  let c, table = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    c = n
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
    }
    table[n] = c >>> 0
  }
  return table
})()
function dosDateTime(date) {
  const d = new Date(date)
  const dosTime = ((d.getHours() << 11) | (d.getMinutes() << 5) | (Math.floor(d.getSeconds()/2))) & 0xFFFF
  const dosDate = (((d.getFullYear()-1980) << 9) | ((d.getMonth()+1) << 5) | d.getDate()) & 0xFFFF
  return { dosDate, dosTime }
}
function toBytesLE(num, len) {
  const b = Buffer.alloc(len)
  b.writeUIntLE(num, 0, len)
  return b
}
async function listFilesRecursive(dir, rel='') {
  const out = []
  const ents = await fs.readdir(dir, { withFileTypes: true })
  for (const e of ents) {
    const abs = path.join(dir, e.name)
    const relPath = path.join(rel, e.name).replace(/\\/g,'/')
    if (e.isDirectory()) {
      out.push(...await listFilesRecursive(abs, relPath))
    } else {
      out.push({ abs, rel: relPath })
    }
  }
  return out
}
async function zipStore(directory, zipFile) {
  const files = await listFilesRecursive(directory)
  const now = new Date()
  const { dosDate, dosTime } = dosDateTime(now)
  const fileRecords = []
  const parts = []
  let offset = 0
  for (const f of files) {
    const data = await fs.readFile(f.abs)
    const crc = crc32(data)
    const nameBuf = Buffer.from(f.rel, 'utf8')
    const localHeader = Buffer.concat([
      Buffer.from('504b0304','hex'),
      toBytesLE(20,2),
      toBytesLE(0,2),
      toBytesLE(0,2),
      toBytesLE(dosTime,2),
      toBytesLE(dosDate,2),
      toBytesLE(crc>>>0,4),
      toBytesLE(data.length,4),
      toBytesLE(data.length,4),
      toBytesLE(nameBuf.length,2),
      toBytesLE(0,2),
      nameBuf
    ])
    parts.push(localHeader, data)
    fileRecords.push({
      rel: f.rel, crc, size: data.length, offset
    })
    offset += localHeader.length + data.length
  }
  const centralParts = []
  let centralSize = 0
  for (const rec of fileRecords) {
    const nameBuf = Buffer.from(rec.rel, 'utf8')
    const central = Buffer.concat([
      Buffer.from('504b0102','hex'),
      toBytesLE(20,2),
      toBytesLE(20,2),
      toBytesLE(0,2),
      toBytesLE(0,2),
      toBytesLE(dosTime,2),
      toBytesLE(dosDate,2),
      toBytesLE(rec.crc>>>0,4),
      toBytesLE(rec.size,4),
      toBytesLE(rec.size,4),
      toBytesLE(nameBuf.length,2),
      toBytesLE(0,2),
      toBytesLE(0,2),
      toBytesLE(0,2),
      toBytesLE(0,2),
      toBytesLE(0,4),
      toBytesLE(rec.offset,4),
      nameBuf
    ])
    centralParts.push(central)
    centralSize += central.length
  }
  const centralStart = offset
  const centralBuf = Buffer.concat(centralParts)
  const end = Buffer.concat([
    Buffer.from('504b0506','hex'),
    toBytesLE(0,2),
    toBytesLE(0,2),
    toBytesLE(fileRecords.length,2),
    toBytesLE(fileRecords.length,2),
    toBytesLE(centralSize,4),
    toBytesLE(centralStart,4),
    toBytesLE(0,2)
  ])
  const zipBuf = Buffer.concat([...parts, centralBuf, end])
  await fs.writeFile(zipFile, zipBuf)
}

async function main() {
  console.log('[publish] start')
  await ensureDir(OUT_DIR)
  await rimraf(DIST_DIR)
  await ensureDir(DIST_DIR)

  for (const f of SRC_FILES) {
    const exists = fssync.existsSync(f)
    if (!exists) {
      console.error(`[publish] Missing: ${f}`)
      process.exit(2)
    }
  }

  await Promise.all(SRC_FILES.map(processHtml))
  await copyHistory()
  await writeLanding()
  await zipStore(DIST_DIR, ZIP_PATH)
  const histCount = fssync.existsSync(path.join(DIST_DIR,'history'))
    ? (await fs.readdir(path.join(DIST_DIR,'history'))).filter(n=>n.endsWith('.json')).length
    : 0
  console.log(JSON.stringify({
    ok: true,
    version: VERSION,
    dist: path.relative(ROOT, DIST_DIR),
    zip: path.relative(ROOT, ZIP_PATH),
    files: (await listFilesRecursive(DIST_DIR)).map(f=>f.rel),
    historyFiles: histCount
  }, null, 2))
  console.log('[publish] done')
}

main().catch(err => {
  console.error('[publish] error', err)
  process.exit(1)
})
