#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
const OUT_DIR='artifacts/modelo100'
const HTML=path.join(OUT_DIR,'rules.insights.html')
const ESJ =path.join(OUT_DIR,'owners.escalation.json')

const block = (data)=>`
<section id="escalation-by-owner" style="margin:1rem 0;padding:1rem;border:1px solid #ddd;border-radius:8px">
  <h2>Escalation by Owner</h2>
  ${data ? `<div><strong>Owners:</strong> ${data.summary.owners}, <strong>Breaches:</strong> ${data.summary.totals.breaches}, <strong>Pages:</strong> ${data.summary.totals.pages}, <strong>Warns:</strong> ${data.summary.totals.warns}</div>` : `<div><em>No escalation data.</em></div>`}
  ${data && data.owners && data.owners.length ? `
  <details style="margin-top:.5rem" open><summary>Owners needing attention</summary>
    <table><thead><tr><th>owner</th><th>breaches</th><th>pages</th><th>warns</th><th>total</th></tr></thead>
      <tbody>
        ${data.owners.filter(o=>o.breaches||o.pages||o.warns).map(o=>`<tr><td>${o.owner}</td><td>${o.breaches}</td><td>${o.pages}</td><td>${o.warns}</td><td>${o.total}</td></tr>`).join('')}
      </tbody>
    </table>
  </details>` : ``}
</section>`

async function main(){
  const html = await fs.readFile(HTML,'utf8').catch(()=>null)
  if(!html){ console.log(JSON.stringify({ok:false,error:'missing_insights_html',file:HTML})); process.exitCode=2; return }
  const data = await fs.readFile(ESJ,'utf8').then(s=>JSON.parse(s)).catch(()=>null)
  const b = block(data)
  const out = html.includes('</body>') ? html.replace('</body>', b+'\n</body>') : (html+'\n'+b+'\n')
  await fs.writeFile(HTML,out)
  console.log(JSON.stringify({ok:true,out:HTML,inserted:true}))
}
await main()
