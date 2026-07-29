import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const readSource = (path: string) => readFile(new URL(path, import.meta.url), 'utf8');

describe('light shell policy', () => {
  it('defines the approved shared light tokens and orange accent', async () => {
    const css = await readSource('./index.css');
    expect(css).toContain('--pc-orange: #ea580c');
    expect(css).toContain('--pc-app-background: #f3f4f6');
    expect(css).toContain('--pc-surface: #ffffff');
    expect(css).toContain('--pc-text: #1f2937');
  });

  it('uses the light shell without restoring optional synchronous imports', async () => {
    const app = await readSource('./App.tsx');
    expect(app).toContain('presscraft-shell theme-warm-light');
    expect(app).not.toContain('presscraft-shell theme-sahara-dusk');
    expect(app).not.toMatch(/^import .*ExportModal/m);
    expect(app).toContain("import('./components/ExportModal')");
    expect(app).toContain("import('./components/CoverEditor')");
  });

  it('keeps cloud status truthful and GitHub absent from the shell', async () => {
    const [app, navbar] = await Promise.all([
      readSource('./App.tsx'),
      readSource('./components/Navbar.tsx')
    ]);
    expect(app).toContain('Disabled pending security approval');
    expect(navbar).toContain('Cloud sync disabled');
    expect(`${app}${navbar}`.toLowerCase()).not.toContain('github');
  });
});
