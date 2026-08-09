import { describe, expect, it, vi } from 'vitest';
import { createEmptyBookProject } from '../../data/createEmptyBookProject';
import { wrapLegacyProject } from '../../persistence/projectSchema';
import { openSciProjectFromPath, normalizeSciPath } from './application/openSciProjectFromPath';
import { deserializeSciBytes } from './services/sciDeserializer';
import { computeSciChecksum, serializeSciProject } from './services/sciSerializer';
import { SCI_MAX_FILE_SIZE_BYTES, SciOpenError } from './types/sciFile.types';

const bytes = (text: string) => new TextEncoder().encode(text);
const project = () => createEmptyBookProject({ title: 'SCI Test Book' });
const envelope = () => JSON.parse(serializeSciProject(project(), '2026-08-03T12:00:00.000Z'));
const resign = (value: any) => { value.integrity.checksum = computeSciChecksum(value.project); return value; };

describe('SCI validation and serialization', () => {
  it('accepts a valid canonical envelope without mutating it', () => {
    const source = serializeSciProject(project());
    const before = source.slice();
    expect(deserializeSciBytes(bytes(source)).project.title).toBe('SCI Test Book');
    expect(source).toBe(before);
  });
  it.each(['book.SCI', 'book.sCi', ' C:\\Books\\She Lost It All.sci '])('recognizes SCI paths case-insensitively', (path) => {
    expect(normalizeSciPath(path).toLowerCase().endsWith('.sci')).toBe(true);
  });
  it('normalizes a quoted path and rejects invalid extensions', () => {
    expect(normalizeSciPath('"C:\\Books\\A Book.sci"')).toBe('C:\\Books\\A Book.sci');
    expect(() => normalizeSciPath('book.json')).toThrowError(SciOpenError);
  });
  it('rejects malformed and missing required data', () => {
    expect(() => deserializeSciBytes(bytes('{bad'))).toThrowError(/valid PressCraft/);
    const value = envelope(); delete value.application;
    expect(() => deserializeSciBytes(bytes(JSON.stringify(value)))).toThrowError(/valid PressCraft/);
  });
  it('rejects old and future SCI versions', () => {
    const old = resign({ ...envelope(), schemaVersion: 0 });
    const future = resign({ ...envelope(), schemaVersion: 2 });
    expect(() => deserializeSciBytes(bytes(JSON.stringify(old)))).toThrowError(/too old/);
    expect(() => deserializeSciBytes(bytes(JSON.stringify(future)))).toThrowError(/newer unsupported/);
  });
  it('invokes the stored-project migration path', () => {
    const value = envelope(); value.project.schemaVersion = 5;
    delete value.project.project.mathPublishing; delete value.project.project.accountingFormat;
    resign(value);
    expect(deserializeSciBytes(bytes(JSON.stringify(value))).envelope.project.schemaVersion).toBe(7);
  });
  it('rejects integrity mismatches and excessive input', () => {
    const value = envelope(); value.project.project.title = 'Tampered';
    expect(() => deserializeSciBytes(bytes(JSON.stringify(value)))).toThrowError(/Integrity/);
    expect(() => deserializeSciBytes(new Uint8Array(SCI_MAX_FILE_SIZE_BYTES + 1))).toThrowError(/too large/);
  });
  it('rejects duplicate IDs, unsafe filenames, and prototype-pollution keys', () => {
    const duplicate = envelope(); duplicate.project.project.chapters[0].id = duplicate.project.project.id; resign(duplicate);
    expect(() => deserializeSciBytes(bytes(JSON.stringify(duplicate)))).toThrowError(/duplicate/);
    const unsafe = envelope(); unsafe.project.project.assets = [{ id: 'asset-1', name: '../escape.png' }]; resign(unsafe);
    expect(() => deserializeSciBytes(bytes(JSON.stringify(unsafe)))).toThrowError(/unsafe asset/);
    const polluted = serializeSciProject(project()).replace('"format":', '"__proto__": {}, "format":');
    expect(() => deserializeSciBytes(bytes(polluted))).toThrowError(/unsafe data/);
  });
});

describe('external SCI path opening', () => {
  it('passes the normalized path through one reader and returns the source path', async () => {
    const reader = { read: vi.fn().mockResolvedValue({ path: 'C:\\Books\\A Book.sci', bytes: [...bytes(serializeSciProject(project()))] }) };
    const opened = await openSciProjectFromPath('"C:\\Books\\A Book.sci"', reader);
    expect(reader.read).toHaveBeenCalledWith('C:\\Books\\A Book.sci', SCI_MAX_FILE_SIZE_BYTES);
    expect(opened.sourcePath).toBe('C:\\Books\\A Book.sci');
    expect(opened.project.title).toBe('SCI Test Book');
  });
  it('does not call the filesystem reader for an invalid extension', async () => {
    const reader = { read: vi.fn() };
    await expect(openSciProjectFromPath('book.exe', reader)).rejects.toMatchObject({ code: 'INVALID_EXTENSION' });
    expect(reader.read).not.toHaveBeenCalled();
  });
});
