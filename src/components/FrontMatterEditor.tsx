import React, { useState } from 'react';
import { Chapter, FrontMatter, TocStyle, IndexConfig } from '../types';
import { FileSpreadsheet, Sparkles, BookOpen, User, Tag, ListOrdered, Settings2, RotateCcw, LayoutList, BookMarked, Plus, Trash2, Wand2 } from 'lucide-react';
import { TableOfContents } from './TableOfContents';
import { IndexOfTerms } from './IndexOfTerms';
import { autoDiscoverKeywords } from '../lib/indexUtils';

interface FrontMatterEditorProps {
  frontMatter: FrontMatter;
  bookTitle: string;
  bookSubtitle?: string;
  bookAuthor?: string;
  chapters: Chapter[];
  onUpdateFrontMatter: (updated: FrontMatter) => void;
  onUpdateProjectMetadata?: (metadata: { title?: string; subtitle?: string; author?: string; publisher?: string }) => void;
  onGenerateAIExecSummary: () => void;
}

export const FrontMatterEditor: React.FC<FrontMatterEditorProps> = ({
  frontMatter,
  bookTitle,
  bookSubtitle = '',
  bookAuthor = '',
  chapters,
  onUpdateFrontMatter,
  onUpdateProjectMetadata,
  onGenerateAIExecSummary,
}) => {
  const tocConfig = frontMatter.tocConfig || {};
  const indexConfig = frontMatter.indexConfig || {};
  const currentStyle: TocStyle = tocConfig.style || 'dotted';
  const [newTermInput, setNewTermInput] = useState('');

  const handleTocConfigChange = (updates: Partial<NonNullable<FrontMatter['tocConfig']>>) => {
    onUpdateFrontMatter({
      ...frontMatter,
      tocConfig: {
        ...tocConfig,
        ...updates,
      },
    });
  };

  const handleIndexConfigChange = (updates: Partial<IndexConfig>) => {
    onUpdateFrontMatter({
      ...frontMatter,
      indexConfig: {
        ...indexConfig,
        ...updates,
      },
    });
  };

  const handleAddCustomTerm = () => {
    const trimmed = newTermInput.trim();
    if (!trimmed) return;
    const currentTerms = indexConfig.customTerms || [];
    if (!currentTerms.some(t => t.toLowerCase() === trimmed.toLowerCase())) {
      handleIndexConfigChange({
        customTerms: [...currentTerms, trimmed],
      });
    }
    setNewTermInput('');
  };

  const handleRemoveCustomTerm = (termToRemove: string) => {
    const currentTerms = indexConfig.customTerms || [];
    handleIndexConfigChange({
      customTerms: currentTerms.filter(t => t.toLowerCase() !== termToRemove.toLowerCase()),
    });
  };

  const handleAutoScanTerms = () => {
    const discovered = autoDiscoverKeywords(chapters, 20);
    const existing = indexConfig.customTerms || [];
    const merged = Array.from(new Set([...existing, ...discovered]));
    handleIndexConfigChange({
      customTerms: merged,
      autoExtractKeywords: true,
    });
  };

  const handleResetCustomPages = () => {
    onUpdateFrontMatter({
      ...frontMatter,
      tocConfig: {
        ...tocConfig,
        customChapterPages: {},
        startPageNumber: undefined,
      },
    });
  };

  return (
    <div className="flex-1 bg-zinc-100 dark:bg-zinc-950 p-6 sm:p-10 overflow-y-auto h-full">
      <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-8 space-y-8">
        
        <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-orange-500" /> Book Preambles & Executive Summary
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Manage front matter, title details, subtitle, author name & copyright page prior to Chapter 1.
            </p>
          </div>

          <button
            onClick={onGenerateAIExecSummary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-600 text-white hover:bg-orange-700 transition-colors shadow-xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Executive Summary</span>
          </button>
        </div>

        {/* Section 0: Main Book Title, Subtitle & Author Metadata */}
        <div className="space-y-4 bg-orange-500/5 dark:bg-orange-950/20 border border-orange-500/30 rounded-xl p-5">
          <div className="flex items-center justify-between border-b border-orange-500/20 pb-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-orange-600 dark:text-orange-400 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Book Title, Subtitle & Author Details
            </h3>
            <span className="text-[10px] bg-orange-500/20 text-orange-600 dark:text-orange-300 font-mono font-bold px-2 py-0.5 rounded">
              Synced Across Cover & Manuscript
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-zinc-800 dark:text-zinc-200 block mb-1">
                Main Book Title
              </label>
              <input
                type="text"
                value={bookTitle}
                onChange={(e) => onUpdateProjectMetadata?.({ title: e.target.value })}
                className="w-full p-2.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg font-bold text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-orange-500/50 focus:outline-hidden"
                placeholder="e.g. SHE LOST IT ALL..."
              />
            </div>

            <div>
              <label className="font-bold text-zinc-800 dark:text-zinc-200 block mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-orange-500" /> Primary Author Name
              </label>
              <input
                type="text"
                value={bookAuthor}
                onChange={(e) => onUpdateProjectMetadata?.({ author: e.target.value })}
                className="w-full p-2.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg font-bold text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-orange-500/50 focus:outline-hidden"
                placeholder="e.g. DR. AURELIUS VANCE"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-zinc-800 dark:text-zinc-200 block mb-1 flex items-center gap-1 text-xs">
              <Tag className="w-3.5 h-3.5 text-orange-500" /> Book Subtitle / Tagline
            </label>
            <input
              type="text"
              value={bookSubtitle}
              onChange={(e) => onUpdateProjectMetadata?.({ subtitle: e.target.value })}
              className="w-full p-2.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-xs focus:ring-2 focus:ring-orange-500/50 focus:outline-hidden font-serif italic"
              placeholder="e.g. Industrial Architectures, Financial Intelligence & Quantum Value Networks"
            />
          </div>
        </div>

        {/* Section 1: Copyright & Imprint */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider text-orange-600 dark:text-orange-400">
            1. Title Page & Copyright Page Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">ISBN Identifier</label>
              <input
                type="text"
                value={frontMatter.isbn}
                onChange={(e) => onUpdateFrontMatter({ ...frontMatter, isbn: e.target.value })}
                className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded font-mono text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Publisher Imprint</label>
              <input
                type="text"
                value={frontMatter.publisher}
                onChange={(e) => {
                  onUpdateFrontMatter({ ...frontMatter, publisher: e.target.value });
                  onUpdateProjectMetadata?.({ publisher: e.target.value });
                }}
                className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1 text-xs">Copyright Legal Notice</label>
            <textarea
              value={frontMatter.copyrightText}
              onChange={(e) => onUpdateFrontMatter({ ...frontMatter, copyrightText: e.target.value })}
              rows={3}
              className="w-full p-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>

        {/* Section 2: Executive Summary */}
        <div className="space-y-4 border-t border-zinc-200 dark:border-zinc-800 pb-2 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider text-orange-600 dark:text-orange-400">
              2. Executive Summary / Book Synopsis
            </h3>
            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={frontMatter.includeExecutiveSummary}
                onChange={(e) => onUpdateFrontMatter({ ...frontMatter, includeExecutiveSummary: e.target.checked })}
                className="accent-orange-600 cursor-pointer"
              />
              Include in Published Book
            </label>
          </div>

          <textarea
            value={frontMatter.executiveSummaryContent}
            onChange={(e) => onUpdateFrontMatter({ ...frontMatter, executiveSummaryContent: e.target.value })}
            rows={8}
            className="w-full p-3 text-xs font-serif leading-relaxed bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100"
            placeholder="Executive summary or synopsis..."
          />
        </div>

        {/* Section 3: Dedication & Foreword */}
        <div className="space-y-4 border-t border-zinc-200 dark:border-zinc-800 pt-4">
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider text-orange-600 dark:text-orange-400">
            3. Dedication & Foreword
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Dedication</label>
              <input
                type="text"
                value={frontMatter.dedicationText}
                onChange={(e) => onUpdateFrontMatter({ ...frontMatter, dedicationText: e.target.value })}
                className="w-full p-2 italic bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100"
                placeholder="To..."
              />
            </div>

            <div>
              <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Foreword Author</label>
              <input
                type="text"
                value={frontMatter.forewordAuthor}
                onChange={(e) => onUpdateFrontMatter({ ...frontMatter, forewordAuthor: e.target.value })}
                className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Foreword Text</label>
              <textarea
                value={frontMatter.forewordContent}
                onChange={(e) => onUpdateFrontMatter({ ...frontMatter, forewordContent: e.target.value })}
                rows={4}
                className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Table of Contents Options & Interactive Preview */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider text-orange-600 dark:text-orange-400 flex items-center gap-2">
              <ListOrdered className="w-4 h-4" /> 4. Auto-Generated Table of Contents
            </h3>

            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30 px-3 py-1 rounded-lg hover:bg-orange-500/20 transition-colors">
              <input
                type="checkbox"
                checked={frontMatter.includeTOC}
                onChange={(e) => onUpdateFrontMatter({ ...frontMatter, includeTOC: e.target.checked })}
                className="accent-orange-600 cursor-pointer"
              />
              Include Table of Contents Page
            </label>
          </div>

          {frontMatter.includeTOC ? (
            <div className="space-y-6 bg-zinc-50 dark:bg-zinc-800/40 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800">
              {/* Controls Bar */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                {/* Custom Heading Title */}
                <div>
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    TOC Heading Title
                  </label>
                  <input
                    type="text"
                    value={tocConfig.title || 'Table of Contents'}
                    onChange={(e) => handleTocConfigChange({ title: e.target.value })}
                    className="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100 font-semibold"
                    placeholder="e.g. Table of Contents"
                  />
                </div>

                {/* Leader Style */}
                <div>
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Leader Line Style
                  </label>
                  <select
                    value={currentStyle}
                    onChange={(e) => handleTocConfigChange({ style: e.target.value as TocStyle })}
                    className="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100 font-medium cursor-pointer"
                  >
                    <option value="dotted">Classic Dot Leaders (. . . . . 1)</option>
                    <option value="clean">Modern Minimalist (Space Only)</option>
                    <option value="academic">Academic Formal (Solid Rule)</option>
                    <option value="modern">Vibrant Modern Gradient</option>
                  </select>
                </div>

                {/* Starting Page Offset */}
                <div>
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Chapter 1 Starting Page #
                  </label>
                  <input
                    type="number"
                    value={tocConfig.startPageNumber || ''}
                    onChange={(e) => handleTocConfigChange({ startPageNumber: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                    className="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100 font-mono"
                    placeholder="Auto (Calculated)"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center justify-between gap-4 text-xs pt-2 border-t border-zinc-200 dark:border-zinc-700/60">
                <div className="flex flex-wrap items-center gap-5">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-zinc-700 dark:text-zinc-300">
                    <input
                      type="checkbox"
                      checked={tocConfig.showChapterSubtitles ?? true}
                      onChange={(e) => handleTocConfigChange({ showChapterSubtitles: e.target.checked })}
                      className="accent-orange-600 cursor-pointer"
                    />
                    Display Chapter Subtitles
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-medium text-zinc-700 dark:text-zinc-300">
                    <input
                      type="checkbox"
                      checked={tocConfig.showSubheadings ?? true}
                      onChange={(e) => handleTocConfigChange({ showSubheadings: e.target.checked })}
                      className="accent-orange-600 cursor-pointer"
                    />
                    Include Subheading Sections
                  </label>
                </div>

                {Object.keys(tocConfig.customChapterPages || {}).length > 0 && (
                  <button
                    onClick={handleResetCustomPages}
                    className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Manual Page Overrides
                  </button>
                )}
              </div>

              {/* Live Interactive Preview Box */}
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-zinc-300 dark:border-zinc-700 shadow-inner">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-200 dark:border-zinc-800 text-xs">
                  <span className="font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 flex items-center gap-1.5">
                    <LayoutList className="w-3.5 h-3.5" /> Interactive TOC Live Sheet Preview
                  </span>
                  <span className="text-[11px] text-zinc-400 italic">
                    Tip: Edit numbers directly to override chapter starting pages
                  </span>
                </div>

                <TableOfContents
                  chapters={chapters}
                  frontMatter={frontMatter}
                  onUpdateTocConfig={(updated) => onUpdateFrontMatter({ ...frontMatter, tocConfig: updated })}
                  interactive={true}
                />
              </div>
            </div>
          ) : (
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/20 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-lg text-xs text-zinc-500 text-center">
              Table of Contents is currently disabled. Check the option above to include it in the front matter.
            </div>
          )}
        </div>

        {/* Section 5: Auto-Generated Index of Terms */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider text-orange-600 dark:text-orange-400 flex items-center gap-2">
              <BookMarked className="w-4 h-4" /> 5. Auto-Generated Index of Terms
            </h3>

            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30 px-3 py-1 rounded-lg hover:bg-orange-500/20 transition-colors">
              <input
                type="checkbox"
                checked={frontMatter.includeIndex ?? false}
                onChange={(e) => onUpdateFrontMatter({ ...frontMatter, includeIndex: e.target.checked })}
                className="accent-orange-600 cursor-pointer"
              />
              Include Index Page
            </label>
          </div>

          {frontMatter.includeIndex ? (
            <div className="space-y-6 bg-zinc-50 dark:bg-zinc-800/40 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800">
              {/* Controls Bar */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                {/* Custom Heading Title */}
                <div>
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Index Title Header
                  </label>
                  <input
                    type="text"
                    value={indexConfig.title || 'Index of Terms & Keywords'}
                    onChange={(e) => handleIndexConfigChange({ title: e.target.value })}
                    className="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100 font-semibold"
                    placeholder="e.g. Index of Terms"
                  />
                </div>

                {/* Column Layout Style */}
                <div>
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Index Grid Layout
                  </label>
                  <select
                    value={indexConfig.style || 'columns-2'}
                    onChange={(e) => handleIndexConfigChange({ style: e.target.value as IndexConfig['style'] })}
                    className="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100 font-medium cursor-pointer"
                  >
                    <option value="columns-2">2 Columns (Standard Book)</option>
                    <option value="columns-3">3 Columns (Dense Index)</option>
                    <option value="compact">Compact Single/Dual Grid</option>
                  </select>
                </div>

                {/* Auto Extract Toggle & Actions */}
                <div>
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Keyword Discovery
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoScanTerms}
                    className="w-full flex items-center justify-center gap-1.5 p-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded transition-colors shadow-xs cursor-pointer"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    Auto-Scan Manuscript Terms
                  </button>
                </div>
              </div>

              {/* Add Custom Term Input */}
              <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-700/60">
                <label className="font-semibold text-xs text-zinc-700 dark:text-zinc-300 block">
                  Add Specific Keywords or Key Phrases to Index
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTermInput}
                    onChange={(e) => setNewTermInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomTerm();
                      }
                    }}
                    placeholder="e.g. Quantum Value Networks, Financial Intelligence, API..."
                    className="flex-1 p-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomTerm}
                    className="flex items-center gap-1 px-3 py-2 bg-zinc-800 hover:bg-zinc-900 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white text-xs font-semibold rounded transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Term
                  </button>
                </div>
              </div>

              {/* Tracked Terms Chips */}
              {indexConfig.customTerms && indexConfig.customTerms.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                    Active Tracked Terms ({indexConfig.customTerms.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {indexConfig.customTerms.map((term) => (
                      <span
                        key={term}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-full text-xs font-medium text-zinc-800 dark:text-zinc-200"
                      >
                        <Tag className="w-3 h-3 text-orange-500" />
                        {term}
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomTerm(term)}
                          className="hover:text-red-500 transition-colors ml-0.5 cursor-pointer"
                          title="Remove term"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Live Interactive Index Preview Sheet */}
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-zinc-300 dark:border-zinc-700 shadow-inner">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-200 dark:border-zinc-800 text-xs">
                  <span className="font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 flex items-center gap-1.5">
                    <BookMarked className="w-3.5 h-3.5" /> Index Live Page Sheet Preview
                  </span>
                  <span className="text-[11px] text-zinc-400 italic">
                    Calculated automatically from chapter block occurrences
                  </span>
                </div>

                <IndexOfTerms
                  chapters={chapters}
                  frontMatter={frontMatter}
                  onRemoveTerm={handleRemoveCustomTerm}
                  interactive={true}
                />
              </div>
            </div>
          ) : (
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/20 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-lg text-xs text-zinc-500 text-center">
              Index of Terms is currently disabled. Check the option above to include an Index page in your book.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

