import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createReadStream, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const APPLY = process.env.APPLY === '1';
const ROOT = process.cwd();
const OUTDIR = process.env.BACKUP_OUTDIR || 'artifacts/backups';
const TS = new Date().toISOString().replace(/[-:]/g,'').replace(/\..*/,'') + 'Z';
const ZIP = join(ROOT, OUTDIR, `backup-${TS}.zip`);
const SHA = `${ZIP}.sha256`;
const META = `${ZIP}.meta.json`;

const INCLUDE = [
  'RUNBOOK.md',
  'docs',
  'artifacts/modelo100',
  'repo-manifest.txt',
  'owners.csv',
  'owners.escalation.csv',
  'owners.escalation.json',
  'owners.html',
  'rules.*',
  'schemas',
  'openapi',
  'report',
  'notify',
  'sla.*'
];

function gitInfo() {
  try {
    const sha = execFileSync('git',['rev-parse','--short','HEAD'],{encoding:'utf8'}).trim();
    const branch = execFileSync('git',['rev-parse','--abbrev-ref','HEAD'],{encoding:'utf8'}).trim();
    return { sha, branch };
  } catch { return { sha:null, branch:null }; }
}

function sha256(file) {
  const h = createHash('sha256');
  return new Promise((resolve,reject)=>{
    const s = createReadStream(file);
    s.on('error', reject);
    s.on('data', d => h.update(d));
    s.on('end', ()=> resolve(h.digest('hex')));
  });
}

async function main() {
  const plan = INCLUDE.filter(p => existsSync(join(ROOT,p)));
  const out = { apply: APPLY, outdir: OUTDIR, zip: ZIP, include: plan, ts: TS, git: gitInfo() };

  if (!APPLY) {
    console.log(JSON.stringify(out,null,2));
    return;
  }

  if (!existsSync(OUTDIR)) mkdirSync(OUTDIR, { recursive: true });

  const zipArgs = ['-r','-q', ZIP, ...plan, '-x',
    '**/.git/**','**/node_modules/**','**/.next/**','**/dist/**','**/.DS_Store'
  ];
  execFileSync('zip', zipArgs, { stdio:'inherit' });

  const digest = await sha256(ZIP);
  writeFileSync(SHA, `${digest}  ${ZIP}\n`);

  writeFileSync(META, JSON.stringify(out,null,2));
  console.log(JSON.stringify({ ok:true, zip: ZIP, sha256: digest, meta: META }, null, 2));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(e => { console.error(e); process.exit(1); });
}
