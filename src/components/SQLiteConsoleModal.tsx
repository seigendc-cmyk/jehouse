import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Terminal, 
  Play, 
  Download, 
  RefreshCw, 
  Table, 
  HardDrive, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Code, 
  Layers, 
  FileText 
} from 'lucide-react';
import { executeRawSQL, getSQLiteStats, downloadSQLiteFile, persistSQLiteDB } from '../lib/sqliteDb';

interface SQLiteConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshProject?: () => void;
}

export const SQLiteConsoleModal: React.FC<SQLiteConsoleModalProps> = ({
  isOpen,
  onClose,
  onRefreshProject
}) => {
  const [query, setQuery] = useState<string>('SELECT id, title, author, category, cloud_synced, last_saved FROM projects;');
  const [columns, setColumns] = useState<string[]>([]);
  const [rows, setRows] = useState<any[][]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [stats, setStats] = useState({ tablesCount: 0, projectsCount: 0, chaptersCount: 0, blocksCount: 0, dbSizeBytes: 0 });
  const [activeTab, setActiveTab] = useState<'console' | 'tables'>('console');
  const [selectedPreset, setSelectedPreset] = useState<string>('projects');

  useEffect(() => {
    if (isOpen) {
      refreshStats();
      runQuery(query);
    }
  }, [isOpen]);

  const refreshStats = async () => {
    const s = await getSQLiteStats();
    setStats(s);
  };

  const runQuery = async (sqlToRun?: string) => {
    const targetQuery = sqlToRun || query;
    setErrorMsg(null);
    const result = await executeRawSQL(targetQuery);
    if (result.error) {
      setErrorMsg(result.error);
      setColumns([]);
      setRows([]);
    } else {
      setColumns(result.columns);
      setRows(result.rows);
      refreshStats();
      if (onRefreshProject) onRefreshProject();
    }
  };

  const loadPreset = (presetKey: string) => {
    setSelectedPreset(presetKey);
    let sql = '';
    switch (presetKey) {
      case 'projects':
        sql = 'SELECT id, title, author, category, trim_size, cloud_synced FROM projects;';
        break;
      case 'chapters':
        sql = 'SELECT id, project_id, chapter_number, title, word_count, status FROM chapters ORDER BY chapter_number ASC;';
        break;
      case 'blocks':
        sql = 'SELECT id, chapter_id, block_type, position, substr(block_text, 1, 40) as preview FROM blocks LIMIT 25;';
        break;
      case 'logs':
        sql = 'SELECT * FROM db_audit_logs ORDER BY id DESC LIMIT 20;';
        break;
      case 'count_words':
        sql = 'SELECT p.title, SUM(c.word_count) as total_words, COUNT(c.id) as chapter_count FROM projects p JOIN chapters c ON p.id = c.project_id GROUP BY p.id;';
        break;
    }
    setQuery(sql);
    runQuery(sql);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-[#212121] border border-[#3d3d3d] rounded-xl max-w-4xl w-full shadow-2xl p-6 space-y-5 text-gray-100 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#333333] pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/40">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                Offline-First SQLite Database Engine
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono">
                  WASM Native SQLite
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                Client-side embedded SQL query engine with automatic offline persistence & zero latency.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-[#333333] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Database Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 shrink-0">
          <div className="p-2.5 bg-[#171717] border border-[#333] rounded-lg">
            <div className="text-[10px] text-gray-400 font-bold uppercase">Relational Tables</div>
            <div className="text-sm font-mono font-bold text-white mt-0.5">{stats.tablesCount} Tables</div>
          </div>
          <div className="p-2.5 bg-[#171717] border border-[#333] rounded-lg">
            <div className="text-[10px] text-gray-400 font-bold uppercase">Stored Projects</div>
            <div className="text-sm font-mono font-bold text-emerald-400 mt-0.5">{stats.projectsCount} Books</div>
          </div>
          <div className="p-2.5 bg-[#171717] border border-[#333] rounded-lg">
            <div className="text-[10px] text-gray-400 font-bold uppercase">Stored Chapters</div>
            <div className="text-sm font-mono font-bold text-blue-400 mt-0.5">{stats.chaptersCount} Chapters</div>
          </div>
          <div className="p-2.5 bg-[#171717] border border-[#333] rounded-lg">
            <div className="text-[10px] text-gray-400 font-bold uppercase">Content Blocks</div>
            <div className="text-sm font-mono font-bold text-amber-400 mt-0.5">{stats.blocksCount} Blocks</div>
          </div>
          <div className="p-2.5 bg-[#171717] border border-[#333] rounded-lg col-span-2 sm:col-span-1">
            <div className="text-[10px] text-gray-400 font-bold uppercase">SQLite DB Size</div>
            <div className="text-sm font-mono font-bold text-orange-400 mt-0.5">
              {(stats.dbSizeBytes / 1024).toFixed(1)} KB
            </div>
          </div>
        </div>

        {/* Console Presets Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#333] pb-3 shrink-0 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[11px] text-gray-400 font-bold uppercase mr-1">SQL Queries:</span>
            <button
              onClick={() => loadPreset('projects')}
              className={`px-2.5 py-1 rounded font-mono text-[11px] transition-colors cursor-pointer ${
                selectedPreset === 'projects' ? 'bg-[#FF6B00] text-black font-bold' : 'bg-[#2A2A2A] text-gray-300 hover:bg-[#333]'
              }`}
            >
              projects
            </button>
            <button
              onClick={() => loadPreset('chapters')}
              className={`px-2.5 py-1 rounded font-mono text-[11px] transition-colors cursor-pointer ${
                selectedPreset === 'chapters' ? 'bg-[#FF6B00] text-black font-bold' : 'bg-[#2A2A2A] text-gray-300 hover:bg-[#333]'
              }`}
            >
              chapters
            </button>
            <button
              onClick={() => loadPreset('blocks')}
              className={`px-2.5 py-1 rounded font-mono text-[11px] transition-colors cursor-pointer ${
                selectedPreset === 'blocks' ? 'bg-[#FF6B00] text-black font-bold' : 'bg-[#2A2A2A] text-gray-300 hover:bg-[#333]'
              }`}
            >
              blocks
            </button>
            <button
              onClick={() => loadPreset('count_words')}
              className={`px-2.5 py-1 rounded font-mono text-[11px] transition-colors cursor-pointer ${
                selectedPreset === 'count_words' ? 'bg-[#FF6B00] text-black font-bold' : 'bg-[#2A2A2A] text-gray-300 hover:bg-[#333]'
              }`}
            >
              word_aggregates
            </button>
            <button
              onClick={() => loadPreset('logs')}
              className={`px-2.5 py-1 rounded font-mono text-[11px] transition-colors cursor-pointer ${
                selectedPreset === 'logs' ? 'bg-[#FF6B00] text-black font-bold' : 'bg-[#2A2A2A] text-gray-300 hover:bg-[#333]'
              }`}
            >
              audit_logs
            </button>
          </div>

          <button
            onClick={() => downloadSQLiteFile()}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#2A2A2A] hover:bg-[#383838] text-white border border-[#444] rounded text-xs font-bold transition-colors cursor-pointer shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            Export SQLite File (.sqlite)
          </button>
        </div>

        {/* SQL Query Editor Input */}
        <div className="space-y-2 shrink-0">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="font-bold flex items-center gap-1.5 text-white uppercase tracking-wider">
              <Terminal className="w-3.5 h-3.5 text-[#FF6B00]" />
              SQLite Query Terminal
            </span>
            <span>Standard SQLite3 SQL Syntax</span>
          </div>

          <div className="relative">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={3}
              className="w-full p-3 bg-[#141414] border border-[#333333] rounded-lg font-mono text-xs text-emerald-400 focus:outline-hidden focus:border-[#FF6B00] resize-none"
              placeholder="Enter SQLite query (e.g. SELECT * FROM projects;)..."
            />
            <button
              onClick={() => runQuery()}
              className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-[#FF6B00] hover:bg-orange-600 text-black font-bold text-xs rounded transition-colors cursor-pointer shadow-md"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Execute SQL
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-red-950/70 border border-red-500/50 rounded-lg flex items-center gap-2 text-xs text-red-300 shrink-0">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="font-mono">{errorMsg}</span>
          </div>
        )}

        {/* Query Results Table */}
        <div className="flex-1 min-h-[160px] overflow-auto border border-[#333333] rounded-lg bg-[#141414]">
          {columns.length > 0 ? (
            <table className="w-full text-left text-xs text-gray-200 border-collapse">
              <thead className="bg-[#1F1F1F] text-gray-400 uppercase font-mono text-[10px] sticky top-0 border-b border-[#333]">
                <tr>
                  {columns.map((col, idx) => (
                    <th key={idx} className="p-2.5 font-bold border-r border-[#333] last:border-r-0">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626] font-mono text-[11px]">
                {rows.length > 0 ? (
                  rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-[#1C1C1C] transition-colors">
                      {row.map((val, cIdx) => (
                        <td key={cIdx} className="p-2.5 border-r border-[#262626] last:border-r-0 max-w-xs truncate">
                          {val === null ? (
                            <span className="text-gray-600 italic">NULL</span>
                          ) : typeof val === 'object' ? (
                            JSON.stringify(val)
                          ) : (
                            String(val)
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="p-6 text-center text-gray-500">
                      Query completed successfully. 0 rows returned.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : !errorMsg ? (
            <div className="p-8 text-center text-gray-500 text-xs">
              Execute a query above to view relational SQLite output rows.
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="border-t border-[#333333] pt-3 flex items-center justify-between text-xs text-gray-400 shrink-0">
          <div className="flex items-center gap-2 text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>SQLite3 WASM Driver Active • Fully Offline Capable</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#333333] hover:bg-[#444] text-white font-bold rounded transition-colors cursor-pointer"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
