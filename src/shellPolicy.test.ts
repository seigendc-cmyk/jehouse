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

  it('shares canonical document labels across the title bar and navigation', async () => {
    const [app, sidebar] = await Promise.all([
      readSource('./App.tsx'),
      readSource('./components/Sidebar.tsx')
    ]);
    expect(app).toContain('getDocumentDisplayLabel');
    expect(sidebar).toContain('getChapterDisplayLabel');
    expect(app).not.toContain('`Chapter ${activeChapter.number}: ${activeChapter.title}`');
  });

  it('keeps critical tabs and save state available in the narrow policy', async () => {
    const [navbar, css] = await Promise.all([
      readSource('./components/Navbar.tsx'),
      readSource('./index.css')
    ]);
    for (const tab of ['File', 'Home', 'Insert', 'Book', 'Publish']) {
      expect(navbar).toContain(`label: '${tab}'`);
    }
    expect(css).toContain('.pc-title-status .pc-save-state');
    expect(css).toContain('.pc-manuscript-shell { padding-left: 0 !important; padding-right: 0 !important; }');
    expect(css).toContain('.pc-status-primary > span:not(:first-child)');
  });

  it('defaults navigation to collapsed at the narrow breakpoint', async () => {
    const app = await readSource('./App.tsx');
    expect(app).toContain("window.innerWidth > 900");
    expect(app).toContain("if (next && window.innerWidth <= 900) setNavigationVisible(false)");
    expect(app).toContain("if (next && window.innerWidth <= 900) setInspectorVisible(false)");
  });

  it('routes visible chapter labels through the canonical presentation helper', async () => {
    const paths = [
      './components/Sidebar.tsx',
      './components/EditorCanvas.tsx',
      './components/ImageGalleryModal.tsx',
      './components/TableOfContents.tsx',
      './components/PrintPreviewModal.tsx',
      './components/FocusMode.tsx'
    ];
    const sources = await Promise.all(paths.map(readSource));
    for (const source of sources) {
      expect(source).toContain('getChapterDisplayLabel');
      expect(source).not.toContain('Chapter {ch.number}: {ch.title}');
      expect(source).not.toContain('`Chapter ${ch.number}: ${ch.title}`');
    }
  });
});
