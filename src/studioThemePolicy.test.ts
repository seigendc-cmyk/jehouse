import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const readSource = (path: string) => readFile(new URL(path, import.meta.url), 'utf8');

describe('optional studio light-theme policy', () => {
  it('defines one shared translucent modal and light-control policy', async () => {
    const css = await readSource('./index.css');
    expect(css).toContain('--pc-modal-backdrop: rgb(15 23 42 / 34%)');
    expect(css).toContain('.pc-studio-light');
    expect(css).toContain('background-color: var(--pc-surface-secondary) !important');
    expect(css).toContain('background: var(--pc-input-background) !important');
    expect(css).toContain('color: var(--pc-text) !important');
    expect(css).toContain('background: var(--pc-disabled-background) !important');
    expect(css).toContain('outline: 2px solid var(--pc-orange)');
    expect(css).not.toContain('--pc-modal-backdrop: rgb(0 0 0');
  });

  it('routes every affected workspace through the shared light chrome', async () => {
    const paths = [
      './components/SeriesManagerModal.tsx',
      './components/ProjectManagerModal.tsx',
      './components/ExportSettingsTab.tsx',
      './components/ImageGalleryModal.tsx',
      './companyProfile/components/CompanyProfileStudioModal.tsx',
      './designStudio/components/DesignStudioModal.tsx'
    ];
    for (const source of await Promise.all(paths.map(readSource))) {
      expect(source).toContain('pc-studio-light');
    }
  });

  it('preserves specialised company and design publication previews', async () => {
    const [css, company, design] = await Promise.all([
      readSource('./index.css'),
      readSource('./companyProfile/components/CompanyProfileStudioModal.tsx'),
      readSource('./designStudio/components/DesignStudioModal.tsx')
    ]);
    expect(css).toContain(':not(.pc-publication-preview *)');
    expect(company).toContain('pc-publication-preview');
    expect(design).toContain('pc-publication-preview');
  });

  it('lightens existing project and season cards through shared selectors', async () => {
    const [css, projects, series] = await Promise.all([
      readSource('./index.css'),
      readSource('./components/ProjectManagerModal.tsx'),
      readSource('./components/SeriesManagerModal.tsx')
    ]);
    expect(projects).toContain('bg-[#2b1310]');
    expect(projects).toContain('bg-[#230e0c]');
    expect(series).toContain('bg-[#222225]');
    expect(series).toContain('bg-[#2a2a2d]');
    for (const selector of [
      '.bg-\\[\\#2b1310\\]',
      '.bg-\\[\\#230e0c\\]',
      '.bg-\\[\\#222225\\]',
      '.bg-\\[\\#2a2a2d\\]'
    ]) {
      expect(css).toContain(selector);
    }
  });

  it('keeps data-heavy modal sizing local and accessible', async () => {
    const paths = [
      './components/SeriesManagerModal.tsx',
      './components/ProjectManagerModal.tsx',
      './components/ImageGalleryModal.tsx'
    ];
    for (const source of await Promise.all(paths.map(readSource))) {
      expect(source).toContain('const [isMaximized, setIsMaximized] = useState(false)');
      expect(source).toContain("setIsMaximized((value) => !value)");
      expect(source).toContain('aria-label={isMaximized');
    }
  });

  it('retains visible publishing labels and shared chapter-label integration', async () => {
    const [settings, gallery] = await Promise.all([
      readSource('./components/ExportSettingsTab.tsx'),
      readSource('./components/ImageGalleryModal.tsx')
    ]);
    expect(settings).toContain('Included Book Elements & Sections');
    expect(settings).toContain('Front Matter');
    expect(settings).toContain('Table of Contents');
    expect(gallery).toContain('getChapterDisplayLabel');
  });

  it('keeps affected optional studios behind their existing lazy boundaries', async () => {
    const app = await readSource('./App.tsx');
    for (const modulePath of [
      './components/ExportSettingsTab',
      './components/SeriesManagerModal',
      './components/ImageGalleryModal',
      './companyProfile/components/CompanyProfileStudioModal',
      './designStudio/components/DesignStudioModal'
    ]) {
      expect(app).toContain(`import('${modulePath}')`);
    }
  });
});
