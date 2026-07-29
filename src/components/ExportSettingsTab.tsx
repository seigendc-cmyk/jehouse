import React, { useState } from 'react';
import { 
  Printer, 
  BookMarked, 
  SlidersHorizontal, 
  Download, 
  FileCode, 
  FileText, 
  BookOpen, 
  Package, 
  Eye, 
  Check, 
  FileSpreadsheet,
  HardDrive
} from 'lucide-react';
import { BookProject, ExportSettings, TrimSize, MarginPreset, BibliographyEntry } from '../types';
import { GOOGLE_FONTS } from '../lib/googleFonts';
import { 
  exportToPDF, 
  exportToEPUB, 
  exportToMarkdown, 
  exportToTxt, 
  exportToHTML, 
  exportToWordDocx, 
  exportProjectJSON, 
  exportOfflineShellJSON, 
  exportToLaTeX, 
  exportToBibTeX,
  resolveMargins,
  saveToLocalDiskInDocuments
} from '../lib/exportUtils';
import { BibliographyManager } from './BibliographyManager';

interface ExportSettingsTabProps {
  project: BookProject;
  onUpdateExportSettings: (updatedSettings: ExportSettings) => void;
  onUpdateBibliography: (bibliography: BibliographyEntry[]) => void;
  onOpenPrintPreview?: () => void;
}

