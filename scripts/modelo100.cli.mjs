#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]
const repo = process.cwd()
const P = (...xs)=>path.join(repo, ...xs)

const cmds = {
  export: ['node', [P('scripts/modelo100.sla.export.mjs')]],
  bundle: ['node', [P('scripts/modelo100.public.bundle.mjs')]],
  extras: ['node', [P('scripts/modelo100.public.extras.mjs')]],
  'report-csv': ['node', [P('scripts/modelo100.report.csv.mjs')]],
  'public-api': ['node', [P('scripts/modelo100.public.api.mjs')]],
}

function runOne([bin,args,envExtra={}]){
  return new Promise((res,rej)=>{
    const env = { ...process.env, ...envExtra }
    const cp = spawn(bin, args, { stdio:'inherit', env })
    cp.on('exit', code => code===0 ? res() : rej(new Error(`exit ${code}`)))
  })
}

async function main(){
  const sub = process.argv[2] || 'all'
  const APPLY = process.env.APPLY === '1'
  const MINIFY_HTML = process.env.MINIFY_HTML || ''
  const MODE = process.env.MODE || 'all'

  if(sub==='all'){
    const plan = [
      ['node',[P('scripts/modelo100.sla.export.mjs')],{}],
      ['node',[P('scripts/modelo100.public.bundle.mjs')],{ MINIFY_HTML }],
      ['node',[P('scripts/modelo100.public.extras.mjs')],{ MODE }],
      ['node',[P('scripts/modelo100.report.csv.mjs')],{}],
      ['node',[P('scripts/modelo100.public.api.mjs')],{}],
    ]
    if(!APPLY){
      console.log(JSON.stringify({ ok:true, apply:false, plan: plan.map(x=>x[1][0].split('/').slice(-1)[0]) },null,2))
      process.exit(0)
    }
    for(const step of plan) await runOne(step)
    console.log(JSON.stringify({ ok:true, ran:'all' },null,2))
    process.exit(0)
  }

  const cmd = cmds[sub]
  if(!cmd){
    console.error(JSON.stringify({ ok:false, error:`unknown subcommand: ${sub}` },null,2))
    process.exit(2)
  }

  if(!APPLY){
    console.log(JSON.stringify({ ok:true, apply:false, will: sub },null,2))
    process.exit(0)
  }

  await runOne([...cmd,{}])
  console.log(JSON.stringify({ ok:true, ran: sub },null,2))
}
if(isMain){ main() }
