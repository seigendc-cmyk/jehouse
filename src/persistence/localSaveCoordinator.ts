import { BookProject } from '../types';
import { ProjectVersion, SaveResult, StoredProject } from './types';

export type LocalSaveStatus =
  | 'idle'
  | 'dirty'
  | 'saving'
  | 'saved'
  | 'offline-saved'
  | 'conflict'
  | 'error';

export interface LocalSaveError {
  code: string;
  message: string;
  retryable: boolean;
}

export interface ProjectSaveState {
  status: LocalSaveStatus;
  localRevision: number;
  lastSavedAt?: string;
  error?: LocalSaveError;
}

export interface SaveRepository {
  saveBookProject(project: BookProject, expectedLocalRevision?: number): Promise<SaveResult>;
  getProject(projectId: string): Promise<StoredProject | null>;
  saveProjectVersion(version: ProjectVersion): Promise<void>;
}

interface LocalSaveCoordinatorOptions {
  repository: SaveRepository;
  onStateChange: (state: ProjectSaveState) => void;
  onConfirmedSave?: (project: BookProject, record: StoredProject) => void;
  isOnline: () => boolean;
  debounceMs?: number;
}

export function createInitialSaveState(record?: StoredProject | null): ProjectSaveState {
  return record
    ? {
        status: 'saved',
        localRevision: record.localRevision,
        lastSavedAt: record.lastSavedAt
      }
    : { status: 'idle', localRevision: 0 };
}

export function needsUnloadProtection(state: ProjectSaveState): boolean {
  return state.status === 'dirty' || state.status === 'saving' || state.status === 'error';
}

