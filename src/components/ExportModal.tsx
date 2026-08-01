import React, { useRef } from 'react';
import { Download, FileText, BookOpen, Check, X, Printer, Package, HardDrive, Upload, FileCode, Eye } from 'lucide-react';
import { BookProject, ExportSettings, TrimSize, FontPairing, MarginPreset } from '../types';
import { GOOGLE_FONTS } from '../lib/googleFonts';
import { 
  exportToPDF, 
  exportToEPUB, 
  exportProjectJSON, 
  exportOfflineShellJSON, 
  parseOfflineShellJSON,
  exportToMarkdown,
  exportToTxt,
  exportToHTML,
  exportToWordDocx,
  exportToLaTeX,
  exportToBibTeX,
  saveToLocalDiskInDocuments,
  resolveMargins
} from '../lib/exportUtils';
import { runPublishingPreflight } from '../lib/publishingPreflight';

interface ExportModalProps {
  project: BookProject;
  isOpen: boolean;
  onClose: () => void;
  onUpdateExportSettings: (updated: ExportSettings) => void;
  onImportProject?: (project: BookProject) => void;
  onOpenPrintPreview?: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  project,
  isOpen,
  onClose,
  onUpdateExportSettings,
  onImportProject,
  onOpenPrintPreview,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const { exportSettings } = project;
  const preflight = runPublishingPreflight(project);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const imported = parseOfflineShellJSON(content);
        if (onImportProject) {
          onImportProject(imported);
          alert(`Successfully imported project "${imported.title}" from offline shell dataset!`);
          onClose();
        }
      } catch (err: any) {
        alert(`Failed to import JSON file: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-[#262626] border border-[#444444] rounded-xl max-w-2xl w-full shadow-2xl p-6 space-y-6 text-gray-100 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#333333] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-[#FF6B00] text-black font-bold">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-tight">Publishing & Offline Shell Export Studio</h2>
              <p className="text-xs text-gray-400">Compile project into print PDF, EPUB, or standalone offline shell JSON datasets.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-gray-400 hover:text-white hover:bg-[#333333] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <section className={`rounded border p-3 text-xs ${preflight.valid ? 'border-emerald-700 bg-emerald-950/20' : 'border-red-700 bg-red-950/20'}`} aria-label="Publishing preflight">
          <div className="font-bold">{preflight.valid ? 'Publishing preflight passed' : 'Publishing preflight requires attention'} · {preflight.validEquations} valid equations · {preflight.invalidEquations} invalid equations</div>
          {preflight.issues.length > 0 && <ul className="mt-2 max-h-28 list-disc overflow-y-auto pl-5">{preflight.issues.map((issue) => <li key={issue.id} className={issue.severity === 'error' ? 'text-red-300' : 'text-amber-300'}>{issue.message}{issue.blockId ? ` (block ${issue.blockId})` : ''}</li>)}</ul>}
        </section>

        {/* Trim & Typography Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="font-bold text-gray-300 block mb-1">Book Trim Size</label>
            <select
              value={exportSettings.trimSize}
              onChange={(e) => onUpdateExportSettings({ ...exportSettings, trimSize: e.target.value as TrimSize })}
              className="w-full p-2 bg-[#1A1A1A] border border-[#444444] rounded text-gray-200 focus:outline-hidden cursor-pointer font-mono"
            >
              <option value="6x9">6" x 9" US Trade Paperback</option>
              <option value="8.5x11">8.5" x 11" Academic / Textbook</option>
              <option value="A5">A5 European Standard (148 x 210 mm)</option>
              <option value="5x8">5" x 8" Pocket Edition</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-gray-300 block mb-1">Google Serif (Body)</label>
            <select
              value={exportSettings.googleSerifFont || 'EB Garamond'}
              onChange={(e) => onUpdateExportSettings({ ...exportSettings, googleSerifFont: e.target.value })}
              className="w-full p-2 bg-[#1A1A1A] border border-orange-500/50 rounded text-orange-300 focus:outline-hidden cursor-pointer font-semibold"
            >
              {GOOGLE_FONTS.filter(f => f.category === 'serif').map(font => (
                <option key={font.id} value={font.name}>{font.name} (Serif)</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-gray-300 block mb-1">Google Sans (Headings)</label>
            <select
              value={exportSettings.googleSansFont || 'Inter'}
              onChange={(e) => onUpdateExportSettings({ ...exportSettings, googleSansFont: e.target.value })}
              className="w-full p-2 bg-[#1A1A1A] border border-blue-500/50 rounded text-blue-300 focus:outline-hidden cursor-pointer font-semibold"
            >
              {GOOGLE_FONTS.filter(f => f.category === 'sans-serif').map(font => (
                <option key={font.id} value={font.name}>{font.name} (Sans)</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-gray-300 block mb-1">Auto Hyphenation</label>
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
              className={`w-full p-2 border rounded font-semibold transition-colors cursor-pointer flex items-center justify-between text-xs ${
                (exportSettings.enableHyphenation ?? true)
                  ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300'
                  : 'bg-[#1A1A1A] border-[#444] text-zinc-400'
              }`}
              title="Toggle automatic hyphenation at line breaks for clean print justification"
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

        {/* Page Margins Manager */}
        {(() => {
          const activeMargins = resolveMargins(exportSettings, project.category);
          const currentPreset = exportSettings.marginPreset || 'auto';
          return (
            <div className="bg-[#18181b] border border-[#333] rounded-lg p-3 space-y-2 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2a2a2d] pb-2">
                <div>
                  <div className="font-bold text-amber-400 flex items-center gap-1.5">
                    <span>📐 Page Margins Manager</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-normal">
                      {currentPreset === 'auto' ? 'Auto-Calibrated' : currentPreset}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Automatically adjusts page margins based on book type ({project.category}) or configure custom margins.
                  </p>
                </div>

                <select
                  value={currentPreset}
                  onChange={(e) => onUpdateExportSettings({ 
                    ...exportSettings, 
                    marginPreset: e.target.value as MarginPreset 
                  })}
                  className="bg-[#242427] border border-amber-500/40 rounded px-2 py-1 text-xs text-amber-300 font-bold focus:outline-hidden cursor-pointer"
                >
                  <option value="auto">✨ Auto-Fix (Recommended for {project.category})</option>
                  <option value="compact">📏 Compact Margins (0.5 in)</option>
                  <option value="standard">📖 Standard Margins (0.75 in)</option>
                  <option value="generous">📜 Generous Margins (1.0 in)</option>
                  <option value="custom">⚙️ Custom Manual Margins</option>
                </select>
              </div>

              {/* Display Active Margin Breakdown */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] font-mono text-gray-300">
                <div className="flex items-center gap-3">
                  <span>Top: <strong className="text-white">{activeMargins.top}</strong></span>
                  <span>Bottom: <strong className="text-white">{activeMargins.bottom}</strong></span>
                  <span>Inside (Gutter): <strong className="text-amber-300">{activeMargins.left}</strong></span>
                  <span>Outside: <strong className="text-white">{activeMargins.right}</strong></span>
                </div>
                {currentPreset === 'auto' && (
                  <span className="text-[10px] text-emerald-400 font-sans italic">
                    ✓ Optimal book binding gutter spacing applied
                  </span>
                )}
              </div>

              {/* Custom Margin Inputs */}
              {currentPreset === 'custom' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#2a2a2d]">
                  <div>
                    <label className="text-[10px] text-gray-400 block font-bold">Top Margin</label>
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
                      className="w-full bg-[#111] border border-[#444] rounded px-2 py-1 text-white font-mono"
                      placeholder="e.g. 0.75in"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block font-bold">Bottom Margin</label>
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
                      className="w-full bg-[#111] border border-[#444] rounded px-2 py-1 text-white font-mono"
                      placeholder="e.g. 0.75in"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block font-bold">Inside / Gutter (Left)</label>
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
                      className="w-full bg-[#111] border border-[#444] rounded px-2 py-1 text-white font-mono"
                      placeholder="e.g. 0.875in"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block font-bold">Outside (Right)</label>
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
                      className="w-full bg-[#111] border border-[#444] rounded px-2 py-1 text-white font-mono"
                      placeholder="e.g. 0.625in"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* What to Include Checklist */}
        <div className="space-y-2 border-t border-[#333333] pt-4">
          <h3 className="text-xs font-bold text-[#FF6B00] uppercase tracking-wider">
            Book Creation & Compilation Scope
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <label className="flex items-center gap-2 p-2 bg-[#1A1A1A] rounded border border-[#333333] cursor-pointer hover:border-[#444]">
              <input
                type="checkbox"
                checked={exportSettings.includeCover}
                onChange={(e) => onUpdateExportSettings({ ...exportSettings, includeCover: e.target.checked })}
                className="accent-[#FF6B00]"
              />
              <span className="text-gray-300">Book Cover Page</span>
            </label>

            <label className="flex items-center gap-2 p-2 bg-[#1A1A1A] rounded border border-[#333333] cursor-pointer hover:border-[#444]">
              <input
                type="checkbox"
                checked={exportSettings.includeFrontMatter}
                onChange={(e) => onUpdateExportSettings({ ...exportSettings, includeFrontMatter: e.target.checked })}
                className="accent-[#FF6B00]"
              />
              <span className="text-gray-300">Front Matter / Preambles</span>
            </label>

            <label className="flex items-center gap-2 p-2 bg-[#1A1A1A] rounded border border-[#333333] cursor-pointer hover:border-[#444]">
              <input
                type="checkbox"
                checked={exportSettings.includeExecSummary}
                onChange={(e) => onUpdateExportSettings({ ...exportSettings, includeExecSummary: e.target.checked })}
                className="accent-[#FF6B00]"
              />
              <span className="text-gray-300">Executive Summary</span>
            </label>

            <label className="flex items-center gap-2 p-2 bg-[#1A1A1A] rounded border border-[#333333] cursor-pointer hover:border-[#444]">
              <input
                type="checkbox"
                checked={exportSettings.includeTOC}
                onChange={(e) => onUpdateExportSettings({ ...exportSettings, includeTOC: e.target.checked })}
                className="accent-[#FF6B00]"
              />
              <span className="text-gray-300">Table of Contents</span>
            </label>

            <label className="flex items-center gap-2 p-2 bg-[#1A1A1A] rounded border border-[#333333] cursor-pointer hover:border-[#444]">
              <input
                type="checkbox"
                checked={exportSettings.includeQuizzes}
                onChange={(e) => onUpdateExportSettings({ ...exportSettings, includeQuizzes: e.target.checked })}
                className="accent-[#FF6B00]"
              />
              <span className="text-gray-300">Quizzes & Exercises</span>
            </label>

            <label className="flex items-center gap-2 p-2 bg-[#1A1A1A] rounded border border-[#333333] cursor-pointer hover:border-[#444]">
              <input
                type="checkbox"
                checked={exportSettings.includeWatermark}
                onChange={(e) => onUpdateExportSettings({ ...exportSettings, includeWatermark: e.target.checked })}
                className="accent-[#FF6B00]"
              />
              <span className="text-gray-300">Watermark Overlay</span>
            </label>

            <label className="flex items-center gap-2 p-2 bg-[#1A1A1A] rounded border border-[#333333] cursor-pointer hover:border-[#444]">
              <input
                type="checkbox"
                checked={exportSettings.enableHyphenation !== false && exportSettings.autoHyphenation !== false}
                onChange={(e) => onUpdateExportSettings({ 
                  ...exportSettings, 
                  enableHyphenation: e.target.checked,
                  autoHyphenation: e.target.checked 
                })}
                className="accent-[#FF6B00]"
              />
              <span className="text-gray-300">Automatic Text Hyphenation</span>
            </label>
          </div>
        </div>

        {/* Offline Shell & Local Disk Storage Section */}
        <div className="bg-[#1E1E1E] border border-[#333333] rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-[#FF6B00]" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Local Disk Storage & Document Package (.m2b)</h4>
            </div>
            <span className="text-[10px] bg-[#333333] text-gray-300 px-2 py-0.5 rounded font-mono">v1.0.0-local-disk</span>
          </div>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Save book data directly to your local file system in Documents, or export a self-contained offline shell payload (.m2b / .json) containing metadata, chapter hierarchies, and custom block elements.
          </p>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              onClick={() => saveToLocalDiskInDocuments(project)}
              className="flex items-center gap-2 py-2 px-3 rounded bg-[#FF6B00] hover:bg-orange-600 text-black font-bold text-xs transition-colors shadow-sm cursor-pointer"
            >
              <HardDrive className="w-4 h-4" />
              <span>Save to Local Disk (Documents)</span>
            </button>

            <button
              onClick={() => exportOfflineShellJSON(project)}
              className="flex items-center gap-2 py-2 px-3 rounded bg-[#333333] hover:bg-[#444444] text-white font-bold text-xs transition-colors border border-[#444] cursor-pointer"
            >
              <FileCode className="w-4 h-4 text-[#FF6B00]" />
              <span>Export Offline Shell JSON</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 py-2 px-3 rounded bg-[#333333] hover:bg-[#444444] text-white font-medium text-xs transition-colors border border-[#444] cursor-pointer"
            >
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Load File from Disk</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.m2b"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Standard Export & Print Actions */}
        <div className="space-y-3 border-t border-[#333333] pt-4">
          
          {/* Main Print Preview Banner */}
          {onOpenPrintPreview && (
            <button
              onClick={() => {
                onClose();
                onOpenPrintPreview();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded bg-[#FF6B00] hover:bg-orange-600 text-black font-extrabold text-xs transition-colors shadow-lg cursor-pointer uppercase tracking-wider"
            >
              <Eye className="w-4 h-4" />
              <span>Launch Interactive Print Preview Studio</span>
            </button>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <button
              onClick={() => exportToLaTeX(project)}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded bg-[#FF6B00] hover:bg-orange-600 text-black font-extrabold text-xs transition-colors shadow-sm cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>LaTeX (.tex) + BibTeX</span>
            </button>

            <button
              onClick={() => exportToBibTeX(project)}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded bg-[#333333] hover:bg-[#444444] text-amber-300 font-bold text-xs transition-colors border border-amber-500/40 cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>BibTeX (.bib)</span>
            </button>

            <button
              onClick={() => exportToWordDocx(project)}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 font-bold text-xs transition-colors border border-blue-500/40 cursor-pointer shadow-sm"
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>Word Document (.docx)</span>
            </button>

            <button
              onClick={() => exportToPDF(project)}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded bg-[#333333] hover:bg-[#444444] text-white font-bold text-xs transition-colors border border-[#444] cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span>Print / PDF Document</span>
            </button>

            <button
              onClick={() => exportToMarkdown(project)}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded bg-[#333333] hover:bg-[#444444] text-white font-bold text-xs transition-colors border border-[#444] cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-sky-400" />
              <span>Markdown (.md)</span>
            </button>

            <button
              onClick={() => exportToTxt(project)}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded bg-[#333333] hover:bg-[#444444] text-white font-bold text-xs transition-colors border border-[#444] cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5 text-emerald-400" />
              <span>Plain Text (.txt)</span>
            </button>

            <button
              onClick={() => exportToHTML(project)}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded bg-[#333333] hover:bg-[#444444] text-white font-bold text-xs transition-colors border border-[#444] cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5 text-amber-400" />
              <span>HTML Edition (.html)</span>
            </button>

            <button
              onClick={() => exportToEPUB(project)}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded bg-[#333333] hover:bg-[#444444] text-white font-bold text-xs transition-colors border border-[#444] cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              <span>EPUB Manifest</span>
            </button>

            <button
              onClick={() => exportProjectJSON(project)}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded bg-[#333333] hover:bg-[#444444] text-white font-bold text-xs transition-colors border border-[#444] cursor-pointer"
            >
              <Package className="w-3.5 h-3.5 text-gray-300" />
              <span>Raw JSON Backup</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
