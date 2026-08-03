import type { BookProject } from '../../../types';
import { deserializeSciBytes } from '../services/sciDeserializer';
import { SCI_MAX_FILE_SIZE_BYTES, SciOpenError, SciReadResult } from '../types/sciFile.types';

export interface SciPathReader { read(path: string, maxBytes: number): Promise<SciReadResult>; }

export function normalizeSciPath(filePath: string): string {
  const normalized = filePath.trim().replace(/^"|"$/g, '');
  if (!normalized || /[\0\r\n]/.test(normalized)) throw new SciOpenError('NOT_A_FILE', 'The selected path is invalid.');
  if (!normalized.toLocaleLowerCase().endsWith('.sci')) throw new SciOpenError('INVALID_EXTENSION', 'Select a file ending in .sci.');
  return normalized;
}

export async function openSciProjectFromPath(
  filePath: string,
  reader: SciPathReader
): Promise<{ project: BookProject; sourcePath: string }> {
  const normalized = normalizeSciPath(filePath);
  const result = await reader.read(normalized, SCI_MAX_FILE_SIZE_BYTES);
  const parsed = deserializeSciBytes(Uint8Array.from(result.bytes));
  return { project: parsed.project, sourcePath: result.path };
}
