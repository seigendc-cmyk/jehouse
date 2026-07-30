import { describe, expect, it } from 'vitest';
import { createEmptyBookProject } from '../data/createEmptyBookProject';
import { migrateStoredProject } from './projectSchema';

describe('schema 6 mathematics and accounting migration', () => {
  it('adds publishing defaults without changing block IDs, text, order, or revisions and is idempotent', () => {
    const project = createEmptyBookProject();
    const beforeBlocks = structuredClone(project.chapters[0].blocks);
    delete project.mathPublishing;
    delete project.accountingFormat;
    const timestamp = new Date().toISOString();
    const migrated = migrateStoredProject({
      schemaVersion: 5,
      projectId: project.id,
      localRevision: 7,
      project,
      createdAt: timestamp,
      updatedAt: timestamp,
      lastSavedAt: timestamp,
      syncStatus: 'local-only'
    });
    expect(migrated?.schemaVersion).toBe(6);
    expect(migrated?.localRevision).toBe(7);
    expect(migrated?.project.chapters[0].blocks).toEqual(beforeBlocks);
    expect(migrated?.project.mathPublishing?.invalidMathPolicy).toBe('block-export');
    expect(migrated?.project.accountingFormat?.currency).toBe('USD');
    expect(migrateStoredProject(migrated)).toEqual(migrated);
  });
});
