import fs from "node:fs";
const logPath = process.argv[2] || "artifacts/modelo100/lawyer.review.log.jsonl";
const raw = fs.readFileSync(logPath,"utf8").split("\n").filter(Boolean).map(l=>JSON.parse(l));
const req = ["ts","id","actor","action","state","locale","message"];
const actionSet = new Set(["seed","picked_up","answered","closed"]);
const stateSet = new Set(["open","picked_up","answered","closed"]);
for (let i=0;i<raw.length;i++){
  const e = raw[i];
  for (const k of req) if (!(k in e)) { console.error("missing",k,"at",i); process.exit(1); }
  if (!actionSet.has(e.action)) { console.error("bad action",e.action,"at",i); process.exit(1); }
  if (!stateSet.has(e.state)) { console.error("bad state",e.state,"at",i); process.exit(1); }
  if (e.locale !== "es-ES") { console.error("bad locale",e.locale,"at",i); process.exit(1); }
  if (!/^\d{4}-\d{2}-\d{2}T/.test(e.ts)) { console.error("bad ts",e.ts,"at",i); process.exit(1); }
}
console.log(JSON.stringify({ok:true,count:raw.length}));
