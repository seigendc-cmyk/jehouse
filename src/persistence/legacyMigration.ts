import { getIDBItem } from '../lib/idbStorage';
import { loadAllProjectsFromSQLite } from '../lib/sqliteDb';
import { BookProject } from '../types';
import type { IndexedDbProjectRepository } from './indexedDbProjectRepository';
import {
  isBookProject,
  isValidIsoDate,
  projectCompleteness,
  stableProjectHash,
  wrapLegacyProject
} from './projectSchema';
import { MigrationConflict, MigrationReport, ProjectVersion, StoredProject } from './types';

const LEGACY_PROJECTS_KEY = 'presscraft_all_projects';
const LEGACY_PROJECT_KEY = 'presscraft_book_project';
const LEGACY_SQLITE_KEY = 'presscraft_sqlite_db_v1';
const LOCALSTORAGE_MIGRATION_MARKER = 'presscraft_legacy_projects_migrated_v1';
const MIGRATION_REPORT_KEY = 'legacyMigrationReportV1';

type MigrationSource = 'legacy-indexeddb' | 'legacy-localstorage' | 'legacy-sqlite';

interface Candidate {
  source: MigrationSource;
  project: BookProject;
  hash: string;
  revision: number;
  updatedAt?: string;
  completeness: number;
}

export async function migrateLegacyProjects(
  repository: IndexedDbProjectRepository
): Promise<MigrationReport> {
  const report: MigrationReport = {
    runAt: new Date().toISOString(),
    projectsDiscovered: 0,
    projectsMigrated: 0,
    duplicatesDetected: 0,
    conflictsDetected: 0,
    invalidRecords: [],
    recordsPreserved: 0,
    recordsRequiringManualReview: [],
    legacyLocalStorageMarkedMigrated: false
  };

  const candidates: Candidate[] = [];
  await collectIndexedDbCandidates(candidates, report);
  collectLocalStorageCandidates(candidates, report);
  await collectSqliteCandidates(candidates, report);
  report.projectsDiscovered = candidates.length;

  const grouped = new Map<string, Candidate[]>();
  for (const candidate of candidates) {
    const group = grouped.get(candidate.project.id) ?? [];
    group.push(candidate);
    grouped.set(candidate.project.id, group);
  }

  for (const [projectId, group] of grouped) {
    const existing = await repository.getProject(projectId);
    const resolution = resolveCandidates(group, existing);
    report.duplicatesDetected += resolution.duplicates;

    for (const preserved of resolution.preserved) {
      await repository.saveProjectVersion(toVersion(preserved, existing?.localRevision ?? 0));
      report.recordsPreserved += 1;
    }

    if (resolution.conflict) {
      report.conflictsDetected += 1;
      report.recordsRequiringManualReview.push(resolution.conflict);
    }

    if (!existing) {
      const record = wrapLegacyProject(resolution.winner.project, {
        localRevision: Math.max(0, resolution.winner.revision),
        updatedAt: resolution.winner.updatedAt,
        syncStatus: resolution.winner.project.cloudSynced ? 'synced' : 'local-only'
      });
      const saved = await repository.createProject(record);
      if (saved.status === 'created') report.projectsMigrated += 1;
    } else if (shouldReplaceExisting(existing, resolution.winner)) {
      await repository.saveProjectVersion({
        versionId: makeVersionId(
          projectId,
          'migration-conflict',
          stableProjectHash(existing.project)
        ),
        projectId,
        localRevision: existing.localRevision,
        createdAt: report.runAt,
        source: 'migration-conflict',
        title: existing.project.title,
        project: structuredClone(existing.project)
      });
      report.recordsPreserved += 1;
      const replacement: StoredProject = {
        ...existing,
        project: structuredClone(resolution.winner.project)
      };
      await repository.saveProject(replacement, existing.localRevision);
      report.projectsMigrated += 1;
    }
  }

  markLocalStorageMigrated(report);
  await repository.setMetadata(MIGRATION_REPORT_KEY, report);
  return report;
}

function resolveCandidates(
  candidates: Candidate[],
  existing: StoredProject | null
): {
  winner: Candidate;
  preserved: Candidate[];
  duplicates: number;
  conflict?: MigrationConflict;
} {
  const ordered = [...candidates].sort(compareCandidates);
  const winner = ordered[0];
  const uniqueByHash = new Map(ordered.map((candidate) => [candidate.hash, candidate]));
  const duplicates = ordered.length - uniqueByHash.size;
  const preserved = [...uniqueByHash.values()].filter((candidate) => candidate.hash !== winner.hash);

  const competingTopRecords = preserved.filter(
    (candidate) =>
      candidate.revision === winner.revision &&
      candidate.updatedAt === winner.updatedAt &&
      candidate.completeness === winner.completeness
  );
  const conflict =
    competingTopRecords.length > 0
      ? {
          projectId: winner.project.id,
          sources: [winner, ...competingTopRecords].map((candidate) => candidate.source),
          reason: 'Equivalent migration priority but different project content.'
        }
      : undefined;

  if (existing && stableProjectHash(existing.project) !== winner.hash) {
    preserved.push({
      source: 'legacy-indexeddb',
      project: existing.project,
      hash: stableProjectHash(existing.project),
      revision: existing.localRevision,
      updatedAt: existing.updatedAt,
      completeness: projectCompleteness(existing.project)
    });
  }
  return { winner, preserved, duplicates, conflict };
}

