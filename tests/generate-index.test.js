const fs = require('fs');
const path = require('path');

test('generate-index lists all html files in unlinked/', () => {
  const dir = path.join(__dirname, '..', 'unlinked');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && f !== 'index.html').sort();
  const out = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  files.forEach(f => expect(out).toContain(f));
});
