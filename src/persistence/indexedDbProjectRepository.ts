import { BookProject } from '../types';
import { migrateLegacyProjects } from './legacyMigration';
import { isStoredProject, migrateStoredProject, wrapLegacyProject } from './projectSchema';
import {
  LocalProjectRepository,
  MigrationReport,
  PROJECT_SCHEMA_VERSION,
  ProjectSummary,
  ProjectVersion,
  SaveResult,
  StoredProject
} from './types';

const DB_NAME = 'presscraft_projects';
const DB_VERSION = 1;
const PROJECTS_STORE = 'projects';
const VERSIONS_STORE = 'projectVersions';
const META_STORE = 'metadata';
const SYNC_QUEUE_STORE = 'syncQueue';
const MAX_VERSIONS_PER_PROJECT = 12;

export class IndexedDbProjectRepository implements LocalProjectRepository {
  private databasePromise?: Promise<IDBDatabase>;

  async listProjects(): Promise<ProjectSummary[]> {
    const records = await this.getAll<unknown>(PROJECTS_STORE);
    return records
      .map(migrateStoredProject)
      .filter((record): record is StoredProject => record !== null)
      .map((record) => ({
        projectId: record.projectId,
        title: record.project.title,
        author: record.project.author,
        category: record.project.category,
        localRevision: record.localRevision,
        updatedAt: record.updatedAt,
        lastSavedAt: record.lastSavedAt,
        syncStatus: record.syncStatus
      }))
      .sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt));
  }

  async getProject(projectId: string): Promise<StoredProject | null> {
    const raw = await this.get<unknown>(PROJECTS_STORE, projectId);
    return migrateStoredProject(raw);
  }

  async createProject(project: StoredProject): Promise<SaveResult> {
    if (!isStoredProject(project)) throw new Error('Cannot create an invalid project record.');
    const existing = await this.getProject(project.projectId);
    if (existing) {
      return { status: 'conflict', current: existing, expectedLocalRevision: 0 };
    }

    const now = new Date().toISOString();
    const created: StoredProject = {
      ...structuredClone(project),
      schemaVersion: PROJECT_SCHEMA_VERSION,
      localRevision: Math.max(1, project.localRevision),
      createdAt: project.createdAt || now,
      updatedAt: now,
      lastSavedAt: now
    };
    await this.put(PROJECTS_STORE, created);
    return { status: 'created', project: created };
  }

  async saveProject(project: StoredProject, expectedLocalRevision?: number): Promise<SaveResult> {
    if (!isStoredProject(project)) throw new Error('Cannot save an invalid project record.');
    const database = await this.open();

    return new Promise((resolve, reject) => {
      const transaction = database.transaction(PROJECTS_STORE, 'readwrite');
      const store = transaction.objectStore(PROJECTS_STORE);
      const request = store.get(project.projectId);
      let result: SaveResult | undefined;

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const current = migrateStoredProject(request.result);
        const actualRevision = current?.localRevision ?? 0;
        if (expectedLocalRevision !== undefined && actualRevision !== expectedLocalRevision && current) {
          result = { status: 'conflict', current, expectedLocalRevision };
          transaction.abort();
          return;
        }

        const now = new Date().toISOString();
        const saved: StoredProject = {
          ...structuredClone(project),
          schemaVersion: PROJECT_SCHEMA_VERSION,
          localRevision: actualRevision + 1,
          createdAt: current?.createdAt ?? project.createdAt ?? now,
          updatedAt: now,
          lastSavedAt: now
        };
        store.put(saved);
        result = { status: current ? 'saved' : 'created', project: saved };
      };
      transaction.oncomplete = () => result && resolve(result);
      transaction.onabort = () => {
        if (result?.status === 'conflict') resolve(result);
        else reject(transaction.error ?? new Error('IndexedDB save transaction aborted.'));
      };
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async saveBookProject(project: BookProject, expectedLocalRevision?: number): Promise<SaveResult> {
    const current = await this.getProject(project.id);
    const wrapped = current
      ? { ...current, project: structuredClone(project) }
      : wrapLegacyProject(project, { localRevision: 0 });
    return this.saveProject(wrapped, expectedLocalRevision);
  }

  async deleteProject(projectId: string): Promise<void> {
    await this.delete(PROJECTS_STORE, projectId);
  }

  async getProjectVersions(projectId: string): Promise<ProjectVersion[]> {
    const database = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(VERSIONS_STORE, 'readonly');
      const index = transaction.objectStore(VERSIONS_STORE).index('byProjectId');
      const request = index.getAll(projectId);
      request.onerror = () => reject(request.error);
      request.onsuccess = () =>
        resolve(
          (request.result as ProjectVersion[]).sort(
            (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt)
          )
        );
    });
  }

  async saveProjectVersion(version: ProjectVersion): Promise<void> {
    await this.put(VERSIONS_STORE, structuredClone(version));
    const versions = await this.getProjectVersions(version.projectId);
    await Promise.all(
      versions.slice(MAX_VERSIONS_PER_PROJECT).map((oldVersion) =>
        this.delete(VERSIONS_STORE, oldVersion.versionId)
      )
    );
  }

  async migrateLegacyData(): Promise<MigrationReport> {
    return migrateLegacyProjects(this);
  }

  async getMetadata<T>(key: string): Promise<T | null> {
    return this.get<T>(META_STORE, key);
  }

  async setMetadata<T>(key: string, value: T): Promise<void> {
    await this.put(META_STORE, { key, value, updatedAt: new Date().toISOString() });
  }

  private open(): Promise<IDBDatabase> {
    if (this.databasePromise) return this.databasePromise;
    this.databasePromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB is not available in this environment.'));
        return;
      }
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(PROJECTS_STORE)) {
          database.createObjectStore(PROJECTS_STORE, { keyPath: 'projectId' });
        }
        if (!database.objectStoreNames.contains(VERSIONS_STORE)) {
          const versions = database.createObjectStore(VERSIONS_STORE, { keyPath: 'versionId' });
          versions.createIndex('byProjectId', 'projectId', { unique: false });
        }
        if (!database.objectStoreNames.contains(META_STORE)) {
          database.createObjectStore(META_STORE, { keyPath: 'key' });
        }
        if (!database.objectStoreNames.contains(SYNC_QUEUE_STORE)) {
          const queue = database.createObjectStore(SYNC_QUEUE_STORE, { keyPath: 'operationId' });
          queue.createIndex('byProjectId', 'projectId', { unique: false });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error('IndexedDB upgrade is blocked by another tab.'));
    });
    return this.databasePromise;
  }

  private async get<T>(storeName: string, key: IDBValidKey): Promise<T | null> {
    const database = await this.open();
    return new Promise((resolve, reject) => {
      const request = database.transaction(storeName, 'readonly').objectStore(storeName).get(key);
      request.onsuccess = () => {
        const value = request.result;
        if (storeName === META_STORE && value && typeof value === 'object' && 'value' in value) {
          resolve(value.value as T);
        } else {
          resolve((value as T | undefined) ?? null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  private async getAll<T>(storeName: string): Promise<T[]> {
    const database = await this.open();
    return new Promise((resolve, reject) => {
      const request = database.transaction(storeName, 'readonly').objectStore(storeName).getAll();
      request.onsuccess = () => resolve(request.result as T[]);
      request.onerror = () => reject(request.error);
    });
  }

  private async put<T>(storeName: string, value: T): Promise<void> {
    const database = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(storeName, 'readwrite');
      transaction.objectStore(storeName).put(value);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  }

  private async delete(storeName: string, key: IDBValidKey): Promise<void> {
    const database = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(storeName, 'readwrite');
      transaction.objectStore(storeName).delete(key);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  }
}

export const localProjectRepository = new IndexedDbProjectRepository();
