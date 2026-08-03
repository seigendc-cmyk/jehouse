import type { StoredProject } from '../../../persistence/types';

export const SCI_FORMAT = 'presscraft-sci';
export const SCI_SCHEMA_VERSION = 1;
export const SCI_MIME_TYPE = 'application/vnd.presscraft.sci';
export const SCI_MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

export interface SciFileEnvelope {
  format: typeof SCI_FORMAT;
  schemaVersion: number;
  application: 'PressCraft Book Publisher';
  createdAt: string;
  updatedAt: string;
  project: StoredProject;
  integrity: { algorithm: 'fnv1a-32'; checksum: string };
}

export type SciOpenErrorCode =
  | 'INVALID_EXTENSION' | 'NOT_A_FILE' | 'NOT_READABLE' | 'FILE_TOO_LARGE'
  | 'MALFORMED' | 'INVALID_SCI' | 'TOO_OLD' | 'FUTURE_VERSION'
  | 'INTEGRITY_FAILED' | 'DUPLICATE_ID' | 'UNSAFE_CONTENT' | 'CANCELLED';

export class SciOpenError extends Error {
  constructor(readonly code: SciOpenErrorCode, message: string, readonly cause?: unknown) {
    super(message);
    this.name = 'SciOpenError';
  }
}

export interface SciReadResult { path: string; bytes: number[]; }
