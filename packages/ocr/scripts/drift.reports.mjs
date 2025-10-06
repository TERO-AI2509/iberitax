import { spawnSync } from "node:child_process"
import path from "path"
const root = path.resolve("packages/ocr")
function run(cmd, args, cwd = root) {
  const r = spawnSync(cmd, args, { cwd, stdio: "inherit" })
  if (r.status !== 0) process.exit(r.status || 1)
}
run("node", ["scripts/drift.dashboard.mjs"])
run("node", ["scripts/drift.history.render.mjs"])
run("node", ["scripts/drift.dashboard.linkify.mjs"])
