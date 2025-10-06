import { readFileSync, writeFileSync, existsSync, rmSync } from "fs";
import { resolve } from "path";
import { execSync } from "child_process";

const pkgRoot = process.cwd();
const artifacts = resolve(pkgRoot, "artifacts");
const reportPath = resolve(artifacts, "schema_crosscheck_report.md");
const inventoryPath = resolve(artifacts, "schema_field_inventory.md");

function read(p){ return readFileSync(p,"utf8"); }
function write(file,text){ writeFileSync(file,text); return file; }
function norm(s){ return String(s).toLowerCase().replace(/[^a-z0-9]/g,""); }

function diffText(a,b){ try{ return execSync(`diff -u --label golden --label current "${a}" "${b}"`,{stdio:["ignore","pipe","pipe"]}).toString(); }catch(e){ return e.stdout?.toString()||e.message||"diff unavailable"; } }
function assertCsvEqual(goldenPath,currentPath){
  const golden=read(goldenPath).trim(), current=read(currentPath).trim();
  if(golden!==current){ write(resolve(artifacts,"validation_diff_csv.md"),["# Regression Diff (csv)","","```diff",diffText(goldenPath,currentPath),"```",""].join("\n")); console.error("✖ CSV mismatch. See artifacts/validation_diff_csv.md"); process.exitCode=1; }
  else { try{ rmSync(resolve(artifacts,"validation_diff_csv.md")); }catch{}; console.log("✔ CSV matches golden"); }
}
function parseMdTable(md){
  const lines=md.split(/\r?\n/), table=lines.filter(l=>/^\|.*\|$/.test(l));
  if(table.length<2) return {header:[],rows:[]};
  const split=l=>l.slice(1,-1).split("|").map(c=>c.trim().replace(/\s+/g," "));
  return { header:split(table[0]), rows:table.slice(2).map(split) };
}
function assertMdTableEqual(goldenPath,currentPath){
  const g=parseMdTable(read(goldenPath)), c=parseMdTable(read(currentPath));
  if(JSON.stringify(g)!==JSON.stringify(c)){ write(resolve(artifacts,"validation_diff_md.md"),["# Regression Diff (md-table, semantic)","","Golden parsed:","```json",JSON.stringify(g,null,2),"```","","Current parsed:","```json",JSON.stringify(c,null,2),"```",""].join("\n")); console.error("✖ MD table mismatch. See artifacts/validation_diff_md.md"); process.exitCode=1; }
  else { try{ rmSync(resolve(artifacts,"validation_diff_md.md")); }catch{}; console.log("✔ MD table matches golden (semantic)"); }
}
function ensureCurrentSummaries(){
  console.log("→ Building package…"); execSync("pnpm -F @iberitax/ocr build",{stdio:"inherit"});
  console.log("→ Generating current validation summaries…"); execSync("node scripts/build-validation-summary.mjs",{stdio:"inherit"});
  if(!existsSync(resolve(artifacts,"validation_current.csv"))||!existsSync(resolve(artifacts,"validation_current.md"))){ console.error("✖ Missing current summaries in artifacts/"); process.exit(1); }
}

