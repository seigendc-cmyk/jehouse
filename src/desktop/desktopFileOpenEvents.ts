import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';
import { isTauriDesktop } from './desktopFileOpenGateway';

export const SCI_FILE_OPEN_EVENT = 'presscraft://open-sci-files';

export async function listenForSciFileOpen(handler: (paths: string[]) => void): Promise<UnlistenFn> {
  if (!isTauriDesktop()) return () => undefined;
  const unlisten = await listen<string[]>(SCI_FILE_OPEN_EVENT, ({ payload }) => handler(payload));
  const pending = await invoke<string[]>('take_pending_sci_files');
  if (pending.length) handler(pending);
  return unlisten;
}
