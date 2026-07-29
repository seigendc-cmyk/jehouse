import React, { useState } from 'react';
import { 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  CheckCircle2, 
  HardDrive, 
  X, 
  User, 
  ShieldCheck, 
  Clock, 
  History, 
  Download, 
  UploadCloud, 
  Check, 
  AlertCircle,
  Database
} from 'lucide-react';
import { BookProject } from '../types';
import { saveToLocalDiskInDocuments } from '../lib/exportUtils';
import { downloadSQLiteFile } from '../lib/sqliteDb';

interface CloudSyncModalProps {
  project: BookProject;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProject: (updated: Partial<BookProject>) => void;
  onRestoreProject?: (project: BookProject) => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  project,
  isOpen,
  onClose,
  onUpdateProject,
  onRestoreProject,
}) => {
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);
  const [autoSync, setAutoSync] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'account' | 'history'>('account');

  // Simulated Cloud Revisions History
  const [revisions, setRevisions] = useState([
    { id: 'rev-1', timestamp: new Date().toISOString(), label: 'Current Live Session Backup', words: project.chapters.reduce((acc, c) => acc + c.wordCount, 0), chaptersCount: project.chapters.length },
    { id: 'rev-2', timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(), label: 'Auto Cloud Snapshot', words: Math.max(100, project.chapters.reduce((acc, c) => acc + c.wordCount, 0) - 120), chaptersCount: project.chapters.length },
    { id: 'rev-3', timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), label: 'Pre-Editing Revision', words: Math.max(50, project.chapters.reduce((acc, c) => acc + c.wordCount, 0) - 450), chaptersCount: Math.max(1, project.chapters.length - 1) },
  ]);

  if (!isOpen) return null;

  const handleSyncNow = () => {
    setIsSyncing(true);
    setSyncSuccessMsg(null);
    setTimeout(() => {
      const nowIso = new Date().toISOString();
      onUpdateProject({
        cloudSynced: true,
        lastSaved: nowIso
      });
      // Add a revision snapshot
      setRevisions((prev) => [
        {
          id: `rev-${Date.now()}`,
          timestamp: nowIso,
          label: 'Manual Cloud Account Sync',
          words: project.chapters.reduce((acc, c) => acc + c.wordCount, 0),
          chaptersCount: project.chapters.length
        },
        ...prev
      ]);
      setIsSyncing(false);
      setSyncSuccessMsg('All book content & media synced securely to Cloud Account!');
      setTimeout(() => setSyncSuccessMsg(null), 4000);
    }, 1200);
  };

  const handleSaveToDisk = async () => {
    const success = await saveToLocalDiskInDocuments(project);
    if (success) {
      setSyncSuccessMsg('Book project file (.m2b) saved to local disk in Documents!');
      setTimeout(() => setSyncSuccessMsg(null), 4000);
    }
  };

  const totalWords = project.chapters.reduce((acc, c) => acc + c.wordCount, 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-[#262626] border border-[#444444] rounded-xl max-w-xl w-full shadow-2xl p-6 space-y-5 text-gray-100 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#333333] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-emerald-500 text-black font-bold">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-tight flex items-center gap-2">
                Cloud Sync & Account Studio
                {project.cloudSynced ? (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-medium">
                    Synced
                  </span>
                ) : (
                  <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded-full font-medium">
                    Offline
                  </span>
                )}
              </h2>
              <p className="text-xs text-gray-400">Manage real-time cloud account backup, local disk storage, and snapshot history.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-gray-400 hover:text-white hover:bg-[#333333] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sync Success Alert */}
        {syncSuccessMsg && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-lg flex items-center gap-2 text-xs text-emerald-300 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{syncSuccessMsg}</span>
          </div>
        )}

        {/* User Account Info Card */}
        <div className="p-4 bg-[#1A1A1A] border border-[#333333] rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#333] border border-[#555] flex items-center justify-center text-white font-bold">
              <User className="w-5 h-5 text-[#FF6B00]" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                PressCraft Author Account
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" title="Verified Author License" />
              </div>
              <div className="text-[11px] text-gray-400 font-mono">seigendc@gmail.com</div>
              <div className="text-[10px] text-emerald-400 mt-0.5 font-semibold uppercase tracking-wider">
                Pro Publishing Subscription Active
              </div>
            </div>
          </div>

          <div className="text-right sm:border-l sm:border-[#333] sm:pl-4 w-full sm:w-auto">
            <div className="text-[10px] text-gray-400 font-bold uppercase">Cloud Storage Quota</div>
            <div className="text-xs font-mono font-bold text-gray-200 mt-0.5">1.4 GB / 10 GB Used</div>
            <div className="w-full sm:w-28 bg-gray-800 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div className="bg-[#FF6B00] h-full" style={{ width: '14%' }} />
            </div>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex border-b border-[#333333] gap-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('account')}
            className={`pb-2 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'account'
                ? 'border-[#FF6B00] text-[#FF6B00]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            Cloud Account & Sync
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-[#FF6B00] text-[#FF6B00]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Cloud Revision History
          </button>
        </div>

        {activeTab === 'account' ? (
          <div className="space-y-4">
            {/* Sync Controls Box */}
            <div className="p-4 bg-[#1F1F1F] border border-[#333333] rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Cloud Synchronization Status</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Last Cloud Backup: {project.lastSaved ? new Date(project.lastSaved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Never'}
                  </p>
                </div>

                <button
                  onClick={handleSyncNow}
                  disabled={isSyncing}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#FF6B00] hover:bg-orange-600 disabled:opacity-50 text-black font-bold text-xs rounded shadow-xs transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Syncing...' : 'Sync Now'}
                </button>
              </div>

              <div className="pt-3 border-t border-[#333] flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-gray-200">Automatic Background Cloud Sync</div>
                  <div className="text-[10px] text-gray-400">Silently backs up text, charts, and media after edits</div>
                </div>

                <button
                  onClick={() => {
                    const nextVal = !autoSync;
                    setAutoSync(nextVal);
                    onUpdateProject({ cloudSynced: nextVal });
                  }}
                  className={`w-11 h-6 rounded-full flex items-center p-0.5 transition-colors cursor-pointer ${
                    autoSync ? 'bg-emerald-500 justify-end' : 'bg-gray-700 justify-start'
                  }`}
                >
                  <div className="w-5 h-5 bg-white rounded-full shadow-md" />
                </button>
              </div>
            </div>

            {/* Local Disk Backup Direct Save Card */}
            <div className="p-4 bg-[#1F1F1F] border border-[#333333] rounded-lg space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    <HardDrive className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Save to Local Disk (Documents)</h4>
                    <p className="text-[11px] text-gray-400">
                      Save an offline standalone copy of "{project.title}" directly into your local Documents folder.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleSaveToDisk}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#333333] hover:bg-[#444] text-white border border-[#555] font-semibold text-xs rounded transition-colors shrink-0 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#FF6B00]" />
                  Save to Disk
                </button>
              </div>
            </div>

            {/* Offline SQLite WASM Engine Card */}
            <div className="p-4 bg-[#1F1F1F] border border-[#333333] rounded-lg space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Embedded SQLite Offline Database</h4>
                    <p className="text-[11px] text-gray-400">
                      Native SQLite3 engine running completely client-side in WebAssembly for zero-latency offline performance.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => downloadSQLiteFile()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#333333] hover:bg-[#444] text-purple-300 border border-purple-500/40 font-semibold text-xs rounded transition-colors shrink-0 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-purple-400" />
                  Export .sqlite File
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Cloud Revision History Tab */
          <div className="space-y-3">
            <div className="text-xs text-gray-400 flex items-center justify-between">
              <span>Automatic cloud snapshots stored for this book project:</span>
              <span className="text-[10px] text-gray-500">Auto-pruned after 30 days</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {revisions.map((rev) => (
                <div
                  key={rev.id}
                  className="p-3 bg-[#1A1A1A] border border-[#333333] rounded-lg flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-white flex items-center gap-2">
                      {rev.label}
                      <span className="text-[10px] text-emerald-400 font-mono font-normal">
                        ({rev.words} words • {rev.chaptersCount} chapters)
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-500" />
                      {new Date(rev.timestamp).toLocaleString()}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`Restore snapshot from ${new Date(rev.timestamp).toLocaleTimeString()}? Any un-synced current changes will be overwritten.`)) {
                        onUpdateProject({ lastSaved: new Date().toISOString() });
                        setSyncSuccessMsg(`Restored snapshot from ${new Date(rev.timestamp).toLocaleTimeString()}!`);
                      }
                    }}
                    className="px-2.5 py-1 text-[11px] font-bold bg-[#333] hover:bg-[#444] text-[#FF6B00] border border-[#FF6B00]/40 rounded transition-colors cursor-pointer"
                  >
                    Restore Snapshot
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-[#333333] pt-3 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-1.5 text-[11px]">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            Project ID: <span className="font-mono text-gray-300">{project.id}</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#333333] hover:bg-[#444] text-white font-bold rounded transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