export function isImmediateSaveShortcut(event: Pick<KeyboardEvent, 'ctrlKey' | 'metaKey' | 'key'>): boolean {
  return (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's';
}

export function localSaveStatusLabel(state: ProjectSaveState, isOnline: boolean): string {
  switch (state.status) {
    case 'dirty':
      return 'Unsaved changes';
    case 'saving':
      return 'Saving locally…';
    case 'conflict':
      return 'Local save conflict';
    case 'error':
      return 'Local save failed';
    case 'offline-saved':
      return 'Offline — saved on this device';
    case 'saved':
      return isOnline ? 'Saved locally' : 'Offline — saved on this device';
    default:
      return 'Local storage active';
  }
}

export function applicationDocumentTitle(
  projectTitle: string,
  activeDocumentLabel: string | undefined,
  state: ProjectSaveState,
  isOnline: boolean
): string {
  return [
    'PressCraft Book Studio',
    projectTitle.trim() || 'Untitled Book',
    activeDocumentLabel,
    localSaveStatusLabel(state, isOnline)
  ]
    .filter(Boolean)
    .join(' | ');
}

export class LocalSaveCoordinator {
  private readonly repository: SaveRepository;
  private readonly onStateChange: (state: ProjectSaveState) => void;
  private readonly onConfirmedSave?: (project: BookProject, record: StoredProject) => void;
  private readonly isOnline: () => boolean;
  private readonly debounceMs: number;
  private state: ProjectSaveState = createInitialSaveState();
  private latestProject: BookProject | null = null;
  private mutationVersion = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private activeSave: Promise<ProjectSaveState> | null = null;
  private destroyed = false;

  constructor(options: LocalSaveCoordinatorOptions) {
    this.repository = options.repository;
    this.onStateChange = options.onStateChange;
    this.onConfirmedSave = options.onConfirmedSave;
    this.isOnline = options.isOnline;
    this.debounceMs = options.debounceMs ?? 1000;
  }

  getState(): ProjectSaveState {
    return this.state;
  }

  setProject(project: BookProject, record?: StoredProject | null): void {
    this.cancelTimer();
    this.latestProject = structuredClone(project);
    this.mutationVersion = 0;
    this.publish(createInitialSaveState(record));
  }

  clearProject(): void {
    this.cancelTimer();
    this.latestProject = null;
    this.mutationVersion = 0;
    this.publish(createInitialSaveState());
  }

  markDirty(project: BookProject): void {
    if (this.destroyed) return;
    this.latestProject = structuredClone(project);
    this.mutationVersion += 1;
    this.publish({
      ...this.state,
      status: 'dirty',
      error: undefined
    });
    this.schedule();
  }

  saveNow(): Promise<ProjectSaveState> {
    this.cancelTimer();
    if (this.activeSave) {
      return this.activeSave;
    }
    return this.flush();
  }

  retry(): Promise<ProjectSaveState> {
    return this.saveNow();
  }

  destroy(): void {
    this.destroyed = true;
    this.cancelTimer();
  }

  private schedule(): void {
    this.cancelTimer();
    this.timer = setTimeout(() => {
      this.timer = null;
      void this.flush();
    }, this.debounceMs);
  }

  private async flush(): Promise<ProjectSaveState> {
    if (this.destroyed || !this.latestProject) return this.state;
    if (this.activeSave) {
      return this.activeSave;
    }
    if (
      this.state.status !== 'dirty' &&
      this.state.status !== 'error' &&
      this.state.status !== 'conflict'
    ) {
      return this.state;
    }

    const projectSnapshot = structuredClone(this.latestProject);
    const savingMutationVersion = this.mutationVersion;
    const expectedRevision = this.state.localRevision;
    this.publish({ ...this.state, status: 'saving', error: undefined });

    this.activeSave = this.performSave(projectSnapshot, expectedRevision, savingMutationVersion);
    try {
      return await this.activeSave;
    } finally {
      this.activeSave = null;
      if (this.mutationVersion !== savingMutationVersion) {
        this.publish({ ...this.state, status: 'dirty', error: undefined });
        this.schedule();
      }
    }
  }

  private async performSave(
    projectSnapshot: BookProject,
    expectedRevision: number,
    savingMutationVersion: number
  ): Promise<ProjectSaveState> {
    try {
      const result = await this.repository.saveBookProject(projectSnapshot, expectedRevision);
      if (result.status === 'conflict') {
        await this.preserveConflictVersion(projectSnapshot, expectedRevision);
        return this.publish({
          status: 'conflict',
          localRevision: result.current.localRevision,
          lastSavedAt: result.current.lastSavedAt,
          error: {
            code: 'LOCAL_REVISION_CONFLICT',
            message:
              'Another local writer saved a newer revision. Your current edits remain open and were preserved for recovery.',
            retryable: false
          }
        });
      }

      const confirmedProject = {
        ...projectSnapshot,
        lastSaved: result.project.lastSavedAt
      };
      this.onConfirmedSave?.(confirmedProject, result.project);
      const newerMutationExists = this.mutationVersion !== savingMutationVersion;
      return this.publish({
        status: newerMutationExists
          ? 'dirty'
          : this.isOnline()
            ? 'saved'
            : 'offline-saved',
        localRevision: result.project.localRevision,
        lastSavedAt: result.project.lastSavedAt
      });
    } catch (error) {
      return this.publish({
        ...this.state,
        status: 'error',
        error: {
          code: 'INDEXEDDB_SAVE_FAILED',
          message:
            'PressCraft could not save this project to this device. Your current edits remain open. Retry before closing the application.',
          retryable: true
        }
      });
    }
  }

  private async preserveConflictVersion(
    project: BookProject,
    localRevision: number
  ): Promise<void> {
    try {
      await this.repository.saveProjectVersion({
        versionId: `${project.id}:local-conflict:${Date.now()}`,
        projectId: project.id,
        localRevision,
        createdAt: new Date().toISOString(),
        source: 'recovery',
        title: project.title,
        project: structuredClone(project)
      });
    } catch (error) {
      console.warn('[IndexedDB] Could not create a local conflict recovery version:', error);
    }
  }

  private publish(state: ProjectSaveState): ProjectSaveState {
    this.state = state;
    this.onStateChange(state);
    return state;
  }

  private cancelTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
