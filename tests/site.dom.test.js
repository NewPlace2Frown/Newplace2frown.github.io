/** @jest-environment jsdom */
const fs = require('fs');
const path = require('path');

beforeEach(() => {
  document.body.innerHTML = '<aside id="sidebar"></aside>';
  const navHtml = fs.readFileSync(path.join(__dirname, '..', 'nav.html'), 'utf8');
  document.getElementById('sidebar').innerHTML = navHtml;
});

test('highlightActiveLink marks correct link and openFolderWithActiveLink opens ancestor details', () => {
  const site = require('../assets/js/site');
  // simulate location
  const fakeLocation = new URL('http://example.com/photos/portfolio.html');
  // run highlight
  site.highlightActiveLink(document.getElementById('sidebar'), fakeLocation);
  const active = document.querySelector('.nav-list a.active');
  expect(active).not.toBeNull();
  expect(active.getAttribute('href')).toBe('/photos/portfolio.html');

  // ensure details are opened
  site.openFolderWithActiveLink(document.getElementById('sidebar'), { closeSiblings: true });
  const details = document.querySelector('details#f-photography');
  expect(details.open).toBe(true);
});
