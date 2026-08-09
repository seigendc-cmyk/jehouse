import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('CloudSyncModal security state', () => {
  it('uses explicit Firebase upload/download callbacks without simulated sync state', () => {
    const source = readFileSync(new URL('./CloudSyncModal.tsx', import.meta.url), 'utf8');
    expect(source).toContain('Firebase Cloud Sync');
    expect(source).toContain('onUpload: () => Promise<string>');
    expect(source).toContain('onDownload: () => Promise<string>');
    expect(source).toContain('revision-checked transactions');
    expect(source).not.toContain('syncProjectToCloud');
    expect(source).not.toContain('Restore Snapshot');
    expect(source).not.toContain('setTimeout');
  });
});
