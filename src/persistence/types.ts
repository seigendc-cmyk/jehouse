import { BookProject } from '../types';

/** Version of the IndexedDB stored-project envelope (independent of SCI/workbook formats). */
export const PROJECT_SCHEMA_VERSION = 7;

export type SyncStatus =
  | 'local-only'
  | 'queued'
  | 'syncing'
  | 'synced'
  | 'offline'
  | 'conflict'
  | 'error';

export interface StoredProject {
  schemaVersion: number;
  projectId: string;
  localRevision: number;
  remoteRevision?: number;
  firebaseDocumentId?: string;
  project: BookProject;
  createdAt: string;
  updatedAt: string;
  lastSavedAt: string;
  lastSyncedAt?: string;
  syncStatus: SyncStatus;
  syncError?: string;
}

export interface ProjectSummary {
  projectId: string;
  title: string;
  author: string;
  category: BookProject['category'];
  localRevision: number;
  updatedAt: string;
  lastSavedAt: string;
  syncStatus: SyncStatus;
}

export type ProjectVersionSource =
  | 'local-save'
  | 'legacy-indexeddb'
  | 'legacy-localstorage'
  | 'legacy-sqlite'
  | 'migration-conflict'
  | 'import'
  | 'recovery';

export interface ProjectVersion {
  versionId: string;
  projectId: string;
  localRevision: number;
  createdAt: string;
  source: ProjectVersionSource;
  title: string;
  project: BookProject;
}

export type SaveResult =
  | { status: 'created' | 'saved'; project: StoredProject }
  | { status: 'conflict'; current: StoredProject; expectedLocalRevision: number };

export interface InvalidMigrationRecord {
  source: string;
  reason: string;
  projectId?: string;
}

export interface MigrationConflict {
  projectId: string;
  sources: string[];
  reason: string;
}

export interface MigrationReport {
  runAt: string;
  projectsDiscovered: number;
  projectsMigrated: number;
  duplicatesDetected: number;
  conflictsDetected: number;
  invalidRecords: InvalidMigrationRecord[];
  recordsPreserved: number;
  recordsRequiringManualReview: MigrationConflict[];
  legacyLocalStorageMarkedMigrated: boolean;
}

export interface LocalProjectRepository {
  listProjects(): Promise<ProjectSummary[]>;
  getProject(projectId: string): Promise<StoredProject | null>;
  createProject(project: StoredProject): Promise<SaveResult>;
  saveProject(project: StoredProject, expectedLocalRevision?: number): Promise<SaveResult>;
  deleteProject(projectId: string): Promise<void>;
  getProjectVersions(projectId: string): Promise<ProjectVersion[]>;
  saveProjectVersion(version: ProjectVersion): Promise<void>;
  migrateLegacyData(): Promise<MigrationReport>;
}
