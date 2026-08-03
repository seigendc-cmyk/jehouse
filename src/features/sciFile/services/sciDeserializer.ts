import { parseAndValidateSci } from '../validation/sciFileValidator';
import { SCI_MAX_FILE_SIZE_BYTES, SciOpenError } from '../types/sciFile.types';

export function deserializeSciBytes(bytes: Uint8Array) {
  if (bytes.byteLength > SCI_MAX_FILE_SIZE_BYTES) {
    throw new SciOpenError('FILE_TOO_LARGE', 'This SCI file is too large to open safely.');
  }
  let text: string;
  try { text = new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
  catch (cause) { throw new SciOpenError('MALFORMED', 'This file is not valid UTF-8 SCI data.', cause); }
  return parseAndValidateSci(text);
}

export async function deserializeSciFile(file: File) {
  if (!file.name.toLocaleLowerCase().endsWith('.sci')) throw new SciOpenError('INVALID_EXTENSION', 'Select a file ending in .sci.');
  if (file.size > SCI_MAX_FILE_SIZE_BYTES) throw new SciOpenError('FILE_TOO_LARGE', 'This SCI file is too large to open safely.');
  return deserializeSciBytes(new Uint8Array(await file.arrayBuffer()));
}
