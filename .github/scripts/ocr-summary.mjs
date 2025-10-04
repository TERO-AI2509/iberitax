import fs from 'fs';
import path from 'path';

function findSummaryFiles(artifactsDir) {
  const candidates = [
    path.join(artifactsDir, 'packages', 'ocr', 'artifacts', 'validation_summary.md'),
    path.join(artifactsDir, 'validation_summary.md'),
    path.join(artifactsDir, 'packages', 'ocr', 'artifacts', 'validation_summary.csv'),
    path.join(artifactsDir, 'validation_summary.csv'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function csvToMarkdownTable(csv) {
  const lines = csv.trim().split(/\r?\n/).map(l => l.split(','));
  if (!lines.length) return '';
  const head = lines[0];
  const body = lines.slice(1);
  const mk = [];
  mk.push(`| ${head.join(' | ')} |`);
  mk.push(`| ${head.map(() => '---').join(' | ')} |`);
  for (const row of body) mk.push(`| ${row.join(' | ')} |`);
  return mk.join('\n');
}

function buildBody({ title, tableMarkdown, runUrl }) {
  const header = `### ${title}`;
  const link = `[Open ocr-artifacts](${runUrl})`;
  return `${header}

${tableMarkdown}

${link}
`;
}

function readArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i += 2) {
    const k = args[i];
    const v = args[i + 1];
    if (k && v) {
      if (k === '--artifacts-dir') out.artifactsDir = v;
      if (k === '--run-id') out.runId = v;
      if (k === '--repo') out.repo = v;
      if (k === '--pr-number') out.pr = parseInt(v, 10);
    }
  }
  return out;
}

const { artifactsDir, runId, repo, pr } = readArgs();
if (!artifactsDir || !runId || !repo || !pr) {
  console.error('Missing required args');
  process.exit(2);
}

const summaryPath = findSummaryFiles(artifactsDir);
if (!summaryPath) {
  console.log('No validation_summary found; creating no-op payload');
  fs.writeFileSync(path.join('.github', 'scripts', 'ocr-summary.payload.json'), JSON.stringify({ pr, body: `### OCR Validation Summary\n\n_No validation summary artifacts found for this run._\n[Open ocr-artifacts](https://github.com/${repo}/actions/runs/${runId})\n` }));
  process.exit(0);
}

let tableMarkdown = '';
if (summaryPath.endsWith('.md')) {
  tableMarkdown = fs.readFileSync(summaryPath, 'utf8');
} else {
  const csv = fs.readFileSync(summaryPath, 'utf8');
  tableMarkdown = csvToMarkdownTable(csv);
}

const body = buildBody({
  title: 'OCR Validation Summary',
  tableMarkdown,
  runUrl: `https://github.com/${repo}/actions/runs/${runId}`,
});

fs.writeFileSync(path.join('.github', 'scripts', 'ocr-summary.payload.json'), JSON.stringify({ pr, body }));
