import React from 'react';
import { CloudOff, HardDrive, ShieldAlert, X } from 'lucide-react';
import { BookProject } from '../types';
import {
  localSaveStatusLabel,
  ProjectSaveState
} from '../persistence/localSaveCoordinator';

interface CloudSyncModalProps {
  project: BookProject;
  isOpen: boolean;
  onClose: () => void;
  saveState: ProjectSaveState;
  isOnline: boolean;
  onSaveNow: () => void;
}

/**
 * Phase 2 security notice. This modal intentionally performs no Firebase operation.
 */
export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  project,
  isOpen,
  onClose,
  saveState,
  isOnline,
  onSaveNow
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-[#262626] border border-[#444444] rounded-xl max-w-lg w-full shadow-2xl p-6 space-y-5 text-gray-100">
        <div className="flex items-center justify-between border-b border-[#333333] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <CloudOff className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Cloud sync disabled</h2>
              <p className="text-xs text-gray-400">Security review is required before Firebase writes resume.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-gray-400 hover:text-white hover:bg-[#333333]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 rounded-lg bg-amber-950/30 border border-amber-500/30 flex gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-bold text-amber-200">Your project remains local and usable</div>
            <p className="text-xs text-amber-100/70 mt-1">
              Current Firestore rules do not provide adequate project isolation. PressCraft will not
              upload, download, or claim to synchronize “{project.title.trim() || 'Untitled Book'}”
              until secure ownership and revision rules are approved.
            </p>
          </div>
        </div>

        <div className="p-4 bg-[#1A1A1A] border border-[#333333] rounded-lg">
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-2.5">
              <HardDrive className="w-4 h-4 text-orange-400 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-white uppercase tracking-wider">Device storage</div>
                <div className="text-xs text-gray-300 mt-1">
                  {localSaveStatusLabel(saveState, isOnline)}
                </div>
                <div className="text-[11px] text-gray-500 mt-0.5">
                  {saveState.lastSavedAt
                    ? `Confirmed ${new Date(saveState.lastSavedAt).toLocaleString()} · Revision ${saveState.localRevision}`
                    : `No confirmed local save yet · Revision ${saveState.localRevision}`}
                </div>
              </div>
            </div>
            <button
              onClick={onSaveNow}
              disabled={saveState.status === 'saving'}
              className="px-3 py-1.5 rounded bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white text-xs font-bold"
            >
              {saveState.status === 'saving' ? 'Saving…' : 'Save locally now'}
            </button>
          </div>
        </div>

        <div className="flex justify-end border-t border-[#333333] pt-3">
          <button onClick={onClose} className="px-4 py-1.5 bg-[#333333] hover:bg-[#444] text-white text-xs font-bold rounded">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
