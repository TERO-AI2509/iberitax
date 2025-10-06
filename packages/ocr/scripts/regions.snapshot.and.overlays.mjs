import { spawn } from "node:child_process"
import path from "path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, "../../..")

function run(cmd, args, cwd){
  return new Promise((res,rej)=>{
    const p=spawn(cmd,args,{cwd,stdio:"inherit",shell:false})
    p.on("exit",code=>code===0?res():rej(new Error(String(code))))
  })
}

await run("node",[path.resolve(__dirname,"regions.snapshot.mjs")],repoRoot)
await run("node",[path.resolve(__dirname,"overlay.render.mjs")],repoRoot)
