import { describe, expect, it } from 'vitest';
import { createEmptyBookProject } from '../data/createEmptyBookProject';
import { createSceneBreakBlock } from '../lib/sceneBreak';
import { createDefaultAcademicContext } from '../features/workbook/workbookAcademicContext';
import { migrateStoredProject, wrapLegacyProject } from './projectSchema';
import { PROJECT_SCHEMA_VERSION } from './types';

const timestamp = '2026-07-30T12:00:00.000Z';

function historicalRecord(schemaVersion: number) {
  const project = createEmptyBookProject({ title: 'Historical fiction' });
  project.chapters[0].blocks = [
    {
      id: 'paragraph-one',
      type: 'paragraph',
      text: 'Preserve this manuscript text.',
      textColour: '#123456',
      paragraphFormatting: { mode: 'hanging', hangingIndentPt: 18 },
      dropCapFormatting: { enabled: true, style: 'raised', lines: 2 }
    },
    createSceneBreakBlock()
  ];
  delete project.academicContext;
  if (schemaVersion < 6) {
    delete project.mathPublishing;
    delete project.accountingFormat;
  }
  if (schemaVersion < 5 && project.typography) delete project.typography.dropCaps;
  if (schemaVersion < 4 && project.typography) {
    project.typography = { ...project.typography, paragraphs: undefined } as typeof project.typography;
  }
  if (schemaVersion < 3) delete project.colourSettings;
  if (schemaVersion < 2) delete project.typography;

  return {
    schemaVersion,
    projectId: project.id,
    localRevision: 11,
    remoteRevision: 8,
    project,
    createdAt: timestamp,
    updatedAt: timestamp,
    lastSavedAt: timestamp,
    lastSyncedAt: timestamp,
    syncStatus: 'local-only' as const
  };
}

