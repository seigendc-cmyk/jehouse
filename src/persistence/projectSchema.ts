import { BookProject } from '../types';
import { PROJECT_SCHEMA_VERSION, StoredProject, SyncStatus } from './types';

const VALID_SYNC_STATUSES = new Set<SyncStatus>([
  'local-only',
  'queued',
  'syncing',
  'synced',
  'offline',
  'conflict',
  'error'
]);

export function isBookProject(value: unknown): value is BookProject {
  if (!value || typeof value !== 'object') return false;
  const project = value as Partial<BookProject>;
  return (
    typeof project.id === 'string' &&
    project.id.trim().length > 0 &&
    typeof project.title === 'string' &&
    typeof project.author === 'string' &&
    typeof project.lastSaved === 'string' &&
    typeof project.cloudSynced === 'boolean' &&
    Array.isArray(project.chapters) &&
    project.chapters.every(
      (chapter) =>
        chapter &&
        typeof chapter.id === 'string' &&
        typeof chapter.number === 'number' &&
        typeof chapter.title === 'string' &&
        Array.isArray(chapter.blocks)
    ) &&
    !!project.cover &&
    !!project.frontMatter &&
    !!project.watermark &&
    !!project.exportSettings
  );
}

export function isStoredProject(value: unknown): value is StoredProject {
  if (!value || typeof value !== 'object') return false;
  const record = value as Partial<StoredProject>;
  return (
    Number.isInteger(record.schemaVersion) &&
    typeof record.projectId === 'string' &&
    Number.isInteger(record.localRevision) &&
    (record.localRevision ?? -1) >= 0 &&
    typeof record.createdAt === 'string' &&
    typeof record.updatedAt === 'string' &&
    typeof record.lastSavedAt === 'string' &&
    typeof record.syncStatus === 'string' &&
    VALID_SYNC_STATUSES.has(record.syncStatus as SyncStatus) &&
    isBookProject(record.project) &&
    record.projectId === record.project.id
  );
}

export function migrateStoredProject(value: unknown): StoredProject | null {
  if (!isStoredProject(value)) return null;
  if (value.schemaVersion > PROJECT_SCHEMA_VERSION) return null;

  let migrated = structuredClone(value);
  while (migrated.schemaVersion < PROJECT_SCHEMA_VERSION) {
    switch (migrated.schemaVersion) {
      default:
        return null;
    }
  }
  return migrated;
}

export function wrapLegacyProject(
  project: BookProject,
  options: {
    localRevision?: number;
    createdAt?: string;
    updatedAt?: string;
    syncStatus?: SyncStatus;
  } = {}
): StoredProject {
  const now = new Date().toISOString();
  const legacySavedAt = isValidIsoDate(project.lastSaved) ? project.lastSaved : now;

  return {
    schemaVersion: PROJECT_SCHEMA_VERSION,
    projectId: project.id,
    localRevision: Math.max(0, options.localRevision ?? 0),
    project: structuredClone(project),
    createdAt: options.createdAt ?? legacySavedAt,
    updatedAt: options.updatedAt ?? legacySavedAt,
    lastSavedAt: legacySavedAt,
    syncStatus: options.syncStatus ?? (project.cloudSynced ? 'synced' : 'local-only')
  };
}

export function isValidIsoDate(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}

export function projectCompleteness(project: BookProject): number {
  let score = 0;
  if (project.title.trim()) score += 3;
  if (project.author.trim()) score += 2;
  if (project.subtitle.trim()) score += 1;
  score += project.chapters.length * 2;
  score += project.chapters.reduce((total, chapter) => total + chapter.blocks.length, 0);
  score += project.assets?.length ?? 0;
  score += project.bibliography?.length ?? 0;
  if (project.series?.isSeries) score += 2;
  return score;
}

export function stableProjectHash(project: BookProject): string {
  const canonical = JSON.stringify(sortValue(project));
  let hash = 2166136261;
  for (let index = 0; index < canonical.length; index += 1) {
    hash ^= canonical.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value && typeof value === 'object') {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((result, key) => {
        result[key] = sortValue((value as Record<string, unknown>)[key]);
        return result;
      }, {});
  }
  return value;
}
