const fs = require('fs');
const path = require('path');

// Scans the unlinked/ directory for .html files and writes unlinked/index.html
const root = path.join(__dirname, '..');
const unlinkedDir = path.join(root, 'unlinked');
const outFile = path.join(unlinkedDir, 'index.html');

function generate() {
  if (!fs.existsSync(unlinkedDir)) {
    console.error('unlinked directory not found:', unlinkedDir);
    process.exit(1);
  }

  const files = fs.readdirSync(unlinkedDir)
    .filter(f => f.endsWith('.html') && f !== 'index.html')
    .sort();

  const items = files.map(f => {
    const title = f.replace(/[-_.]/g, ' ').replace(/\.html$/, '');
    return `    <li><a href="${f}">${title}</a></li>`;
  }).join('\n');

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Unlinked index</title>
  <link rel="stylesheet" href="../assets/css/site.css">
</head>
<body>
  <button id="sidebarToggle" class="mobile-toggle" aria-label="Open navigation" aria-expanded="false">☰</button>
  <aside id="sidebar" class="sidebar" aria-label="Site navigation"></aside>
  <div id="overlay" class="overlay" tabindex="-1"></div>
  <main id="content" class="content">
    <header><h1>Unlinked pages</h1></header>
    <section>
      <ul>
${items}
      </ul>
    </section>
  </main>
  <script src="../assets/js/site.js" defer></script>
</body>
</html>`;

  fs.writeFileSync(outFile, html, 'utf8');
  console.log('Wrote', outFile);
}

if (require && require.main === module) {
  generate();
}

module.exports = { generate };
