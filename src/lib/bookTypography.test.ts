import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { createEmptyBookProject } from '../data/createEmptyBookProject';
import { migrateStoredProject } from '../persistence/projectSchema';
import {
  BOOK_TYPOGRAPHY_PRESETS,
  cloneTypographyPreset,
  getDefaultTypography,
  getEffectiveTypography,
  getLegacyTypography,
  markTypographyCustom,
  resolveProjectTypography
} from './bookTypography';

const readSource = (path: string) => readFile(new URL(path, import.meta.url), 'utf8');

describe('authoritative book typography', () => {
  it('migrates an existing stored project to Legacy without changing content or dimensions', () => {
    const project = createEmptyBookProject({ title: 'Existing Book' });
    delete project.typography;
    project.chapters[0].title = 'A Preserved Chapter';
    project.chapters[0].blocks[0].text = 'Manuscript text remains untouched.';
    const before = structuredClone(project);
    const now = new Date().toISOString();
    const migrated = migrateStoredProject({
      schemaVersion: 1,
      projectId: project.id,
      localRevision: 4,
      project,
      createdAt: now,
      updatedAt: now,
      lastSavedAt: now,
      syncStatus: 'local-only'
    });

    expect(migrated?.schemaVersion).toBe(7);
    expect(migrated?.project.typography?.presetId).toBe('legacy');
    expect(migrated?.project.chapters).toEqual(before.chapters);
    expect(migrated?.project.exportSettings.trimSize).toBe(before.exportSettings.trimSize);
    expect(migrated?.project.exportSettings.pageOrientation).toBe(before.exportSettings.pageOrientation);
    expect(migrated?.project.exportSettings.customMargins).toBe(before.exportSettings.customMargins);
  });

  it('is deterministic and idempotent', () => {
    const project = createEmptyBookProject();
    delete project.typography;
    const now = new Date().toISOString();
    const first = migrateStoredProject({
      schemaVersion: 1, projectId: project.id, localRevision: 0, project,
      createdAt: now, updatedAt: now, lastSavedAt: now, syncStatus: 'local-only'
    });
    expect(first).not.toBeNull();
    expect(migrateStoredProject(first)).toEqual(first);
  });

  it('uses approved new-book defaults from reliable category metadata', () => {
    expect(createEmptyBookProject({ category: 'Fiction & Literature' }).typography?.presetId).toBe('modern-bold');
    expect(createEmptyBookProject({ category: 'Academic & Textbook' }).typography?.presetId).toBe('academic');
    expect(createEmptyBookProject({ category: 'Business & Executive' }).typography?.presetId).toBe('modern-bold');
    expect(getDefaultTypography('Science, Tech & Math').presetId).toBe('modern-bold');
  });

  it('keeps shared presets deeply immutable and clones independently', () => {
    expect(Object.isFrozen(BOOK_TYPOGRAPHY_PRESETS)).toBe(true);
    expect(Object.isFrozen(BOOK_TYPOGRAPHY_PRESETS['modern-bold'].chapterOpening)).toBe(true);
    const first = cloneTypographyPreset('modern-bold');
    const second = cloneTypographyPreset('modern-bold');
    first.chapterOpening.titleFontSizePt = 14;
    expect(second.chapterOpening.titleFontSizePt).not.toBe(14);
    expect(BOOK_TYPOGRAPHY_PRESETS['modern-bold'].chapterOpening.titleFontSizePt).not.toBe(14);
  });

  it('defines the required professional opening hierarchies', () => {
    expect(BOOK_TYPOGRAPHY_PRESETS['modern-bold'].chapterOpening.alignment).toBe('centre');
    expect(BOOK_TYPOGRAPHY_PRESETS['modern-bold'].chapterOpening.numberWeight).toBeGreaterThanOrEqual(700);
    expect(BOOK_TYPOGRAPHY_PRESETS['classic-literary'].chapterOpening.titleFontFamily).toContain('Garamond');
    expect(BOOK_TYPOGRAPHY_PRESETS['classic-literary'].chapterOpening.topSpacingPt).toBeGreaterThan(40);
    expect(BOOK_TYPOGRAPHY_PRESETS['contemporary-minimal'].chapterOpening.alignment).toBe('left');
    expect(BOOK_TYPOGRAPHY_PRESETS.academic.chapterOpening.alignment).toBe('left');
    expect(BOOK_TYPOGRAPHY_PRESETS['dramatic-fiction'].chapterOpening.numberFontSizePt).toBeGreaterThan(30);
  });

  it('transitions manual edits to Custom without mutating the selected preset', () => {
    const selected = cloneTypographyPreset('academic');
    const edited = markTypographyCustom(selected, draft => {
      draft.body.fontSizePt = 12;
    });
    expect(edited.presetId).toBe('custom');
    expect(edited.body.fontSizePt).toBe(12);
    expect(selected.presetId).toBe('academic');
  });

  it('resolves missing typography lazily as Legacy without mutating the project', () => {
    const project = createEmptyBookProject();
    delete project.typography;
    const before = structuredClone(project);
    expect(resolveProjectTypography(project)).toEqual(getLegacyTypography());
    expect(project).toEqual(before);
  });

  it('scales supported trim sizes safely without mutating settings or scaling Legacy', () => {
    const typography = cloneTypographyPreset('dramatic-fiction');
    const before = structuredClone(typography);
    const a4 = getEffectiveTypography({ typography, pageSize: 'A4', orientation: 'portrait' });
    const small = getEffectiveTypography({ typography, pageSize: '5x8', orientation: 'portrait' });
    expect(a4.chapterOpening.numberFontSizePt).toBeGreaterThan(small.chapterOpening.numberFontSizePt);
    expect(small.chapterOpening.numberFontSizePt).toBeGreaterThanOrEqual(12);
    expect(a4.chapterOpening.numberFontSizePt).toBeLessThanOrEqual(38);
    expect(typography).toEqual(before);
    const legacy = getLegacyTypography();
    expect(getEffectiveTypography({ typography: legacy, pageSize: 'A4' })).toEqual(legacy);
  });

  it('keeps preview local and Apply routed through the project mutation callback', async () => {
    const [workspace, app] = await Promise.all([
      readSource('../components/BookTypographyModal.tsx'),
      readSource('../App.tsx')
    ]);
    expect(workspace).toContain('const [draft, setDraft]');
    expect(workspace).toContain('Static sample preview');
    expect(workspace).toContain('onApply(structuredClone(draft), structuredClone(colourDraft))');
    expect(app).toContain('executeFormattingTransaction(');
    expect(app).toContain('{...current,typography,colourSettings}');
  });

  it('shares effective typography across preview and PDF, EPUB, HTML and DOCX exports', async () => {
    const [preview, exports] = await Promise.all([
      readSource('../components/PrintPreviewModal.tsx'),
      readSource('./exportUtils.ts')
    ]);
    expect(preview).toContain('getEffectiveTypography');
    expect(preview).toContain("page.role === 'chapter-opening'");
    expect(preview).toContain('effectiveTypography.continuation');
    expect(exports.match(/getEffectiveTypography/g)?.length).toBeGreaterThanOrEqual(4);
    expect(exports).toContain('HeadingLevel.HEADING_1');
    expect(exports).toContain('typography.chapterOpening.titleFontSizePt');
  });

  it('keeps Typography lazy-loaded and leaves protected subsystems untouched', async () => {
    const [app, pwa, cloud] = await Promise.all([
      readSource('../App.tsx'),
      readSource('../pwa/service-worker-template.js'),
      readSource('../components/CloudSyncModal.tsx')
    ]);
    expect(app).toContain("import('./components/BookTypographyModal')");
    expect(app).not.toMatch(/^import .*BookTypographyModal/m);
    expect(pwa).toContain("url.pathname.startsWith('/firebase/')");
    expect(cloud).toContain('Firebase Cloud Sync');
    expect(cloud).toContain('onUpload: () => Promise<string>');
    expect(cloud).not.toContain('setTimeout');
  });
});
