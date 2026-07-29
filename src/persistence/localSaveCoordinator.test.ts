import { afterEach, describe, expect, it, vi } from 'vitest';
import { sampleBookTemplate } from '../templates/sampleBookTemplate';
import {
  applicationDocumentTitle,
  isImmediateSaveShortcut,
  LocalSaveCoordinator,
  needsUnloadProtection,
  ProjectSaveState,
  SaveRepository
} from './localSaveCoordinator';
import { wrapLegacyProject } from './projectSchema';
import { ProjectVersion, SaveResult, StoredProject } from './types';

function project(title = 'Test Book') {
  return structuredClone({
    ...sampleBookTemplate,
    id: 'save-state-test',
    title,
    lastSaved: '2026-07-29T07:00:00.000Z'
  });
}

function confirmedRecord(revision: number, title = 'Test Book'): StoredProject {
  return {
    ...wrapLegacyProject(project(title)),
    localRevision: revision,
    lastSavedAt: `2026-07-29T09:00:0${revision}.000Z`,
    updatedAt: `2026-07-29T09:00:0${revision}.000Z`
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });
  return { promise, resolve, reject };
}

function coordinator(
  repository: SaveRepository,
  states: ProjectSaveState[],
  online = true
) {
  const instance = new LocalSaveCoordinator({
    repository,
    debounceMs: 1000,
    isOnline: () => online,
    onStateChange: (state) => states.push(state)
  });
  instance.setProject(project(), confirmedRecord(3));
  return instance;
}

afterEach(() => {
  vi.useRealTimers();
});

describe('LocalSaveCoordinator', () => {
  it('marks persisted project mutations dirty', () => {
    const states: ProjectSaveState[] = [];
    const repository = mockRepository();
    const instance = coordinator(repository, states);
    instance.markDirty({ ...project(), title: 'Changed' });
    expect(instance.getState().status).toBe('dirty');
    expect(instance.getState().lastSavedAt).toBe(confirmedRecord(3).lastSavedAt);
    instance.destroy();
  });

  it('debounces autosave and transitions dirty to saving to saved', async () => {
    vi.useFakeTimers();
    const states: ProjectSaveState[] = [];
    const repository = mockRepository();
    const instance = coordinator(repository, states);
    instance.markDirty({ ...project(), title: 'Changed' });
    expect(repository.saveBookProject).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1000);
    expect(repository.saveBookProject).toHaveBeenCalledTimes(1);
    expect(states.map((state) => state.status)).toEqual(
      expect.arrayContaining(['dirty', 'saving', 'saved'])
    );
    expect(instance.getState().localRevision).toBe(4);
    instance.destroy();
  });

  it('does not change lastSavedAt until repository confirmation', async () => {
    const pending = deferred<SaveResult>();
    const repository = mockRepository();
    repository.saveBookProject = vi.fn(() => pending.promise);
    const states: ProjectSaveState[] = [];
    const instance = coordinator(repository, states);
    instance.markDirty({ ...project(), title: 'Changed' });
    const save = instance.saveNow();
    expect(instance.getState().lastSavedAt).toBe(confirmedRecord(3).lastSavedAt);
    pending.resolve({ status: 'saved', project: confirmedRecord(4) });
    await save;
    expect(instance.getState().lastSavedAt).toBe(confirmedRecord(4).lastSavedAt);
    instance.destroy();
  });

  it('retains dirty work and the prior timestamp after a failed save', async () => {
    const repository = mockRepository();
    repository.saveBookProject = vi.fn().mockRejectedValue(new Error('quota'));
    const states: ProjectSaveState[] = [];
    const instance = coordinator(repository, states);
    instance.markDirty({ ...project(), title: 'Changed' });
    await instance.saveNow();
    expect(instance.getState().status).toBe('error');
    expect(instance.getState().lastSavedAt).toBe(confirmedRecord(3).lastSavedAt);
    expect(instance.getState().error?.retryable).toBe(true);
    expect(needsUnloadProtection(instance.getState())).toBe(true);
    instance.destroy();
  });

  it('saveNow bypasses the debounce and repeated calls share one active write', async () => {
    vi.useFakeTimers();
    const pending = deferred<SaveResult>();
    const repository = mockRepository();
    repository.saveBookProject = vi.fn(() => pending.promise);
    const states: ProjectSaveState[] = [];
    const instance = coordinator(repository, states);
    instance.markDirty({ ...project(), title: 'Changed' });
    const first = instance.saveNow();
    const second = instance.saveNow();
    expect(repository.saveBookProject).toHaveBeenCalledTimes(1);
    pending.resolve({ status: 'saved', project: confirmedRecord(4) });
    await Promise.all([first, second]);
    await vi.runAllTimersAsync();
    expect(repository.saveBookProject).toHaveBeenCalledTimes(1);
    instance.destroy();
  });

  it('saves a mutation that arrives during an active save in a subsequent write', async () => {
    vi.useFakeTimers();
    const firstPending = deferred<SaveResult>();
    const repository = mockRepository();
    repository.saveBookProject = vi
      .fn()
      .mockImplementationOnce(() => firstPending.promise)
      .mockResolvedValueOnce({ status: 'saved', project: confirmedRecord(5) });
    const states: ProjectSaveState[] = [];
    const instance = coordinator(repository, states);
    instance.markDirty({ ...project(), title: 'First' });
    const firstSave = instance.saveNow();
    instance.markDirty({ ...project(), title: 'Second' });
    firstPending.resolve({ status: 'saved', project: confirmedRecord(4) });
    await firstSave;
    await vi.advanceTimersByTimeAsync(1000);
    expect(repository.saveBookProject).toHaveBeenCalledTimes(2);
    expect(repository.saveBookProject).toHaveBeenLastCalledWith(
      expect.objectContaining({ title: 'Second' }),
      4
    );
    instance.destroy();
  });

  it('enters conflict state and creates a recovery version', async () => {
    const repository = mockRepository();
    repository.saveBookProject = vi.fn().mockResolvedValue({
      status: 'conflict',
      current: confirmedRecord(7, 'Stored'),
      expectedLocalRevision: 3
    });
    const states: ProjectSaveState[] = [];
    const instance = coordinator(repository, states);
    instance.markDirty({ ...project(), title: 'In-memory work' });
    await instance.saveNow();
    expect(instance.getState().status).toBe('conflict');
    expect(instance.getState().localRevision).toBe(7);
    expect(repository.saveProjectVersion).toHaveBeenCalledWith(
      expect.objectContaining({
        source: 'recovery',
        project: expect.objectContaining({ title: 'In-memory work' })
      })
    );
    instance.destroy();
  });

  it('reports an offline successful save as offline-saved', async () => {
    const repository = mockRepository();
    const states: ProjectSaveState[] = [];
    const instance = coordinator(repository, states, false);
    instance.markDirty({ ...project(), title: 'Offline edit' });
    await instance.saveNow();
    expect(instance.getState().status).toBe('offline-saved');
    instance.destroy();
  });
});

