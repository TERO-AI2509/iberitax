import fs from "node:fs"; import path from "node:path"; import url from "node:url";
const __dirname=path.dirname(url.fileURLToPath(import.meta.url));
const REPORT=path.join(__dirname,"..","artifacts","reports","drift-dashboard.html");

let html=fs.readFileSync(REPORT,"utf8");
const m=html.match(/const\s+data\s*=\s*(\[[\s\S]*?\])\s*<\/script>/);
if(!m){ console.error("no embedded data[] found"); process.exit(1); }
const data=JSON.parse(m[1]);

const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]));
const rows=data.map(d=>{
  const field=esc(d.field), delta=Number(d.delta)||0, tol=Number(d.tolerance)||0;
  const vol=esc(d.vol||""), pass=(!!d.pass)?"OK":"Fail";
  const chip= (!!d.pass) ? "#208a2f" : "#c43c3c";
  const overlay= d.overlayRel ? `<img src="${esc(d.overlayRel)}" height="40" style="border-radius:6px"/>` : "";
  return `<tr class="row">
    <td data-field="${field}">${field}</td>
    <td class="delta">${delta}</td>
    <td>${tol}</td>
    <td>${vol}</td>
    <td><span class="status" style="background:${chip}">${pass}</span></td>
    <td>${overlay}</td>
  </tr>`;
}).join("");

html = html.replace(/<tbody[^>]*>\s*<\/tbody>/, `<tbody>${rows}</tbody>`);
fs.writeFileSync(REPORT, html, "utf8");
console.log("[dashboard] hydrated rows into drift-dashboard.html");
