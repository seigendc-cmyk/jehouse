import 'fake-indexeddb/auto';
import { beforeAll, describe, expect, it } from 'vitest';
import { sampleBookTemplate } from '../templates/sampleBookTemplate';
import { setIDBItem } from '../lib/idbStorage';
import { IndexedDbProjectRepository } from './indexedDbProjectRepository';
import { stableProjectHash, wrapLegacyProject } from './projectSchema';
import { createSceneBreakBlock } from '../lib/sceneBreak';

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
    ...sampleBookTemplate,
    id,
    title,
    lastSaved,
    chapters: sampleBookTemplate.chapters.slice(0, 1)
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
    expect(stored?.project.typography?.presetId).toBe('legacy');
    expect(stored?.project.colourSettings?.activePaletteId).toBe('legacy-derived');
    expect(new Set(versions.map((version) => version.versionId)).size).toBe(versions.length);
    expect(localStorage.getItem('presscraft_legacy_projects_migrated_v1')).not.toBeNull();
  });

  it('reopens persisted palette metadata and whole-block colour offline', async () => {
    const repository = new IndexedDbProjectRepository();
    const source = wrapLegacyProject(project('colour-offline-test', 'Colour copy'));
    source.project.chapters[0].blocks[0].textColour = '#123456';
    source.project.colourSettings!.recentColours = ['#123456'];
    const saved = await repository.saveProject(source, 0);
    expect(saved.status).toBe('created');
    const reopened = await repository.getProject(source.projectId);
    expect(reopened?.project.chapters[0].blocks[0].textColour).toBe('#123456');
    expect(reopened?.project.colourSettings?.recentColours).toEqual(['#123456']);
  });

  it('reopens project paragraph settings and whole-block overrides offline', async () => {
    const repository = new IndexedDbProjectRepository();
    const source = wrapLegacyProject(project('paragraph-offline-test', 'Paragraph copy'));
    source.project.typography!.paragraphs.firstLineIndentPt = 22;
    source.project.chapters[0].blocks[0].paragraphFormatting = {mode:'hanging',hangingIndentPt:18};
    await repository.saveProject(source, 0);
    const reopened = await repository.getProject(source.projectId);
    expect(reopened?.project.typography?.paragraphs.firstLineIndentPt).toBe(22);
    expect(reopened?.project.chapters[0].blocks[0].paragraphFormatting).toEqual({mode:'hanging',hangingIndentPt:18});
  });

  it('reopens semantic scene-break metadata offline', async () => {
    const repository=new IndexedDbProjectRepository();
    const source=wrapLegacyProject(project('scene-break-offline-test','Scene copy'));
    const scene=createSceneBreakBlock(); scene.sceneBreak!.style='ornament';
    source.project.chapters[0].blocks.push(scene);
    await repository.saveProject(source,0);
    const reopened=await repository.getProject(source.projectId);
    expect(reopened?.project.chapters[0].blocks.at(-1)).toMatchObject({id:scene.id,type:'scene-break',text:'',sceneBreak:{style:'ornament'}});
  });

  it('reopens project and block drop-cap metadata offline without changing text', async () => {
    const repository=new IndexedDbProjectRepository();
    const source=wrapLegacyProject(project('drop-cap-offline-test','Drop cap copy'));
    const originalText=source.project.chapters[0].blocks[0].text;
    source.project.typography!.dropCaps.enabledByDefault=true;
    source.project.chapters[0].blocks[0].dropCapFormatting={enabled:true,style:'raised',lines:2};
    await repository.saveProject(source,0);
    const reopened=await repository.getProject(source.projectId);
    expect(reopened?.project.typography?.dropCaps.enabledByDefault).toBe(true);
    expect(reopened?.project.chapters[0].blocks[0].dropCapFormatting).toEqual({enabled:true,style:'raised',lines:2});
    expect(reopened?.project.chapters[0].blocks[0].text).toBe(originalText);
  });

  it('uses a deterministic content hash independent of object key order', () => {
    const original = project('hash-test', 'Hash');
    const reordered = {
      title: original.title,
      ...original
    };
    expect(stableProjectHash(original)).toBe(stableProjectHash(reordered));
  });

  it('lists only real stored projects ordered by repository-confirmed timestamps', async () => {
    const repository = new IndexedDbProjectRepository();
    const first = project('recent-project-first', 'First local book');
    const second = project('recent-project-second', 'Second local book');
    await repository.saveProject(wrapLegacyProject(first), 0);
    await new Promise((resolve) => setTimeout(resolve, 2));
    await repository.saveProject(wrapLegacyProject(second), 0);

    const recent = (await repository.listProjects()).filter((summary) =>
      summary.projectId.startsWith('recent-project-')
    );
    expect(recent.map((summary) => summary.projectId)).toEqual([
      'recent-project-second',
      'recent-project-first'
    ]);
    expect(recent.every((summary) => Boolean(summary.lastSavedAt))).toBe(true);
    expect(recent.some((summary) => summary.projectId === sampleBookTemplate.id)).toBe(false);
  });
});
