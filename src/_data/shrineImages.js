import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectsDir = path.join(__dirname, '..', 'projects');

export default async function () {
  const files = (await fs.readdir(projectsDir)).filter(f => f.endsWith('.md'));
  const all = [];
  for (const f of files) {
    const raw = await fs.readFile(path.join(projectsDir, f), 'utf8');
    const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
    if (!fmMatch) continue;
    const fm = fmMatch[1];
    const titleMatch = fm.match(/^title:\s*(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : f;
    // Two-pass regex: first try blocks that have a caption, then blocks without.
    // A single optional-group regex fails here because the lazy quantifier
    // before the optional group causes it to skip the caption match.
    const withCaption = /\{\s*src:\s*"([^"]+)"[^}]*caption:\s*"([^"]+)"[^}]*\}/g;
    const withoutCaption = /\{\s*src:\s*"([^"]+)"[^}]*\}/g;
    const seen = new Set();
    let m;
    while ((m = withCaption.exec(fm)) !== null) {
      seen.add(m[1]);
      all.push({ src: m[1], caption: m[2], series: title });
    }
    while ((m = withoutCaption.exec(fm)) !== null) {
      if (!seen.has(m[1])) {
        all.push({ src: m[1], caption: '', series: title });
      }
    }
  }
  return all;
}
