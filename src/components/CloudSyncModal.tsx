import React, { useState } from 'react';
import { Cloud, Download, HardDrive, ShieldCheck, Upload, X } from 'lucide-react';
import type { BookProject } from '../types';
import { localSaveStatusLabel, type ProjectSaveState } from '../persistence/localSaveCoordinator';

interface Props {
  project: BookProject; isOpen: boolean; onClose: () => void;
  saveState: ProjectSaveState; isOnline: boolean; onSaveNow: () => void;
  onUpload: () => Promise<string>; onDownload: () => Promise<string>;
}

export const CloudSyncModal: React.FC<Props> = ({ project, isOpen, onClose, saveState, isOnline, onSaveNow, onUpload, onDownload }) => {
  const [operation, setOperation] = useState<'upload' | 'download'>();
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();
  if (!isOpen) return null;
  const run = async (kind: 'upload' | 'download') => {
    setOperation(kind); setMessage(undefined); setError(undefined);
    try { setMessage(await (kind === 'upload' ? onUpload() : onDownload())); }
    catch (reason) { console.error('[Firebase sync]', reason); setError(reason instanceof Error ? reason.message : 'Firebase sync failed.'); }
    finally { setOperation(undefined); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="cloud-sync-title">
      <div className="w-full max-w-lg space-y-5 rounded-xl border border-[#444] bg-[#262626] p-6 text-gray-100 shadow-2xl">
        <header className="flex items-center justify-between border-b border-[#333] pb-3">
          <div className="flex items-center gap-2.5"><Cloud className="h-6 w-6 text-sky-400" /><div><h2 id="cloud-sync-title" className="font-bold">Firebase Cloud Sync</h2><p className="text-xs text-gray-400">Private anonymous account storage</p></div></div>
          <button onClick={onClose} aria-label="Close cloud sync" className="rounded p-1 hover:bg-[#333]"><X className="h-5 w-5" /></button>
        </header>
        <div className="flex gap-3 rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-4"><ShieldCheck className="h-5 w-5 shrink-0 text-emerald-400" /><p className="text-xs leading-5 text-emerald-100">Projects are stored under the authenticated Firebase user ID. Uploads use revision-checked transactions; downloads require an explicit action.</p></div>
        <div className="rounded-lg border border-[#333] bg-[#1a1a1a] p-4"><div className="flex justify-between gap-4"><div className="flex gap-2.5"><HardDrive className="mt-0.5 h-4 w-4 text-orange-400" /><div><div className="text-xs font-bold uppercase">{project.title.trim() || 'Untitled Book'}</div><div className="mt-1 text-xs text-gray-300">{localSaveStatusLabel(saveState, isOnline)} · Revision {saveState.localRevision}</div></div></div><button onClick={onSaveNow} disabled={saveState.status === 'saving'} className="rounded bg-orange-600 px-3 py-1.5 text-xs font-bold disabled:opacity-50">Save locally</button></div></div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => void run('upload')} disabled={!isOnline || !!operation} className="flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-3 text-sm font-bold disabled:opacity-40"><Upload className="h-4 w-4" />{operation === 'upload' ? 'Uploading…' : 'Upload latest'}</button>
          <button onClick={() => void run('download')} disabled={!isOnline || !!operation} className="flex items-center justify-center gap-2 rounded-lg border border-sky-500/50 px-4 py-3 text-sm font-bold text-sky-200 disabled:opacity-40"><Download className="h-4 w-4" />{operation === 'download' ? 'Downloading…' : 'Download cloud copy'}</button>
        </div>
        {!isOnline ? <p className="text-xs text-amber-300">Connect to the internet to use Firebase sync.</p> : null}
        {message ? <p role="status" className="rounded bg-emerald-950/40 p-3 text-xs text-emerald-200">{message}</p> : null}
        {error ? <p role="alert" className="rounded bg-red-950/40 p-3 text-xs text-red-200">{error}</p> : null}
      </div>
    </div>
  );
};
