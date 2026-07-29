import 'fake-indexeddb/auto';
import { beforeAll, describe, expect, it } from 'vitest';
import { initialBookProject } from '../data/initialBook';
import { setIDBItem } from '../lib/idbStorage';
import { IndexedDbProjectRepository } from './indexedDbProjectRepository';
import { stableProjectHash, wrapLegacyProject } from './projectSchema';

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();

  get length(): number {
    return this.values.size;
  }

  clear(): void {
    this.values.clear();
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  key(index: number): string | null {
    return [...this.values.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

function project(id: string, title: string, lastSaved = '2026-07-29T08:00:00.000Z') {
  return structuredClone({
    ...initialBookProject,
    id,
    title,
    lastSaved,
    chapters: initialBookProject.chapters.slice(0, 1)
  });
}

beforeAll(() => {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: new MemoryStorage()
  });
});

describe('IndexedDbProjectRepository', () => {
  it('increments revisions and rejects stale writers without overwriting', async () => {
    const repository = new IndexedDbProjectRepository();
    const original = project('repository-conflict-test', 'Original');
    const created = await repository.saveProject(wrapLegacyProject(original), 0);
    expect(created.status).toBe('created');
    if (created.status === 'conflict') throw new Error('Unexpected conflict.');

    const edited = {
      ...created.project,
      project: { ...created.project.project, title: 'Confirmed edit' }
    };
    const saved = await repository.saveProject(edited, created.project.localRevision);
    expect(saved.status).toBe('saved');

    const stale = {
      ...created.project,
      project: { ...created.project.project, title: 'Stale edit' }
    };
    const conflict = await repository.saveProject(stale, created.project.localRevision);
    expect(conflict.status).toBe('conflict');
    expect((await repository.getProject(original.id))?.project.title).toBe('Confirmed edit');
  });

  it('migrates legacy data idempotently and preserves the stronger record', async () => {
    const repository = new IndexedDbProjectRepository();
    const older = project('migration-idempotence-test', 'Older', '2026-07-28T08:00:00.000Z');
    const newer = project('migration-idempotence-test', 'Newer', '2026-07-29T08:00:00.000Z');

    await setIDBItem('presscraft_all_projects', [older]);
    localStorage.setItem('presscraft_book_project', JSON.stringify(newer));

    const first = await repository.migrateLegacyData();
    const second = await repository.migrateLegacyData();
    const stored = await repository.getProject(newer.id);
    const versions = await repository.getProjectVersions(newer.id);

    expect(first.projectsMigrated).toBe(1);
    expect(second.projectsMigrated).toBe(0);
    expect(stored?.project.title).toBe('Newer');
    expect(new Set(versions.map((version) => version.versionId)).size).toBe(versions.length);
    expect(localStorage.getItem('presscraft_legacy_projects_migrated_v1')).not.toBeNull();
  });

  it('uses a deterministic content hash independent of object key order', () => {
    const original = project('hash-test', 'Hash');
    const reordered = {
      title: original.title,
      ...original
    };
    expect(stableProjectHash(original)).toBe(stableProjectHash(reordered));
  });
});
