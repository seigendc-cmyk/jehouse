import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('CloudSyncModal security state', () => {
  it('contains no simulated sync action or fabricated revision history', () => {
    const source = readFileSync(new URL('./CloudSyncModal.tsx', import.meta.url), 'utf8');
    expect(source).toContain('Cloud sync disabled');
    expect(source).toContain('performs no Firebase operation');
    expect(source).not.toContain('syncProjectToCloud');
    expect(source).not.toContain('Sync Now');
    expect(source).not.toContain('Synced');
    expect(source).not.toContain('Restore Snapshot');
    expect(source).not.toContain('setTimeout');
  });
});
