// Optimise every image under assets/media/ in-place: max width 2400px, JPEG q82.
// Skips files already <500KB. Idempotent — safe to re-run.
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve('assets/media');
const MAX_WIDTH = 2400;
const QUALITY = 82;
const SKIP_BELOW_BYTES = 500 * 1024;

const exts = new Set(['.jpg', '.jpeg', '.png']);

async function* walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else yield p;
  }
}

let totalIn = 0, totalOut = 0, processed = 0, skipped = 0;
for await (const file of walk(ROOT)) {
  const ext = path.extname(file).toLowerCase();
  if (!exts.has(ext)) continue;
  const stat = await fs.stat(file);
  if (stat.size < SKIP_BELOW_BYTES) { skipped++; continue; }

  totalIn += stat.size;
  const tmp = file + '.tmp';
  try {
    // Read the source into a buffer first so the file handle is closed
    // before we try to overwrite it (Windows holds locks otherwise).
    const buf = await fs.readFile(file);
    const out = await sharp(buf, { failOn: 'none' })
      .rotate()                            // honour EXIF orientation
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: QUALITY, mozjpeg: true })
      .toBuffer();
    // Write directly over the original — avoids rename which is lock-prone on Windows.
    await fs.writeFile(file, out);
    const newStat = await fs.stat(file);
    totalOut += newStat.size;
    processed++;
    process.stdout.write(`${path.relative(ROOT, file)}: ${(stat.size/1e6).toFixed(1)}M -> ${(newStat.size/1e6).toFixed(1)}M\n`);
  } catch (err) {
    try { await fs.unlink(tmp); } catch {}
    process.stderr.write(`SKIP ${file}: ${err.message}\n`);
  }
}

console.log(`\n${processed} processed, ${skipped} skipped (small).`);
console.log(`Total: ${(totalIn/1e6).toFixed(1)}M -> ${(totalOut/1e6).toFixed(1)}M (${((1 - totalOut/totalIn)*100).toFixed(0)}% reduction)`);
