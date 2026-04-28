import { describe, it, expect, beforeAll } from 'vitest';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { parseHTML } from 'linkedom';

const routes = [
  '/index.html',
  '/about/index.html',
  '/contact/index.html',
  '/work/index.html',
  '/projects/index.html',
  '/projects/morecambe/index.html',
  '/projects/gambia-2019/index.html',
  '/projects/gambia-2023/index.html',
  '/projects/lancaster/index.html',
  '/projects/cardiff/index.html',
  '/projects/wales/index.html',
  '/journal/index.html',
  '/journal/shaded-exhibition-contextual-statements/index.html'
];

describe('content port', () => {
  beforeAll(() => {
    execFileSync('npx', ['@11ty/eleventy'], { stdio: 'pipe', shell: process.platform === 'win32' });
  });

  routes.forEach(route => {
    it(`builds ${route}`, () => {
      expect(existsSync(`_site${route}`)).toBe(true);
    });
  });

  it('homepage has a hero with at least 3 frames', () => {
    const doc = parseHTML(readFileSync('_site/index.html', 'utf8')).document;
    const frames = doc.querySelectorAll('.hero .hero-frame');
    expect(frames.length).toBeGreaterThanOrEqual(3);
  });

  it('homepage shows a latest journal link', () => {
    const doc = parseHTML(readFileSync('_site/index.html', 'utf8')).document;
    const link = doc.querySelector('.latest-link');
    expect(link).not.toBeNull();
    expect(link.getAttribute('href')).toMatch(/^\/journal\//);
  });

  it('projects index lists every project page', () => {
    const doc = parseHTML(readFileSync('_site/projects/index.html', 'utf8')).document;
    const links = [...doc.querySelectorAll('.projects-index a')].map(a => a.getAttribute('href'));
    ['/projects/morecambe/', '/projects/gambia-2019/', '/projects/gambia-2023/', '/projects/lancaster/', '/projects/cardiff/', '/projects/wales/']
      .forEach(href => expect(links).toContain(href));
  });

  it('journal index lists at least one post', () => {
    const doc = parseHTML(readFileSync('_site/journal/index.html', 'utf8')).document;
    const items = doc.querySelectorAll('.journal-index li');
    expect(items.length).toBeGreaterThanOrEqual(1);
  });
});
