import fs from 'fs'
const must = [
  'VERCEL',
  'NEXT_PUBLIC_SITE_URL',
  'TERO_DB_URL',
  'TERO_PRISMA_URL',
  'TERO_LAWYER_API_BASE',
  'TERO_LAWYER_POST_SECRET'
]
const lines = fs.readFileSync('.env.vercel','utf8').split('\n')
const env = Object.fromEntries(lines.filter(l => /^[A-Z0-9_]+=/.test(l)).map(l => l.split('=')))
const missing = must.filter(k => !(k in env) || !String(env[k]).trim())
if (missing.length) {
  console.error('❌ Missing in .env.vercel:', missing.join(', '))
  process.exit(1)
}
console.log('✅ Env OK')
