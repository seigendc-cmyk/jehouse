import { describe, expect, it, vi } from 'vitest';
import { ProjectSaveState } from '../persistence/localSaveCoordinator';
import { applyUpdateWhenSafe } from './updatePolicy';

const saved: ProjectSaveState = {
  status: 'saved',
  localRevision: 4,
  lastSavedAt: '2026-07-29T09:24:00.000Z'
};

describe('applyUpdateWhenSafe', () => {
  it('applies an update immediately when work is confirmed saved', async () => {
    const saveNow = vi.fn();
    const applyUpdate = vi.fn().mockResolvedValue(undefined);
    expect(await applyUpdateWhenSafe(saved, saveNow, applyUpdate)).toBe('updated');
    expect(saveNow).not.toHaveBeenCalled();
    expect(applyUpdate).toHaveBeenCalledOnce();
  });

  it('saves dirty work before applying the update', async () => {
    const saveNow = vi.fn().mockResolvedValue({ ...saved, localRevision: 5 });
    const applyUpdate = vi.fn().mockResolvedValue(undefined);
    expect(
      await applyUpdateWhenSafe({ ...saved, status: 'dirty' }, saveNow, applyUpdate)
    ).toBe('updated');
    expect(saveNow).toHaveBeenCalledOnce();
    expect(applyUpdate).toHaveBeenCalledOnce();
  });

  it('does not activate or reload when the local save fails', async () => {
    const saveNow = vi.fn().mockResolvedValue({
      ...saved,
      status: 'error',
      error: { code: 'SAVE_FAILED', message: 'failed', retryable: true }
    });
    const applyUpdate = vi.fn();
    expect(
      await applyUpdateWhenSafe({ ...saved, status: 'dirty' }, saveNow, applyUpdate)
    ).toBe('blocked');
    expect(applyUpdate).not.toHaveBeenCalled();
  });
});