export const ExportSettingsTab: React.FC<ExportSettingsTabProps> = ({
  project,
  onUpdateExportSettings,
  onUpdateBibliography,
  onOpenPrintPreview
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'compilation' | 'bibliography'>('compilation');
  const { exportSettings } = project;
  const activeMargins = resolveMargins(exportSettings, project.category);
  const currentPreset = exportSettings.marginPreset || 'auto';

  return (
    <div className="pc-studio-light pc-studio-workspace flex-1 p-6 md:p-8 bg-[#18181b] overflow-y-auto text-zinc-100 font-sans space-y-6">
      
      {/* Top Header & Subtab Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#333] pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight uppercase flex items-center gap-2.5">
            <SlidersHorizontal className="w-6 h-6 text-[#FF6B00]" />
            <span>Export & Publishing Settings Studio</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Configure typesetting, page dimensions, LaTeX bibliography citations, and manuscript export formats.
          </p>
        </div>

        {/* Subtab Navigation */}
        <div className="flex items-center gap-1.5 bg-[#242427] p-1 rounded-lg border border-[#3f3f46]">
          <button
            onClick={() => setActiveSubTab('compilation')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'compilation'
                ? 'bg-[#FF6B00] text-black shadow-md'
                : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print & Layout Config</span>
          </button>

          <button
            onClick={() => setActiveSubTab('bibliography')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'bibliography'
                ? 'bg-[#FF6B00] text-black shadow-md'
                : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span>LaTeX Bibliography & Citations</span>
            {(project.bibliography?.length ?? 0) > 0 && (
              <span className="text-[10px] bg-black/20 text-black px-1.5 py-0.2 rounded-full font-mono">
                {project.bibliography?.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeSubTab === 'compilation' ? (
        <div className="space-y-6 max-w-5xl mx-auto">
          {/* Quick Action Preview Banner */}
          <div className="pc-publication-preview bg-gradient-to-r from-[#2a170d] to-[#1e1e22] border border-[#FF6B00]/40 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6B00] bg-[#FF6B00]/10 px-2 py-0.5 rounded font-mono">
                Interactive Studio
              </span>
              <h2 className="text-sm font-bold text-white">Full-Book Page Layout & Print Engine</h2>
              <p className="text-xs text-zinc-300">
                Preview exact page boundaries, gutters, headers, footers, and footnote placements before printing or downloading.
              </p>
            </div>

            {onOpenPrintPreview && (
              <button
                onClick={onOpenPrintPreview}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#FF6B00] hover:bg-orange-600 text-black font-extrabold text-xs rounded-lg transition-colors shadow-md cursor-pointer uppercase tracking-wider shrink-0"
              >
                <Eye className="w-4 h-4" />
                <span>Launch Interactive Print Preview Studio</span>
              </button>
            )}
          </div>

          {/* Grid Layout & Typography Settings */}
          <div className="bg-[#242427] border border-[#3f3f46] rounded-xl p-5 space-y-4 shadow-md">
            <h2 className="text-xs font-extrabold text-[#FF6B00] uppercase tracking-wider">
              1. Book Trim Size & Typography Settings
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="font-bold text-zinc-300 block mb-1">Book Trim Size</label>
                <select
                  value={exportSettings.trimSize}
                  onChange={(e) => onUpdateExportSettings({ ...exportSettings, trimSize: e.target.value as TrimSize })}
                  className="w-full p-2.5 bg-[#18181b] border border-[#3f3f46] rounded text-zinc-200 focus:outline-hidden cursor-pointer font-mono text-xs"
                >
                  <option value="6x9">6" x 9" US Trade Paperback</option>
                  <option value="8.5x11">8.5" x 11" Academic / Textbook</option>
                  <option value="A5">A5 European Standard (148 x 210 mm)</option>
                  <option value="5x8">5" x 8" Pocket Edition</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-zinc-300 block mb-1">Google Serif (Body Text)</label>
                <select
                  value={exportSettings.googleSerifFont || 'EB Garamond'}
                  onChange={(e) => onUpdateExportSettings({ ...exportSettings, googleSerifFont: e.target.value })}
                  className="w-full p-2.5 bg-[#18181b] border border-amber-500/50 rounded text-amber-300 focus:outline-hidden cursor-pointer text-xs font-semibold"
                >
                  {GOOGLE_FONTS.filter(f => f.category === 'serif').map(font => (
                    <option key={font.id} value={font.name}>{font.name} (Serif)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-zinc-300 block mb-1">Google Sans (Headings)</label>
                <select
                  value={exportSettings.googleSansFont || 'Inter'}
                  onChange={(e) => onUpdateExportSettings({ ...exportSettings, googleSansFont: e.target.value })}
                  className="w-full p-2.5 bg-[#18181b] border border-blue-500/50 rounded text-blue-300 focus:outline-hidden cursor-pointer text-xs font-semibold"
                >
                  {GOOGLE_FONTS.filter(f => f.category === 'sans-serif').map(font => (
                    <option key={font.id} value={font.name}>{font.name} (Sans)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-zinc-300 block mb-1">Automatic Line Hyphenation</label>
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = !(exportSettings.enableHyphenation ?? true);
                    onUpdateExportSettings({ 
                      ...exportSettings, 
                      enableHyphenation: nextVal,
                      autoHyphenation: nextVal 
                    });
                  }}
                  className={`w-full p-2.5 border rounded font-semibold transition-colors cursor-pointer flex items-center justify-between text-xs ${
                    (exportSettings.enableHyphenation ?? true)
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300'
                      : 'bg-[#18181b] border-[#3f3f46] text-zinc-400'
                  }`}
                >
                  <span>{(exportSettings.enableHyphenation ?? true) ? 'Hyphenation ON' : 'Hyphenation OFF'}</span>
                  <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${
                    (exportSettings.enableHyphenation ?? true) ? 'bg-emerald-500/20 text-emerald-300' : 'bg-zinc-800 text-zinc-500'
                  }`}>
                    {(exportSettings.enableHyphenation ?? true) ? 'Enabled' : 'Disabled'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Page Margins Manager */}
          <div className="bg-[#242427] border border-[#3f3f46] rounded-xl p-5 space-y-3 shadow-md text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#333] pb-3">
              <div>
                <div className="font-bold text-amber-400 flex items-center gap-1.5 text-sm">
                  <span>📐 Page Margins & Gutter Calibration</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono font-normal">
                    {currentPreset === 'auto' ? 'Auto-Calibrated' : currentPreset}
                  </span>
                </div>
                <p className="text-zinc-400 text-xs mt-0.5">
                  Adjust top, bottom, and binding gutter margins based on book category ({project.category}) or define custom metrics.
                </p>
              </div>

              <select
                value={currentPreset}
                onChange={(e) => onUpdateExportSettings({ 
                  ...exportSettings, 
                  marginPreset: e.target.value as MarginPreset 
                })}
                className="bg-[#18181b] border border-amber-500/40 rounded px-3 py-1.5 text-xs text-amber-300 font-bold focus:outline-hidden cursor-pointer"
              >
                <option value="auto">✨ Auto-Fix (Recommended for {project.category})</option>
                <option value="compact">📏 Compact Margins (0.5 in)</option>
                <option value="standard">📖 Standard Margins (0.75 in)</option>
                <option value="generous">📜 Generous Margins (1.0 in)</option>
                <option value="custom">⚙️ Custom Manual Margins</option>
              </select>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs font-mono text-zinc-300">
              <div className="flex items-center gap-4">
                <span>Top: <strong className="text-white">{activeMargins.top}</strong></span>
                <span>Bottom: <strong className="text-white">{activeMargins.bottom}</strong></span>
                <span>Inside (Gutter): <strong className="text-amber-300">{activeMargins.left}</strong></span>
                <span>Outside: <strong className="text-white">{activeMargins.right}</strong></span>
              </div>
              {currentPreset === 'auto' && (
                <span className="text-[#FF6B00] text-xs font-sans font-medium">
                  ✓ Optimal gutter binding spacing applied
                </span>
              )}
            </div>

            {currentPreset === 'custom' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#333]">
                <div>
                  <label className="text-[10px] text-zinc-400 block font-bold mb-1">Top Margin</label>
                  <input
                    type="text"
                    value={exportSettings.customMargins?.top || activeMargins.top}
                    onChange={(e) => onUpdateExportSettings({
                      ...exportSettings,
                      customMargins: {
                        ...(exportSettings.customMargins || activeMargins),
                        top: e.target.value
                      }
                    })}
                    className="w-full bg-[#18181b] border border-[#3f3f46] rounded px-2.5 py-1.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 block font-bold mb-1">Bottom Margin</label>
                  <input
                    type="text"
                    value={exportSettings.customMargins?.bottom || activeMargins.bottom}
                    onChange={(e) => onUpdateExportSettings({
                      ...exportSettings,
                      customMargins: {
                        ...(exportSettings.customMargins || activeMargins),
                        bottom: e.target.value
                      }
                    })}
                    className="w-full bg-[#18181b] border border-[#3f3f46] rounded px-2.5 py-1.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 block font-bold mb-1">Inside / Gutter (Left)</label>
                  <input
                    type="text"
                    value={exportSettings.customMargins?.left || activeMargins.left}
                    onChange={(e) => onUpdateExportSettings({
                      ...exportSettings,
                      customMargins: {
                        ...(exportSettings.customMargins || activeMargins),
                        left: e.target.value
                      }
                    })}
                    className="w-full bg-[#18181b] border border-[#3f3f46] rounded px-2.5 py-1.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 block font-bold mb-1">Outside (Right)</label>
                  <input
                    type="text"
                    value={exportSettings.customMargins?.right || activeMargins.right}
                    onChange={(e) => onUpdateExportSettings({
                      ...exportSettings,
                      customMargins: {
                        ...(exportSettings.customMargins || activeMargins),
                        right: e.target.value
                      }
                    })}
                    className="w-full bg-[#18181b] border border-[#3f3f46] rounded px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Compilation Content Scope Checklist */}
          <div className="bg-[#242427] border border-[#3f3f46] rounded-xl p-5 space-y-3 shadow-md">
            <h2 className="text-xs font-extrabold text-[#FF6B00] uppercase tracking-wider">
              2. Included Book Elements & Sections
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <label className="flex items-center gap-2.5 p-2.5 bg-[#18181b] rounded-lg border border-[#333] cursor-pointer hover:border-[#555]">
                <input
                  type="checkbox"
                  checked={exportSettings.includeCover}
                  onChange={(e) => onUpdateExportSettings({ ...exportSettings, includeCover: e.target.checked })}
                  className="accent-[#FF6B00]"
                />
                <span className="text-zinc-200 font-medium">Cover Page</span>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 bg-[#18181b] rounded-lg border border-[#333] cursor-pointer hover:border-[#555]">
                <input
                  type="checkbox"
                  checked={exportSettings.includeFrontMatter}
                  onChange={(e) => onUpdateExportSettings({ ...exportSettings, includeFrontMatter: e.target.checked })}
                  className="accent-[#FF6B00]"
                />
                <span className="text-zinc-200 font-medium">Front Matter</span>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 bg-[#18181b] rounded-lg border border-[#333] cursor-pointer hover:border-[#555]">
                <input
                  type="checkbox"
                  checked={exportSettings.includeTOC}
                  onChange={(e) => onUpdateExportSettings({ ...exportSettings, includeTOC: e.target.checked })}
                  className="accent-[#FF6B00]"
                />
                <span className="text-zinc-200 font-medium">Table of Contents</span>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 bg-[#18181b] rounded-lg border border-[#333] cursor-pointer hover:border-[#555]">
                <input
                  type="checkbox"
                  checked={exportSettings.includeBibliography !== false}
                  onChange={(e) => onUpdateExportSettings({ ...exportSettings, includeBibliography: e.target.checked })}
                  className="accent-[#FF6B00]"
                />
                <span className="text-zinc-200 font-bold text-[#FF6B00]">LaTeX Bibliography</span>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 bg-[#18181b] rounded-lg border border-[#333] cursor-pointer hover:border-[#555]">
                <input
                  type="checkbox"
                  checked={exportSettings.includeWatermark}
                  onChange={(e) => onUpdateExportSettings({ ...exportSettings, includeWatermark: e.target.checked })}
                  className="accent-[#FF6B00]"
                />
                <span className="text-zinc-200 font-medium">Watermark Overlay</span>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 bg-[#18181b] rounded-lg border border-[#333] cursor-pointer hover:border-[#555]">
                <input
                  type="checkbox"
                  checked={exportSettings.includeFootnotes !== false}
                  onChange={(e) => onUpdateExportSettings({ ...exportSettings, includeFootnotes: e.target.checked })}
                  className="accent-[#FF6B00]"
                />
                <span className="text-zinc-200 font-medium">Footnote Citations</span>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 bg-[#18181b] rounded-lg border border-[#333] cursor-pointer hover:border-[#555]">
                <input
                  type="checkbox"
                  checked={exportSettings.includeExecSummary}
                  onChange={(e) => onUpdateExportSettings({ ...exportSettings, includeExecSummary: e.target.checked })}
                  className="accent-[#FF6B00]"
                />
                <span className="text-zinc-200 font-medium">Executive Summary</span>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 bg-[#18181b] rounded-lg border border-[#333] cursor-pointer hover:border-[#555]">
                <input
                  type="checkbox"
                  checked={exportSettings.includeQuizzes}
                  onChange={(e) => onUpdateExportSettings({ ...exportSettings, includeQuizzes: e.target.checked })}
                  className="accent-[#FF6B00]"
                />
                <span className="text-zinc-200 font-medium">Quizzes & Exercises</span>
              </label>
            </div>
          </div>

          {/* Export Actions Center */}
          <div className="bg-[#242427] border border-[#3f3f46] rounded-xl p-5 space-y-4 shadow-md">
            <h2 className="text-xs font-extrabold text-[#FF6B00] uppercase tracking-wider">
              3. Download & Export Manuscript
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <button
                onClick={() => exportToLaTeX(project)}
                className="flex items-center justify-center gap-2 p-3 rounded-lg bg-[#FF6B00] hover:bg-orange-600 text-black font-extrabold transition-colors cursor-pointer shadow-md"
              >
                <FileCode className="w-4 h-4" />
                <span>LaTeX (.tex) + BibTeX</span>
              </button>

              <button
                onClick={() => exportToBibTeX(project)}
                className="flex items-center justify-center gap-2 p-3 rounded-lg bg-[#18181b] hover:bg-zinc-800 text-amber-300 border border-amber-500/40 font-bold transition-colors cursor-pointer"
              >
                <BookMarked className="w-4 h-4" />
                <span>BibTeX File (.bib)</span>
              </button>

              <button
                onClick={() => exportToWordDocx(project)}
                className="flex items-center justify-center gap-2 p-3 rounded-lg bg-blue-950/60 hover:bg-blue-900/80 text-blue-300 border border-blue-500/40 font-bold transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Word (.docx)</span>
              </button>

              <button
                onClick={() => exportToPDF(project)}
                className="flex items-center justify-center gap-2 p-3 rounded-lg bg-[#18181b] hover:bg-zinc-800 text-white border border-[#444] font-bold transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-[#FF6B00]" />
                <span>Print PDF</span>
              </button>

              <button
                onClick={() => exportToEPUB(project)}
                className="flex items-center justify-center gap-2 p-3 rounded-lg bg-[#18181b] hover:bg-zinc-800 text-purple-300 border border-purple-500/40 font-bold transition-colors cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>EPUB eBook</span>
              </button>

              <button
                onClick={() => exportToMarkdown(project)}
                className="flex items-center justify-center gap-2 p-3 rounded-lg bg-[#18181b] hover:bg-zinc-800 text-sky-300 border border-sky-500/40 font-bold transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Markdown (.md)</span>
              </button>

              <button
                onClick={() => saveToLocalDiskInDocuments(project)}
                className="flex items-center justify-center gap-2 p-3 rounded-lg bg-[#18181b] hover:bg-zinc-800 text-emerald-300 border border-emerald-500/40 font-bold transition-colors cursor-pointer"
              >
                <HardDrive className="w-4 h-4" />
                <span>Save to Local Disk</span>
              </button>

              <button
                onClick={() => exportOfflineShellJSON(project)}
                className="flex items-center justify-center gap-2 p-3 rounded-lg bg-[#18181b] hover:bg-zinc-800 text-zinc-300 border border-[#444] font-bold transition-colors cursor-pointer"
              >
                <Package className="w-4 h-4" />
                <span>Offline Shell JSON</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto">
          <BibliographyManager
            project={project}
            onUpdateBibliography={onUpdateBibliography}
          />
        </div>
      )}
    </div>
  );
};