function locateSchema(){
  const candidates=[
    resolve(pkgRoot,"schemas","modelo100.schema.json"),
    resolve(pkgRoot,"src","schemas","modelo100.schema.json"),
    resolve(pkgRoot,"contracts","modelo100.schema.json"),
    process.env.MODELO100_SCHEMA && resolve(process.cwd(),process.env.MODELO100_SCHEMA),
  ].filter(Boolean);
  for(const p of candidates) if(existsSync(p)) return p;
  try{ const out=execSync('git ls-files "**/modelo100.schema.json"',{stdio:["ignore","pipe","ignore"]}).toString().trim(); const hit=out.split(/\r?\n/).filter(Boolean)[0]; if(hit) return resolve(pkgRoot,"..","..",hit);}catch{}
  try{ const out=execSync('find . -name modelo100.schema.json 2>/dev/null',{stdio:["ignore","pipe","ignore"]}).toString().trim(); const hit=out.split(/\r?\n/).filter(Boolean)[0]; if(hit) return resolve(pkgRoot,hit);}catch{}
  return null;
}
function normalizeType(t){ if(Array.isArray(t))return t.flatMap(normalizeType); if(typeof t==="string")return [t.toLowerCase()]; if(t&&typeof t==="object"){ for(const k of ["anyOf","oneOf","allOf"]) if(Array.isArray(t[k])) return t[k].flatMap(s=>normalizeType(s.type)); } return []; }
function resolveJsonPointer(root,pointer){
  if(!pointer?.startsWith("#/")) return null;
  const parts=pointer.slice(2).split("/").map(p=>p.replace(/~1/g,"/").replace(/~0/g,"~"));
  let node=root; for (const k of parts){ if(node&&Object.prototype.hasOwnProperty.call(node,k)) node=node[k]; else return null; } return node;
}
function buildInventory(schema){
  const items=[]; const visit=(node,path=[])=>{
    if(!node||typeof node!=="object") return;
    if(node.$ref&&typeof node.$ref==="string"&&node.$ref.startsWith("#/")){ const target=resolveJsonPointer(schema,node.$ref); if(target) visit(target,[...path,"$ref",node.$ref]); }
    if(node.properties&&typeof node.properties==="object"){
      for(const key of Object.keys(node.properties)){
        const child=node.properties[key];
        items.push({key, path:[...path,"properties",key], types:normalizeType(child.type)});
        visit(child,[...path,"properties",key]);
      }
    }
    if(node.items) visit(node.items,[...path,"items"]);
    for(const k of ["allOf","anyOf","oneOf"]) if(Array.isArray(node[k])) node[k].forEach((sub,i)=>visit(sub,[...path,k,String(i)]));
    for(const c of ["definitions","$defs"]) if(node[c]&&typeof node[c]==="object") for(const k of Object.keys(node[c])) visit(node[c][k],[...path,c,k]);
  }; visit(schema,[]); return items;
}

const DEFAULT_ALIASES={
  year:["year","tax_year","period_year","ejercicio","anio","año","taxYear","periodYear"],
  tax_id:["tax_id","nif","dni","nie","vat_id","doc_id","identificador","nif_declarante","nifDeclarante","taxpayerId"],
  base:["base","base_imponible","base_liquidable","baseLiquidable","baseImponible","base_liq","baseLiq"],
  tax:["tax","cuota","cuota_integra","cuotaIntegra","importe_cuota","cuota_total","cuotaTotal"],
  due:["due","a_ingresar","resultado","resultado_liquidacion","importe_a_ingresar","total_a_pagar","a_ingresar_total","aIngresarTotal","resultadoLiquidacion"]
};
let USER_ALIASES={}; try{ if(process.env.MODELO100_ALIASES) USER_ALIASES=JSON.parse(process.env.MODELO100_ALIASES);}catch{}
const ALIASES=Object.fromEntries(Object.keys(DEFAULT_ALIASES).map(k=>[k,[...new Set([...(DEFAULT_ALIASES[k]||[]),...((USER_ALIASES[k]||[]))])]]));

const EXPECTED_TYPES={ year:["integer","number"], tax_id:["string"], base:["number","integer"], tax:["number","integer"], due:["number","integer"] };
const DERIVED_NUMERIC_KEYS=new Set(["amounteur","totaleur","nete ur","grosseur","taxeur","dueeur"].map(norm));

