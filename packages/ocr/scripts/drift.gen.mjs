import { execSync } from "child_process"
async function main(){
  execSync("node scripts/drift.run.mjs", { stdio: "inherit" })
  const m = await import("./drift.dashboard.mjs")
  const fn = m.generateDriftDashboard || m.renderDriftDashboard || m.buildDriftDashboard || m.default || m.main
  if (typeof fn === "function") await fn()
}
main().catch(e=>{ console.error(e); process.exit(1) })
