import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('PWA dependency policy', () => {
  it('does not depend on vite-plugin-pwa or Workbox', () => {
    const packageJson = JSON.parse(
      readFileSync(new URL('../../package.json', import.meta.url), 'utf8')
    );
    const lockfile = readFileSync(new URL('../../package-lock.json', import.meta.url), 'utf8');
    const allDirectDependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    };

    expect(allDirectDependencies['vite-plugin-pwa']).toBeUndefined();
    expect(allDirectDependencies['workbox-build']).toBeUndefined();
    expect(allDirectDependencies['workbox-window']).toBeUndefined();
    expect(lockfile).not.toContain('node_modules/workbox-build');
    expect(lockfile).not.toContain('rollup-plugin-off-main-thread');
  });
});
