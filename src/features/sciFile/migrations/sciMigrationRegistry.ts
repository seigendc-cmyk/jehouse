import { migrateStoredProject } from '../../../persistence/projectSchema';
import type { StoredProject } from '../../../persistence/types';
import { SCI_SCHEMA_VERSION, SciOpenError } from '../types/sciFile.types';

export function migrateSciProject(schemaVersion: number, project: unknown): StoredProject {
  if (!Number.isInteger(schemaVersion) || schemaVersion < 1) {
    throw new SciOpenError('TOO_OLD', 'This project version is too old and cannot be migrated.');
  }
  if (schemaVersion > SCI_SCHEMA_VERSION) {
    throw new SciOpenError('FUTURE_VERSION', 'This project was created by a newer unsupported PressCraft version.');
  }
  const migrated = migrateStoredProject(project);
  if (!migrated) {
    const storedVersion = (project as { schemaVersion?: unknown } | null)?.schemaVersion;
    if (typeof storedVersion === 'number' && storedVersion > 6) {
      throw new SciOpenError('FUTURE_VERSION', 'This project was created by a newer unsupported PressCraft version.');
    }
    throw new SciOpenError('INVALID_SCI', 'This file is not a valid PressCraft SCI Book Project or may be damaged.');
  }
  return migrated;
}
