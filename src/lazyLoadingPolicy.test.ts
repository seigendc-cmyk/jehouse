import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const readSource = (path: string) => readFile(new URL(path, import.meta.url), 'utf8');

describe('optional feature import policy', () => {
  it('keeps optional workspaces out of the synchronous App import graph', async () => {
    const source = await readSource('./App.tsx');
    const optionalModules = [
      'CoverEditor',
      'FrontMatterEditor',
      'ExportSettingsTab',
      'SeriesManagerModal',
      'ImageGalleryModal'
    ];

    for (const moduleName of optionalModules) {
      expect(source).not.toMatch(new RegExp(`^import .*${moduleName}`, 'm'));
      expect(source).toContain(`import('./components/${moduleName}')`);
    }
  });

  it('keeps heavy chart, equation, and SQLite features behind dynamic boundaries', async () => {
    const [editor, migration] = await Promise.all([
      readSource('./components/EditorCanvas.tsx'),
      readSource('./persistence/legacyMigration.ts')
    ]);

    expect(editor).toContain("import('./blocks/GraphBlock')");
    expect(editor).toContain("import('./blocks/EquationRenderer')");
    expect(migration).not.toMatch(/^import .*sqliteDb/m);
    expect(migration).toContain("import('../lib/sqliteDb')");
  });

  it('uses one static BibTeX strategy inside the lazy export feature', async () => {
    const source = await readSource('./lib/exportUtils.ts');

    expect(source).toMatch(/^import \{[\s\S]*generateBibTeXString[\s\S]*\} from '\.\/bibtexUtils';/m);
    expect(source).not.toContain("import('./bibtexUtils')");
  });

  it('resolves representative optional workspace modules', async () => {
    const [cover, frontMatter, exportSettings, series, gallery] = await Promise.all([
      import('./components/CoverEditor'),
      import('./components/FrontMatterEditor'),
      import('./components/ExportSettingsTab'),
      import('./components/SeriesManagerModal'),
      import('./components/ImageGalleryModal')
    ]);

    expect(cover.CoverEditor).toBeTypeOf('function');
    expect(frontMatter.FrontMatterEditor).toBeTypeOf('function');
    expect(exportSettings.ExportSettingsTab).toBeTypeOf('function');
    expect(series.SeriesManagerModal).toBeTypeOf('function');
    expect(gallery.ImageGalleryModal).toBeTypeOf('function');
  }, 15_000);
});
