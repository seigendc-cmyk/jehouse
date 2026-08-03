import { wrapLegacyProject } from '../../../persistence/projectSchema';
import type { BookProject } from '../../../types';
import { SCI_FORMAT, SCI_SCHEMA_VERSION, SciFileEnvelope } from '../types/sciFile.types';

export function computeSciChecksum(value: unknown): string {
  const canonical = JSON.stringify(value);
  let checksum = 2166136261;
  for (let index = 0; index < canonical.length; index += 1) {
    checksum ^= canonical.charCodeAt(index);
    checksum = Math.imul(checksum, 16777619);
  }
  return (checksum >>> 0).toString(16).padStart(8, '0');
}

export function serializeSciProject(project: BookProject, now = new Date().toISOString()): string {
  const stored = wrapLegacyProject(structuredClone(project), { createdAt: now, updatedAt: now });
  const envelope: SciFileEnvelope = {
    format: SCI_FORMAT, schemaVersion: SCI_SCHEMA_VERSION,
    application: 'PressCraft Book Publisher', createdAt: now, updatedAt: now,
    project: stored, integrity: { algorithm: 'fnv1a-32', checksum: computeSciChecksum(stored) }
  };
  return JSON.stringify(envelope, null, 2);
}
