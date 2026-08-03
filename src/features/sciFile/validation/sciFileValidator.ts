import { isValidIsoDate } from '../../../persistence/projectSchema';
import type { BookProject } from '../../../types';
import { computeSciChecksum } from '../services/sciSerializer';
import { migrateSciProject } from '../migrations/sciMigrationRegistry';
import { SCI_FORMAT, SciFileEnvelope, SciOpenError } from '../types/sciFile.types';

const UNSAFE_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

export function parseAndValidateSci(text: string): { envelope: SciFileEnvelope; project: BookProject } {
  let value: unknown;
  try { value = JSON.parse(text); } catch (cause) {
    throw new SciOpenError('MALFORMED', 'This file is not a valid PressCraft SCI Book Project or may be damaged.', cause);
  }
  assertSafeObjectGraph(value);
  if (!value || typeof value !== 'object') invalid();
  const input = value as Partial<SciFileEnvelope>;
  if (input.format !== SCI_FORMAT || input.application !== 'PressCraft Book Publisher') invalid();
  if (!isValidIsoDate(input.createdAt) || !isValidIsoDate(input.updatedAt)) invalid();
  const record = migrateSciProject(input.schemaVersion as number, input.project);
  if (!input.integrity || input.integrity.algorithm !== 'fnv1a-32' ||
      input.integrity.checksum !== computeSciChecksum(input.project)) {
    throw new SciOpenError('INTEGRITY_FAILED', 'Integrity verification failed. The SCI file may be damaged or modified.');
  }
  validateUniqueIds(record.project);
  validatePortableContent(record.project);
  return { envelope: { ...input, project: record } as SciFileEnvelope, project: structuredClone(record.project) };
}

function invalid(): never {
  throw new SciOpenError('INVALID_SCI', 'This file is not a valid PressCraft SCI Book Project or may be damaged.');
}

function assertSafeObjectGraph(value: unknown): void {
  const pending: unknown[] = [value];
  while (pending.length) {
    const current = pending.pop();
    if (!current || typeof current !== 'object') continue;
    for (const key of Object.keys(current)) {
      if (UNSAFE_KEYS.has(key)) throw new SciOpenError('UNSAFE_CONTENT', 'The SCI file contains unsafe data.');
      pending.push((current as Record<string, unknown>)[key]);
    }
  }
}

function validateUniqueIds(project: BookProject): void {
  const ids = new Set<string>();
  const add = (id: unknown) => {
    if (typeof id !== 'string' || !id.trim()) invalid();
    if (ids.has(id)) throw new SciOpenError('DUPLICATE_ID', 'The SCI file contains duplicate document identifiers.');
    ids.add(id);
  };
  add(project.id);
  for (const chapter of project.chapters) {
    add(chapter.id);
    for (const block of chapter.blocks) add(block.id);
  }
  for (const asset of project.assets ?? []) add(asset.id);
}

function validatePortableContent(project: BookProject): void {
  const drivePath = /^[a-zA-Z]:[\\/]/;
  const traversal = /(^|[\\/])\.\.([\\/]|$)/;
  for (const asset of project.assets ?? []) {
    const candidate = String((asset as unknown as { name?: unknown }).name ?? '');
    if (drivePath.test(candidate) || candidate.startsWith('\\\\') || candidate.startsWith('/') || traversal.test(candidate)) {
      throw new SciOpenError('UNSAFE_CONTENT', 'The SCI file contains an unsafe asset filename.');
    }
  }
}
