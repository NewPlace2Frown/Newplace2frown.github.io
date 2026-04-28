import { describe, it, expect, beforeAll } from 'vitest';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

describe('eleventy build', () => {
  beforeAll(() => {
    execFileSync('npx', ['@11ty/eleventy'], { stdio: 'pipe', shell: process.platform === 'win32' });
  });

  it('produces _site/index.html', () => {
    expect(existsSync('_site/index.html')).toBe(true);
  });

  it('homepage has a hero', () => {
    const html = readFileSync('_site/index.html', 'utf8');
    expect(html).toContain('class="hero"');
  });
});