describe('save-state presentation and unload rules', () => {
  const saved: ProjectSaveState = {
    status: 'saved',
    localRevision: 4,
    lastSavedAt: '2026-07-29T09:00:04.000Z'
  };

  it('uses the active title and Untitled Book fallback in the title bar label', () => {
    expect(applicationDocumentTitle('Mathematics', 'Chapter 2', saved, true)).toContain(
      'PressCraft Book Studio | Mathematics | Chapter 2 | Saved locally'
    );
    expect(applicationDocumentTitle('   ', undefined, saved, true)).toContain('Untitled Book');
  });

  it('activates unload protection only for unconfirmed work', () => {
    expect(needsUnloadProtection({ ...saved, status: 'dirty' })).toBe(true);
    expect(needsUnloadProtection({ ...saved, status: 'saving' })).toBe(true);
    expect(needsUnloadProtection({ ...saved, status: 'error' })).toBe(true);
    expect(needsUnloadProtection(saved)).toBe(false);
    expect(needsUnloadProtection({ ...saved, status: 'offline-saved' })).toBe(false);
  });

  it('recognizes Ctrl+S and Command+S without intercepting plain S', () => {
    expect(isImmediateSaveShortcut({ ctrlKey: true, metaKey: false, key: 's' })).toBe(true);
    expect(isImmediateSaveShortcut({ ctrlKey: false, metaKey: true, key: 'S' })).toBe(true);
    expect(isImmediateSaveShortcut({ ctrlKey: false, metaKey: false, key: 's' })).toBe(false);
  });
});

function mockRepository(): SaveRepository & {
  saveBookProject: ReturnType<typeof vi.fn>;
  getProject: ReturnType<typeof vi.fn>;
  saveProjectVersion: ReturnType<typeof vi.fn>;
} {
  return {
    saveBookProject: vi.fn().mockResolvedValue({
      status: 'saved',
      project: confirmedRecord(4)
    }),
    getProject: vi.fn().mockResolvedValue(confirmedRecord(3)),
    saveProjectVersion: vi.fn().mockResolvedValue(undefined)
  };
}
