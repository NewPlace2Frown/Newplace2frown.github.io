import { describe, it, expect, beforeAll } from 'vitest';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { parseHTML } from 'linkedom';

let homeDoc;
let projectDoc;

describe('rendered layout', () => {
  beforeAll(() => {
    execFileSync('npx', ['@11ty/eleventy'], { stdio: 'pipe', shell: process.platform === 'win32' });
    homeDoc = parseHTML(readFileSync('_site/index.html', 'utf8')).document;
    projectDoc = parseHTML(readFileSync('_site/projects/morecambe/index.html', 'utf8')).document;
  });

  it('homepage has a sidebar with all nav items', () => {
    const links = [...homeDoc.querySelectorAll('.sidebar .nav a')].map(a => a.textContent.trim());
    expect(links).toEqual(
      expect.arrayContaining(['Work', 'Projects', 'Journal', 'Prints', 'About', 'Contact'])
    );
  });

  it('homepage has the typeset wordmark logo', () => {
    const wordmark = homeDoc.querySelector('.sidebar .logo .logo-wordmark');
    expect(wordmark).not.toBeNull();
    const lines = [...wordmark.querySelectorAll('.logo-line')].map(l => l.textContent.trim());
    expect(lines).toEqual(['NEW', 'PLACE', 'II', 'FROWN']);
  });

  it('homepage has socials in the sidebar', () => {
    const socials = [...homeDoc.querySelectorAll('.socials a')].map(a => a.textContent.trim());
    expect(socials.length).toBeGreaterThan(0);
    expect(socials).toEqual(expect.arrayContaining(['Instagram']));
  });

  it('Morecambe project page has heading, metadata, and images', () => {
    expect(projectDoc.querySelector('h1').textContent).toBe('Morecambe');
    const meta = projectDoc.querySelector('.project-meta').textContent;
    expect(meta).toContain('Place');
    expect(meta).toContain('Year');
    expect(meta).toContain('Frames');
    const figs = projectDoc.querySelectorAll('.project-images figure');
    expect(figs.length).toBeGreaterThan(0);
  });

  it('Morecambe page marks Projects branch as active in nav', () => {
    const active = projectDoc.querySelector('.sidebar .nav a.active');
    expect(active).not.toBeNull();
    expect(['Projects', 'Morecambe']).toContain(active.textContent.trim());
  });
});
