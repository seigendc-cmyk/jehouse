import { invoke } from '@tauri-apps/api/core';
import type { SciPathReader } from '../features/sciFile/application/openSciProjectFromPath';
import type { SciReadResult } from '../features/sciFile';

export function isTauriDesktop(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

export const desktopSciPathReader: SciPathReader = {
  read(path, maxBytes) {
    if (!isTauriDesktop()) return Promise.reject(new Error('Desktop filesystem access is unavailable.'));
    return invoke<SciReadResult>('read_sci_file', { path, maxBytes });
  }
};

export async function saveSciToPath(path: string, contents: string): Promise<string> {
  return invoke<string>('write_sci_file', { path, contents });
}
