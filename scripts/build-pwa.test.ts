import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildPwa, createAssetManifest, createBuildRevision, isApprovedShellAsset } from './build-pwa.mjs';

describe('native PWA asset generation', () => {
  it('accepts only approved shell assets', () => {
    expect(isApprovedShellAsset('assets/index-abc.js')).toBe(true);
    expect(isApprovedShellAsset('brand/welcome.webp')).toBe(true);
    expect(isApprovedShellAsset('server.cjs')).toBe(false);
    expect(isApprovedShellAsset('server.cjs.map')).toBe(false);
    expect(isApprovedShellAsset('exports/book.docx')).toBe(false);
    expect(isApprovedShellAsset('uploads/private-project.json')).toBe(false);
    expect(isApprovedShellAsset('private-project.json')).toBe(false);
  });

  it('creates a deterministic sorted manifest without filesystem paths', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'presscraft-pwa-test-'));
    await mkdir(path.join(root, 'assets'));
    await writeFile(path.join(root, 'index.html'), '<main>PressCraft</main>');
    await writeFile(path.join(root, 'assets', 'z.js'), 'console.log("z")');
    await writeFile(path.join(root, 'assets', 'optional-workspace.js'), 'export default true');
    await writeFile(path.join(root, 'assets', 'a.css'), 'body{}');

    const first = await createAssetManifest(root);
    const second = await createAssetManifest(root);

    expect(first).toEqual(second);
    expect(first.map(({ url }) => url)).toEqual([
      '/assets/a.css',
      '/assets/optional-workspace.js',
      '/assets/z.js',
      '/index.html'
    ]);
    expect(JSON.stringify(first)).not.toContain(root);
    expect(createBuildRevision(first)).toBe(createBuildRevision(second));
  });

  it('generates a revisioned worker from the manifest', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'presscraft-pwa-build-'));
    const templatePath = path.join(root, 'template.js');
    await writeFile(path.join(root, 'index.html'), '<main>PressCraft</main>');
    await writeFile(
      templatePath,
      'const entries=__PRESSCRAFT_PRECACHE_ENTRIES__;const cache="presscraft-shell-__PRESSCRAFT_BUILD_REVISION__";'
    );

    const result = await buildPwa({ distDirectory: root, templatePath });
    const worker = await readFile(path.join(root, 'sw.js'), 'utf8');
    expect(worker).toContain('/index.html');
    expect(worker).toContain(`presscraft-shell-${result.revision}`);
  });
});