describe('stored-project migration compatibility', () => {
  it.each([2, 3, 4, 5, 6])('migrates schema %i monotonically to schema 7', (version) => {
    const migrated = migrateStoredProject(historicalRecord(version));
    expect(migrated?.schemaVersion).toBe(7);
    expect(migrated?.project.typography).toBeDefined();
    expect(migrated?.project.colourSettings).toBeDefined();
    expect(migrated?.project.mathPublishing).toBeDefined();
    expect(migrated?.project.accountingFormat).toBeDefined();
  });

  it('keeps schema 7 deterministic and idempotent', () => {
    const record = historicalRecord(7);
    expect(migrateStoredProject(record)).toEqual(record);
    expect(migrateStoredProject(migrateStoredProject(record))).toEqual(record);
  });

  it('adds safe cover artwork defaults when migrating schema 6 books', () => {
    const record = historicalRecord(6);
    delete record.project.cover.showBookDetails;
    delete record.project.cover.imageBrightness;
    const migrated = migrateStoredProject(record)!;
    expect(migrated.project.cover).toMatchObject({
      showBookDetails: true,
      showTitle: true,
      showSubtitle: true,
      showAuthor: true,
      showSeries: false,
      showImprint: false,
      imageBrightness: 100,
      imageContrast: 100,
      imageFormat: 'webp',
      imageQuality: 88
    });
  });

  it('preserves legacy artwork, data URLs and opacity while adding schema-7 defaults', () => {
    const record = historicalRecord(6);
    record.project.cover.artworkUrl = 'data:image/jpeg;base64,legacy-cover';
    record.project.cover.imageOpacity = 73;
    delete record.project.cover.artworkAsset;
    const migrated = migrateStoredProject(record)!;
    expect(migrated.project.cover).toMatchObject({
      artworkUrl: 'data:image/jpeg;base64,legacy-cover',
      imageOpacity: 73,
      imageBrightness: 100,
      imageContrast: 100
    });
    expect(migrated.project.cover.artworkAsset).toBeUndefined();
  });

  it('repairs an old project with no cover config from canonical metadata', () => {
    const record = historicalRecord(6);
    (record.project as Partial<typeof record.project>).cover = undefined;
    const migrated = migrateStoredProject(record)!;
    expect(migrated.project.cover).toMatchObject({
      title: record.project.title,
      author: record.project.author,
      showBookDetails: true,
      imageBrightness: 100
    });
  });

  it('clamps invalid persisted cover ranges without losing artwork', () => {
    const record = historicalRecord(6);
    record.project.cover.artworkUrl = 'data:image/png;base64,preserved';
    record.project.cover.imageBrightness = -50;
    record.project.cover.imageContrast = 500;
    record.project.cover.imageOpacity = 1000;
    record.project.cover.imageQuality = Number.NaN;
    const migrated = migrateStoredProject(record)!;
    expect(migrated.project.cover).toMatchObject({
      artworkUrl: 'data:image/png;base64,preserved',
      imageBrightness: 50,
      imageContrast: 140,
      imageOpacity: 100,
      imageQuality: 88
    });
  });

  it('persists artwork-only mode and dormant child choices across reload', () => {
    const record = historicalRecord(7);
    record.project.cover.showBookDetails = false;
    record.project.cover.showTitle = true;
    record.project.cover.showSubtitle = false;
    record.project.cover.showAuthor = true;
    const reloaded = migrateStoredProject(record)!;
    expect(reloaded.project.cover).toMatchObject({ showBookDetails: false, showTitle: true, showSubtitle: false, showAuthor: true });
  });

  it('preserves envelope IDs, revisions, and timestamps', () => {
    const before = historicalRecord(2);
    const migrated = migrateStoredProject(before)!;
    expect(migrated).toMatchObject({
      projectId: before.projectId,
      localRevision: 11,
      remoteRevision: 8,
      createdAt: timestamp,
      updatedAt: timestamp,
      lastSavedAt: timestamp,
      lastSyncedAt: timestamp
    });
  });

  it('preserves manuscript blocks, IDs, order, colours, and formatting', () => {
    const before = historicalRecord(2);
    const blocks = structuredClone(before.project.chapters[0].blocks);
    expect(migrateStoredProject(before)?.project.chapters[0].blocks).toEqual(blocks);
  });

  it('preserves semantic list identity and metadata without changing schema 7', () => {
    const record = historicalRecord(7);
    record.project.chapters[0].blocks[0].listFormatting = { listId: 'stable-list', type: 'ordered', level: 2, startAt: 4, restart: true };
    const migrated = migrateStoredProject(record)!;
    expect(migrated.schemaVersion).toBe(PROJECT_SCHEMA_VERSION);
    expect(migrated.project.chapters[0].blocks[0]).toMatchObject({
      id: 'paragraph-one', text: 'Preserve this manuscript text.',
      listFormatting: { listId: 'stable-list', type: 'ordered', level: 2, startAt: 4, restart: true }
    });
  });

  it('preserves page dimensions and margins', () => {
    const before = historicalRecord(3);
    const page = structuredClone(before.project.pageSize);
    const margins = structuredClone(before.project.margins);
    const migrated = migrateStoredProject(before)!;
    expect(migrated.project.pageSize).toEqual(page);
    expect(migrated.project.margins).toEqual(margins);
  });

  it('accepts an ordinary book without workbook grade or subject state', () => {
    const record = historicalRecord(7);
    expect(record.project.academicContext).toBeUndefined();
    expect(migrateStoredProject(record)?.project.id).toBe(record.projectId);
    expect(createDefaultAcademicContext()).toMatchObject({
      educationLevel: 'Primary',
      gradeLabel: expect.any(String),
      subjectLabel: expect.any(String)
    });
  });

  it('preserves existing workbook context', () => {
    const record = historicalRecord(5);
    record.project.academicContext = {
      educationLevel: 'Secondary',
      gradeLabel: 'Form 4',
      subjectLabel: 'Mathematics'
    };
    expect(migrateStoredProject(record)?.project.academicContext).toEqual(record.project.academicContext);
  });

  it('does not require filesystem capability or directory-handle state', () => {
    const record = historicalRecord(5) as Record<string, unknown>;
    expect('directoryHandle' in record).toBe(false);
    expect(migrateStoredProject(record)).not.toBeNull();
  });

  it.each([
    null,
    {},
    { ...historicalRecord(5), projectId: 'wrong-project' },
    { ...historicalRecord(5), localRevision: -1 },
    { ...historicalRecord(5), syncStatus: 'not-a-status' }
  ])('rejects a genuinely corrupt stored record', (record) => {
    expect(migrateStoredProject(record)).toBeNull();
  });

  it('rejects unsupported future stored-project versions', () => {
    expect(migrateStoredProject({ ...historicalRecord(7), schemaVersion: 8 })).toBeNull();
  });

  it('wraps the current project factory in a valid schema-7 record', () => {
    const stored = wrapLegacyProject(createEmptyBookProject());
    expect(PROJECT_SCHEMA_VERSION).toBe(7);
    expect(stored.schemaVersion).toBe(PROJECT_SCHEMA_VERSION);
    expect(migrateStoredProject(stored)).toEqual(stored);
  });
});
