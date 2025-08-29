const fs = require('fs');
const path = require('path');

test('nav.html contains a <nav> element', () => {
  const p = path.join(__dirname, '..', 'nav.html');
  const html = fs.readFileSync(p, 'utf8');
  expect(html).toMatch(/<nav\b/i);
});