function compareCandidates(left: Candidate, right: Candidate): number {
  if (left.revision !== right.revision) return right.revision - left.revision;
  const leftTime = left.updatedAt ? Date.parse(left.updatedAt) : 0;
  const rightTime = right.updatedAt ? Date.parse(right.updatedAt) : 0;
  if (leftTime !== rightTime) return rightTime - leftTime;
  if (left.completeness !== right.completeness) return right.completeness - left.completeness;
  return left.hash.localeCompare(right.hash);
}

function shouldReplaceExisting(existing: StoredProject, candidate: Candidate): boolean {
  if (stableProjectHash(existing.project) === candidate.hash) return false;
  if (candidate.revision > existing.localRevision) return true;
  if (candidate.revision < existing.localRevision) return false;
  const existingTime = Date.parse(existing.updatedAt);
  const candidateTime = candidate.updatedAt ? Date.parse(candidate.updatedAt) : 0;
  if (candidateTime !== existingTime) return candidateTime > existingTime;
  return candidate.completeness > projectCompleteness(existing.project);
}

async function collectIndexedDbCandidates(
  candidates: Candidate[],
  report: MigrationReport
): Promise<void> {
  const allProjects = await getIDBItem<unknown>(LEGACY_PROJECTS_KEY);
  addRawValue(allProjects, 'legacy-indexeddb', LEGACY_PROJECTS_KEY, candidates, report);
  const singleProject = await getIDBItem<unknown>(LEGACY_PROJECT_KEY);
  addRawValue(singleProject, 'legacy-indexeddb', LEGACY_PROJECT_KEY, candidates, report);
}

function collectLocalStorageCandidates(candidates: Candidate[], report: MigrationReport): void {
  if (typeof localStorage === 'undefined') return;
  for (const key of [LEGACY_PROJECTS_KEY, LEGACY_PROJECT_KEY]) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      addRawValue(JSON.parse(raw), 'legacy-localstorage', key, candidates, report);
    } catch {
      report.invalidRecords.push({ source: `legacy-localstorage:${key}`, reason: 'Invalid JSON.' });
    }
  }
}

async function collectSqliteCandidates(
  candidates: Candidate[],
  report: MigrationReport
): Promise<void> {
  const idbBinary = await getIDBItem<string>(LEGACY_SQLITE_KEY);
  const localBinary =
    typeof localStorage !== 'undefined' ? localStorage.getItem(LEGACY_SQLITE_KEY) : null;
  if (!idbBinary && !localBinary) return;
  try {
    const projects = await loadAllProjectsFromSQLite();
    addRawValue(projects, 'legacy-sqlite', LEGACY_SQLITE_KEY, candidates, report);
  } catch (error) {
    report.invalidRecords.push({
      source: `legacy-sqlite:${LEGACY_SQLITE_KEY}`,
      reason: error instanceof Error ? error.message : 'SQLite data could not be read.'
    });
  }
}

function addRawValue(
  value: unknown,
  source: MigrationSource,
  key: string,
  candidates: Candidate[],
  report: MigrationReport
): void {
  if (value === null || value === undefined) return;
  const records = Array.isArray(value) ? value : [value];
  for (const record of records) {
    if (!isBookProject(record)) {
      report.invalidRecords.push({
        source: `${source}:${key}`,
        reason: 'Record does not match the existing BookProject schema.',
        projectId:
          record && typeof record === 'object' && 'id' in record
            ? String((record as { id: unknown }).id)
            : undefined
      });
      continue;
    }
    candidates.push({
      source,
      project: structuredClone(record),
      hash: stableProjectHash(record),
      revision: readLegacyRevision(record),
      updatedAt: isValidIsoDate(record.lastSaved) ? record.lastSaved : undefined,
      completeness: projectCompleteness(record)
    });
  }
}

function readLegacyRevision(project: BookProject): number {
  const possibleRevision = (project as BookProject & { localRevision?: unknown }).localRevision;
  return typeof possibleRevision === 'number' &&
    Number.isInteger(possibleRevision) &&
    possibleRevision >= 0
    ? possibleRevision
    : 0;
}

function toVersion(candidate: Candidate, localRevision: number): ProjectVersion {
  return {
    versionId: makeVersionId(candidate.project.id, candidate.source, candidate.hash),
    projectId: candidate.project.id,
    localRevision,
    createdAt: new Date().toISOString(),
    source: candidate.source,
    title: candidate.project.title,
    project: structuredClone(candidate.project)
  };
}

function makeVersionId(projectId: string, source: string, hash: string): string {
  return `${projectId}:${source}:${hash}`;
}

function markLocalStorageMigrated(report: MigrationReport): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(
      LOCALSTORAGE_MIGRATION_MARKER,
      JSON.stringify({
        schemaVersion: 1,
        migratedAt: report.runAt,
        projectsMigrated: report.projectsMigrated
      })
    );
    report.legacyLocalStorageMarkedMigrated = true;
  } catch {
    report.legacyLocalStorageMarkedMigrated = false;
  }
}