function crossValidateSchema(csvHeaderCols, schema, schemaPathResolved){
  const notes=[]; let failed=false;

  const inv=buildInventory(schema);
  write(inventoryPath,["# Schema Field Inventory",`Schema: \`${schemaPathResolved}\``,"",...inv.map(it=>`- \`${it.key}\` — path: ${it.path.join(".")} — type: ${it.types.join("|")||"(none)"}`),""].join("\n"));

  const expectedCols=["year","tax_id","base","tax","due"];
  const missingCols=expectedCols.filter(c=>!csvHeaderCols.includes(c));
  if(missingCols.length){ failed=true; notes.push(`- Missing expected CSV columns: ${missingCols.join(", ")}`); }

  const byKey=new Map();
  for(const it of inv){ const k=norm(it.key); if(!byKey.has(k)) byKey.set(k,[]); byKey.get(k).push(it); }

  const aliasHit=(col)=>{
    const aliasSet=new Set((ALIASES[col]||[]).map(norm));
    for(const a of aliasSet){ const hits=byKey.get(a); if(hits&&hits.length) return {alias:a, entry:hits[0], aliases:aliasSet}; }
    return null;
  };

  for(const col of expectedCols){
    let match=aliasHit(col);
    if(!match){
      if(["base","tax","due"].includes(col)){
        const anyNumeric = inv.find(it => DERIVED_NUMERIC_KEYS.has(norm(it.key)) && (it.types.length===0 || it.types.includes("number") || it.types.includes("integer")));
        if(anyNumeric){ notes.push(`- ✅ \`${col}\` treated as derived via \`${anyNumeric.key}\` at ${anyNumeric.path.join(".")}`); continue; }
      }
      failed=true;
      const aliasSet=new Set((ALIASES[col]||[]).map(norm));
      notes.push(`- Field \`${col}\` not found (aliases tried: ${[...aliasSet].join(", ")})`);
      continue;
    }

    const types=match.entry.types;
    const okType = !types.length || EXPECTED_TYPES[col].some(t=>types.includes(t));
    if(!okType){ failed=true; notes.push(`- Field \`${col}\` type mismatch at ${match.entry.path.join(".")}: expected ${EXPECTED_TYPES[col].join("|")}, found ${types.join("|")||"(none)"}`); }
    else { notes.push(`- ✅ \`${col}\` matched alias \`${match.alias}\` → \`${match.entry.key}\` at ${match.entry.path.join(".")}` + (types.length?` — type: ${types.join("|")}`:"")); }
  }

  const body=[`# Schema Cross-Check — Modelo 100`,"",`Schema file: ${schemaPathResolved ? "`"+schemaPathResolved+"`" : "_not found_"}`,"",`CSV header columns:`,"","```",csvHeaderCols.join(","),"```","",notes.join("\n"),""].join("\n");
  write(reportPath, body);
  return !failed;
}

(function main(){
  ensureCurrentSummaries();

  const goldenCsv=resolve(artifacts,"validation_summary.csv");
  const goldenMd=resolve(artifacts,"validation_summary.md");
  const currentCsv=resolve(artifacts,"validation_current.csv");
  const currentMd=resolve(artifacts,"validation_current.md");
  if(!existsSync(goldenCsv)||!existsSync(goldenMd)){ console.error("✖ Golden baselines not found."); process.exit(1); }

  assertCsvEqual(goldenCsv,currentCsv);
  assertMdTableEqual(goldenMd,currentMd);

  const schemaPath=locateSchema();
  if(!schemaPath){ write(reportPath,"# Schema Cross-Check — Modelo 100\n\n_Schema file could not be located._\n"); console.error("✖ Schema cross-check error: modelo100.schema.json not found (report written)."); process.exit(1); }

  try{
    const headerLine=read(currentCsv).split(/\r?\n/)[0].trim();
    const cols=headerLine.split(",").map(s=>s.trim()).filter(Boolean);
    const schema=JSON.parse(readFileSync(schemaPath,"utf8"));
    const relevantCols=cols.filter(c=>["year","tax_id","base","tax","due"].includes(c));
    const ok=crossValidateSchema(relevantCols,schema,schemaPath);
    if(!ok){ console.error("✖ Schema cross-check failed. See artifacts/schema_crosscheck_report.md"); process.exitCode=1; }
    else { console.log("✔ Schema cross-check passed"); try{ rmSync(reportPath); }catch{}; try{ rmSync(inventoryPath); }catch{}; }
  }catch(e){
    write(reportPath,`# Schema Cross-Check — Error\n\n\`\`\`\n${String(e && e.stack || e)}\n\`\`\`\n`);
    console.error("✖ Schema cross-check error (report written).");
    process.exit(1);
  }

  const finalStatus = (process.exitCode && process.exitCode !== 0) ? "FAIL" : "PASS";
  try { execSync("node scripts/post-history.mjs", { stdio: "inherit", env: { ...process.env, HIST_STATUS: finalStatus } }); } catch {}
  if(process.exitCode&&process.exitCode!==0) process.exit(process.exitCode); else console.log("✅ Regression check passed and history updated.");
})();
