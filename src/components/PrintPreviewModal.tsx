import React, { useState } from 'react';
import {
  getChapterDisplayLabel,
  getChapterDisplayParts
} from '../lib/documentDisplayLabel';
import {
  classifyChapterBlocks,
  shouldShowChapterRunningHeader
} from '../lib/chapterPageRoles';
import { TableOfContents } from './TableOfContents';
import { IndexOfTerms } from './IndexOfTerms';
import { 
  Printer, 
  X, 
  Download, 
  FileText, 
  BookOpen, 
  FileCode, 
  Package, 
  ZoomIn, 
  ZoomOut, 
  Eye, 
  Check, 
  Layers,
  Sparkles
} from 'lucide-react';
import { BookProject, TrimSize, PageOrientation, MarginPreset } from '../types';
import { GOOGLE_FONTS } from '../lib/googleFonts';
import {
  getEffectiveTypography,
  resolveProjectTypography,
  resolveRunningHeaderText
} from '../lib/bookTypography';
import { resolveActivePalette, resolveBlockTextColour, resolveColourSettings } from '../lib/bookColours';
import { findPreviousParagraphContext, isFirstQualifyingParagraph, paragraphCss, resolveParagraphFormatting } from '../lib/paragraphFormatting';
import { paragraphFormattingWithDropCap, resolveDropCapFormatting } from '../lib/dropCaps';
import { DropCapText } from './DropCapText';
import { resolveSceneBreak, sceneBreakMark, sceneBreakTextAlign } from '../lib/sceneBreak';
import { AccountingBlock } from './blocks/AccountingBlock';
import { mathSourceForBlock } from '../lib/mathValidation';
import { DEFAULT_ACCOUNTING_FORMAT } from '../lib/accounting';
import { BlockType } from '../types';
import { resolveStructuredLists } from '../lib/structuredLists';
import { coverImageStyle, showCoverField } from '../lib/coverArtwork';
import { resolvePublishingGeometry } from '../lib/publishingGeometry';

const EquationRenderer = React.lazy(() =>
  import('./blocks/EquationRenderer').then((module) => ({ default: module.EquationRenderer }))
);
import { 
  exportToPDF, 
  exportToEPUB, 
  exportToMarkdown, 
  exportToTxt, 
  exportToHTML, 
  exportProjectJSON,
  resolveMargins
} from '../lib/exportUtils';

interface PrintPreviewModalProps {
  project: BookProject;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  project,
  isOpen,
  onClose
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [activeViewTab, setActiveViewTab] = useState<'all' | 'cover' | 'front' | 'chapters'>('all');
  const [selectedTrimSize, setSelectedTrimSize] = useState<TrimSize>(project.exportSettings.trimSize || '6x9');
  const [selectedOrientation, setSelectedOrientation] = useState<PageOrientation>(project.exportSettings.pageOrientation || 'portrait');
  const [selectedSerifFont, setSelectedSerifFont] = useState<string>(project.exportSettings.googleSerifFont || 'EB Garamond');
  const [selectedSansFont, setSelectedSansFont] = useState<string>(project.exportSettings.googleSansFont || 'Inter');
  const [selectedMarginPreset, setSelectedMarginPreset] = useState<MarginPreset>(project.exportSettings.marginPreset || 'auto');
  const [selectedHyphenation, setSelectedHyphenation] = useState<boolean>(
    project.exportSettings.enableHyphenation !== false && project.exportSettings.autoHyphenation !== false
  );

  const activePreviewMargins = resolveMargins({
    ...project.exportSettings,
    marginPreset: selectedMarginPreset,
    trimSize: selectedTrimSize
  }, project.category);
  const effectiveTypography = getEffectiveTypography({
    typography: resolveProjectTypography(project),
    pageSize: selectedTrimSize,
    orientation: selectedOrientation
  });
  const colourPalette = resolveActivePalette(resolveColourSettings(project));
  const isLegacyTypography = effectiveTypography.presetId === 'legacy';

  if (!isOpen) return null;

  const handlePrintPDF = () => {
    // Override project settings with user selections including Google Fonts & Cover
    const updatedProject: BookProject = {
      ...project,
      exportSettings: {
        ...project.exportSettings,
        trimSize: selectedTrimSize,
        pageOrientation: selectedOrientation,
        googleSerifFont: selectedSerifFont,
        googleSansFont: selectedSansFont,
        marginPreset: selectedMarginPreset,
        enableHyphenation: selectedHyphenation,
        autoHyphenation: selectedHyphenation,
        includeCover: true
      }
    };
    exportToPDF(updatedProject);
  };

  const getTrimDimensions = () => {
    const geometry = resolvePublishingGeometry({ ...project.exportSettings, trimSize: selectedTrimSize });
    const width = selectedOrientation === 'landscape' ? geometry.trimHeightInches : geometry.trimWidthInches;
    const height = selectedOrientation === 'landscape' ? geometry.trimWidthInches : geometry.trimHeightInches;
    const previewPixelsPerInch = 93.333;
    return { width: `${width * previewPixelsPerInch}px`, minHeight: `${height * previewPixelsPerInch}px` };
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col select-none">
      
      {/* Top Controls Header Bar */}
      <div className="min-h-[60px] py-2 border-b border-[#333333] bg-[#1E1E1E] px-3 sm:px-4 flex flex-wrap md:flex-nowrap items-center justify-between text-gray-200 shrink-0 gap-2 max-w-full overflow-x-auto scrollbar-thin">
        
        {/* Left Title & Status */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="p-1.5 rounded bg-[#FF6B00] text-black font-bold">
            <Printer className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider whitespace-nowrap">Print Preview</h2>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono font-bold whitespace-nowrap">Ready</span>
            </div>
            <p className="hidden lg:block text-[11px] text-gray-400">Preview margins, headers & page breaks before saving.</p>
          </div>
        </div>

        {/* Center Zoom & Layout Controls */}
        <div className="flex items-center gap-2 bg-[#121212] border border-[#333] rounded-lg p-1 max-w-full overflow-x-auto whitespace-nowrap shrink scrollbar-none">
          <div className="flex items-center gap-1 border-r border-[#333] pr-2 shrink-0">
            <span className="text-[10px] text-gray-400 uppercase font-bold hidden sm:inline">Paper:</span>
            <select
              value={selectedTrimSize}
              onChange={(e) => setSelectedTrimSize(e.target.value as TrimSize)}
              className="bg-[#1E1E1E] border border-[#444] text-xs font-bold text-gray-200 rounded px-1.5 py-1 focus:outline-hidden cursor-pointer"
            >
              <option value="6x9">6" x 9" Trade</option>
              <option value="8.5x11">8.5" x 11" Academic</option>
              <option value="A5">A5 European (148x210mm)</option>
              <option value="5x8">5" x 8" Pocket</option>
            </select>
          </div>

          {/* Google Fonts Controls */}
          <div className="hidden sm:flex items-center gap-1 border-r border-[#333] pr-2 shrink-0">
            <span className="text-[10px] text-orange-400 uppercase font-bold">Fonts:</span>
            <select
              value={selectedSerifFont}
              onChange={(e) => setSelectedSerifFont(e.target.value)}
              className="bg-[#1E1E1E] border border-orange-500/40 text-xs font-semibold text-orange-300 rounded px-1 py-1 focus:outline-hidden cursor-pointer max-w-[110px]"
              title="Serif Font for Body Text"
            >
              {GOOGLE_FONTS.filter(f => f.category === 'serif').map(f => (
                <option key={f.id} value={f.name}>{f.name}</option>
              ))}
            </select>
            <select
              value={selectedSansFont}
              onChange={(e) => setSelectedSansFont(e.target.value)}
              className="bg-[#1E1E1E] border border-blue-500/40 text-xs font-semibold text-blue-300 rounded px-1 py-1 focus:outline-hidden cursor-pointer max-w-[100px]"
              title="Sans-Serif Font for Headings"
            >
              {GOOGLE_FONTS.filter(f => f.category === 'sans-serif').map(f => (
                <option key={f.id} value={f.name}>{f.name}</option>
              ))}
            </select>
          </div>

          {/* Page Margins Selector */}
          <div className="flex items-center gap-1 border-r border-[#333] pr-2 shrink-0">
            <span className="text-[10px] text-amber-400 uppercase font-bold">Margins:</span>
            <select
              value={selectedMarginPreset}
              onChange={(e) => setSelectedMarginPreset(e.target.value as MarginPreset)}
              className="bg-[#1E1E1E] border border-amber-500/40 text-xs font-bold text-amber-300 rounded px-1.5 py-1 focus:outline-hidden cursor-pointer max-w-[140px]"
              title="Select Page Margins or Auto-Fix based on Book Type"
            >
              <option value="auto">✨ Auto-Fix ({project.category})</option>
              <option value="compact">📏 Compact (0.5 in)</option>
              <option value="standard">📖 Standard (0.75 in)</option>
              <option value="generous">📜 Generous (1.0 in)</option>
              <option value="custom">⚙️ Custom Margins</option>
            </select>
          </div>

          <div className="hidden sm:flex items-center gap-1 border-r border-[#333] pr-2 shrink-0">
            <div className="flex items-center gap-0.5 bg-[#1E1E1E] border border-[#444] rounded p-0.5">
              <button
                onClick={() => setSelectedOrientation('portrait')}
                className={`px-1.5 py-0.5 text-xs font-bold rounded cursor-pointer ${
                  selectedOrientation === 'portrait' ? 'bg-[#FF6B00] text-black' : 'text-gray-400 hover:text-white'
                }`}
                title="Portrait Page Orientation"
              >
                Portrait
              </button>
              <button
                onClick={() => setSelectedOrientation('landscape')}
                className={`px-1.5 py-0.5 text-xs font-bold rounded cursor-pointer ${
                  selectedOrientation === 'landscape' ? 'bg-[#FF6B00] text-black' : 'text-gray-400 hover:text-white'
                }`}
                title="Landscape Page Orientation (Auto Page Break)"
              >
                Landscape
              </button>
            </div>
          </div>

          {/* Hyphenation Toggle */}
          <div className="flex items-center gap-1 border-r border-[#333] pr-2 shrink-0">
            <button
              onClick={() => setSelectedHyphenation(!selectedHyphenation)}
              className={`px-2 py-1 text-xs font-bold rounded border transition-colors cursor-pointer flex items-center gap-1 ${
                selectedHyphenation 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                  : 'bg-[#1E1E1E] text-zinc-400 border-[#444]'
              }`}
              title="Toggle automatic hyphenation for clean justified text layout"
            >
              <span className="text-[10px] uppercase font-bold text-gray-400">Hyphenation:</span>
              <span className={selectedHyphenation ? 'text-emerald-400 font-extrabold' : 'text-zinc-500'}>
                {selectedHyphenation ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>

          {/* Section Filter Tabs */}
          <div className="hidden md:flex items-center gap-1 border-r border-[#333] pr-2 shrink-0">
            <button
              onClick={() => setActiveViewTab('all')}
              className={`px-1.5 py-1 text-xs font-bold rounded transition-colors ${activeViewTab === 'all' ? 'bg-[#FF6B00] text-black' : 'text-gray-400 hover:text-white'}`}
            >
              All
            </button>
            <button
              onClick={() => setActiveViewTab('cover')}
              className={`px-1.5 py-1 text-xs font-bold rounded transition-colors ${activeViewTab === 'cover' ? 'bg-[#FF6B00] text-black' : 'text-gray-400 hover:text-white'}`}
            >
              Cover
            </button>
            <button
              onClick={() => setActiveViewTab('front')}
              className={`px-1.5 py-1 text-xs font-bold rounded transition-colors ${activeViewTab === 'front' ? 'bg-[#FF6B00] text-black' : 'text-gray-400 hover:text-white'}`}
            >
              Front Matter
            </button>
            <button
              onClick={() => setActiveViewTab('chapters')}
              className={`px-1.5 py-1 text-xs font-bold rounded transition-colors ${activeViewTab === 'chapters' ? 'bg-[#FF6B00] text-black' : 'text-gray-400 hover:text-white'}`}
            >
              Chapters
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setZoomLevel(prev => Math.max(50, prev - 15))}
              className="p-1 rounded hover:bg-[#333] text-gray-400 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono w-8 text-center font-bold">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel(prev => Math.min(150, prev + 15))}
              className="p-1 rounded hover:bg-[#333] text-gray-400 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Actions Bar */}
        <div className="flex items-center gap-2">
          
          {/* Save / Export Quick Dropdown */}
          <div className="flex items-center gap-1 bg-[#121212] border border-[#333] p-1 rounded-lg">
            <button
              onClick={handlePrintPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#FF6B00] hover:bg-orange-600 text-black font-bold text-xs shadow-md transition-colors cursor-pointer"
              title="Open Browser Print Dialog to Save as PDF or Print"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={() => exportToMarkdown(project)}
              className="px-2 py-1.5 rounded bg-[#2a2a2a] hover:bg-[#333] text-gray-200 text-xs font-bold transition-colors border border-[#444]"
              title="Save as Markdown (.md)"
            >
              .MD
            </button>

            <button
              onClick={() => exportToTxt(project)}
              className="px-2 py-1.5 rounded bg-[#2a2a2a] hover:bg-[#333] text-gray-200 text-xs font-bold transition-colors border border-[#444]"
              title="Save as Plain Text (.txt)"
            >
              .TXT
            </button>

            <button
              onClick={() => exportToHTML(project)}
              className="px-2 py-1.5 rounded bg-[#2a2a2a] hover:bg-[#333] text-gray-200 text-xs font-bold transition-colors border border-[#444]"
              title="Save as HTML (.html)"
            >
              .HTML
            </button>

            <button
              onClick={() => exportToEPUB(project)}
              className="px-2 py-1.5 rounded bg-[#2a2a2a] hover:bg-[#333] text-gray-200 text-xs font-bold transition-colors border border-[#444]"
              title="Save as EPUB (.epub)"
            >
              .EPUB
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded bg-[#262626] hover:bg-[#333] text-gray-400 hover:text-white transition-colors border border-[#444] cursor-pointer"
            title="Close Preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Interactive Page Sheet Scroll View */}
      <div className="flex-1 overflow-y-auto bg-[#121212] p-8 flex flex-col items-center gap-10">
        
        <div 
          className="flex flex-col items-center gap-12 transition-all duration-200"
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
        >
          
          {/* COVER PAGE PREVIEW */}
          {(activeViewTab === 'all' || activeViewTab === 'cover') && project.exportSettings.includeCover && (
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-gray-400 font-mono font-bold uppercase tracking-widest">Book Cover Page</span>
              <div 
                className="shadow-2xl p-10 flex flex-col justify-between text-center relative overflow-hidden transition-all"
                style={{
                  ...getTrimDimensions(),
                  backgroundColor: project.cover.coverBgColor || '#1c1917',
                  color: project.cover.textColor || '#ffffff'
                }}
              >
                {/* Full Bleed Image Background */}
                {project.cover.artworkUrl && project.cover.fullBleedImage && (
                  <>
                    <img 
                      src={project.cover.artworkUrl} 
                      alt="Full Bleed Cover Background" 
                      className="absolute inset-0 w-full h-full object-cover transition-opacity"
                      style={coverImageStyle(project.cover)}
                      referrerPolicy="no-referrer"
                    />
                    {project.cover.showBookDetails !== false && <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/60 pointer-events-none" />}
                  </>
                )}

                {project.cover.showBookDetails !== false && <div className="relative z-10">
                  {showCoverField(project.cover, 'series') && project.series?.isSeries && <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: project.cover.accentColor }}>{[project.series.seriesTitle, project.series.seriesNumber].filter(Boolean).join(' · ')}</div>}
                  {showCoverField(project.cover, 'title') && <h1 className="text-3xl font-extrabold tracking-wider uppercase mb-2 drop-shadow-md" style={{ color: project.cover.textColor }}>
                    {project.cover.title || project.title}
                  </h1>}
                  {showCoverField(project.cover, 'subtitle') && <p className="text-sm font-serif italic mb-6 drop-shadow-sm" style={{ color: project.cover.accentColor || '#ea580c' }}>
                    {project.cover.subtitle || project.subtitle}
                  </p>}
                  {project.cover.artworkUrl && !project.cover.fullBleedImage && (
                    <img 
                      src={project.cover.artworkUrl} 
                      alt="Cover Illustration" 
                      className="max-h-64 mx-auto rounded border-2 object-cover shadow-lg my-4"
                      style={{ borderColor: project.cover.accentColor || '#ea580c', ...coverImageStyle(project.cover) }}
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>}

                {project.cover.showBookDetails === false && project.cover.artworkUrl && !project.cover.fullBleedImage && (
                  <img src={project.cover.artworkUrl} alt="Cover Illustration" className="max-h-64 mx-auto object-cover my-auto" style={coverImageStyle(project.cover)} referrerPolicy="no-referrer" />
                )}

                {project.cover.showBookDetails !== false && <div className="relative z-10">
                  {showCoverField(project.cover, 'author') && <p className="text-lg font-bold tracking-widest uppercase drop-shadow-sm">{project.cover.author || project.author}</p>}
                  {showCoverField(project.cover, 'imprint') && <p className="text-xs opacity-80 font-mono uppercase mt-2">{project.cover.publisher || project.frontMatter.publisher}</p>}
                </div>}
              </div>
            </div>
          )}

          {/* FRONT MATTER / TITLE PAGE PREVIEW */}
          {(activeViewTab === 'all' || activeViewTab === 'front') && project.exportSettings.includeFrontMatter && (
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-gray-400 font-mono font-bold uppercase tracking-widest">Front Matter & Title Page</span>
              <div className="bg-white text-zinc-900 shadow-2xl p-12 flex flex-col justify-between relative" style={getTrimDimensions()}>
                
                {/* Watermark overlay if enabled */}
                {project.watermark.enabled && (
                  <div 
                    className="absolute inset-0 pointer-events-none flex items-center justify-center font-black text-gray-300 uppercase tracking-widest opacity-20 select-none"
                    style={{ transform: `rotate(${project.watermark.rotation}deg)`, fontSize: `${project.watermark.fontSize}px` }}
                  >
                    {project.watermark.text}
                  </div>
                )}

                <div className="text-center pt-16">
                  <h1 className="text-3xl font-serif font-bold uppercase tracking-wide mb-2">{project.title}</h1>
                  <p className="text-base font-serif italic text-zinc-600 mb-8">{project.subtitle}</p>
                  <p className="text-sm font-serif font-bold uppercase tracking-widest mt-12">{project.author}</p>
                </div>

                <div className="border-t border-zinc-200 pt-6 text-xs text-zinc-500 font-serif leading-relaxed">
                  <p>Published by <strong>{project.frontMatter.publisher || 'PressCraft Publishing'}</strong></p>
                  <p>ISBN: {project.frontMatter.isbn || '978-1-23456-789-0'}</p>
                  <p className="mt-2 text-[10px] text-zinc-400">{project.frontMatter.copyrightText}</p>
                </div>
              </div>
            </div>
          )}

          {/* EXECUTIVE SUMMARY PREVIEW */}
          {(activeViewTab === 'all' || activeViewTab === 'front') && project.exportSettings.includeExecSummary && project.frontMatter.executiveSummaryContent && (
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-gray-400 font-mono font-bold uppercase tracking-widest">Executive Summary</span>
              <div className="bg-white text-zinc-900 shadow-2xl p-12 flex flex-col relative" style={getTrimDimensions()}>
                <h2 className="text-xl font-serif font-bold border-b-2 border-orange-500 pb-2 mb-6">Executive Summary</h2>
                <div className="bg-amber-50/50 border-l-4 border-orange-500 p-6 rounded text-sm font-serif leading-relaxed text-zinc-800 whitespace-pre-wrap">
                  {project.frontMatter.executiveSummaryContent}
                </div>
              </div>
            </div>
          )}

          {/* TABLE OF CONTENTS PREVIEW */}
          {(activeViewTab === 'all' || activeViewTab === 'front') && project.exportSettings.includeTOC && (
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-gray-400 font-mono font-bold uppercase tracking-widest">Table of Contents</span>
              <div className="bg-white text-zinc-900 shadow-2xl p-10 flex flex-col relative" style={getTrimDimensions()}>
                <TableOfContents
                  chapters={project.chapters}
                  frontMatter={project.frontMatter}
                  interactive={false}
                />
              </div>
            </div>
          )}

          {/* INDEX OF TERMS PREVIEW */}
          {(activeViewTab === 'all' || activeViewTab === 'front') && (project.frontMatter.includeIndex || project.exportSettings.includeIndex) && (
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-gray-400 font-mono font-bold uppercase tracking-widest">Index of Terms</span>
              <div className="bg-white text-zinc-900 shadow-2xl p-10 flex flex-col relative" style={getTrimDimensions()}>
                <IndexOfTerms
                  chapters={project.chapters}
                  frontMatter={project.frontMatter}
                  interactive={false}
                />
              </div>
            </div>
          )}

          {/* CHAPTER PAGES PREVIEW */}
          {(activeViewTab === 'all' || activeViewTab === 'chapters') && (
            project.chapters.map((ch) => {
              const displayParts = getChapterDisplayParts(ch.number, ch.title);
              return (
              <div key={ch.id} className="flex flex-col items-center gap-2">
                <span className="text-xs text-gray-400 font-mono font-bold uppercase tracking-widest">{getChapterDisplayLabel(ch.number, ch.title)}</span>
                {classifyChapterBlocks(ch.blocks).map((page, pageIndex) => (
                <div 
                  key={`${ch.id}-${pageIndex}`}
                  className="bg-white text-zinc-900 shadow-2xl flex flex-col justify-between relative transition-all"
                  data-page-role={page.role}
                  style={{
                    ...getTrimDimensions(),
                    paddingTop: activePreviewMargins.top,
                    paddingRight: activePreviewMargins.right,
                    paddingBottom: activePreviewMargins.bottom,
                    paddingLeft: activePreviewMargins.left,
                    fontFamily: isLegacyTypography ? undefined : effectiveTypography.body.fontFamily,
                    fontSize: isLegacyTypography ? undefined : `${effectiveTypography.body.fontSizePt}pt`,
                    lineHeight: isLegacyTypography ? undefined : effectiveTypography.body.lineHeight,
                    color: isLegacyTypography ? undefined : effectiveTypography.body.textColour
                  }}
                >
                  
                  {/* Watermark overlay */}
                  {project.watermark.enabled && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0 select-none">
                      {project.watermark.imageUrl && (project.watermark.type === 'image' || project.watermark.type === 'both') && (
                        <img
                          src={project.watermark.imageUrl}
                          alt="Watermark Overlay"
                          className="absolute inset-0 w-full h-full object-contain pointer-events-none transition-all"
                          style={{
                            opacity: project.watermark.opacity,
                            transform: `scale(${project.watermark.imageScale || 1.0})`,
                            objectFit: project.watermark.imagePosition === 'stretch' ? 'cover' : 'contain',
                          }}
                        />
                      )}
                      {(project.watermark.type === 'text' || project.watermark.type === 'both' || !project.watermark.type) && project.watermark.text && (
                        <div 
                          className="font-black text-gray-400 uppercase tracking-widest text-center"
                          style={{
                            opacity: project.watermark.opacity,
                            transform: `rotate(${project.watermark.rotation}deg)`,
                            fontSize: `${project.watermark.fontSize}px`
                          }}
                        >
                          {project.watermark.text}
                        </div>
                      )}
                    </div>
                  )}

                  {shouldShowChapterRunningHeader(
                    page.role,
                    project.exportSettings.showRunningHeader &&
                      effectiveTypography.continuation.enabled &&
                      !(
                        page.role === 'chapter-opening' &&
                        effectiveTypography.runningHeaders.suppressOnChapterOpening
                      )
                  ) && (
                    <div className={isLegacyTypography
                      ? 'pb-2 mb-8 border-b-2 border-zinc-900 font-serif font-bold text-sm uppercase tracking-wider text-zinc-900 flex items-center justify-between'
                      : 'pb-2 mb-8 uppercase tracking-wider flex items-center justify-between'} style={isLegacyTypography ? undefined : {
                      fontFamily: effectiveTypography.continuation.fontFamily,
                      fontSize: `${effectiveTypography.continuation.fontSizePt}pt`,
                      fontWeight: effectiveTypography.continuation.fontWeight,
                      color: effectiveTypography.continuation.fontColour,
                      borderBottom: effectiveTypography.continuation.showDivider
                        ? `${effectiveTypography.continuation.dividerThicknessPt}pt solid ${effectiveTypography.continuation.dividerColour}`
                        : undefined
                    }}>
                      <span>{resolveRunningHeaderText(
                        pageIndex % 2 === 0
                          ? effectiveTypography.runningHeaders.oddPageSource
                          : effectiveTypography.runningHeaders.evenPageSource,
                        project,
                        getChapterDisplayLabel(ch.number, ch.title),
                        pageIndex % 2 === 0
                          ? effectiveTypography.runningHeaders.customOddText
                          : effectiveTypography.runningHeaders.customEvenText
                      )}</span>
                      <span className="text-xs font-mono font-normal text-zinc-500 lowercase italic">(continued)</span>
                    </div>
                  )}

                  {/* Chapter Body Content */}
                  <div className="flex-1 space-y-4">
                    {page.role === 'chapter-opening' && (
                    <div className={isLegacyTypography ? 'text-center mt-8 mb-10 pb-5 border-b-2 border-zinc-300' : undefined} style={isLegacyTypography ? undefined : {
                      textAlign: effectiveTypography.chapterOpening.alignment === 'centre' ? 'center' : effectiveTypography.chapterOpening.alignment,
                      paddingTop: `${effectiveTypography.chapterOpening.topSpacingPt}pt`,
                      marginBottom: `${effectiveTypography.chapterOpening.titleToBodySpacingPt}pt`,
                      borderBottom: effectiveTypography.chapterOpening.showDivider
                        ? `${effectiveTypography.chapterOpening.dividerThicknessPt}pt solid ${effectiveTypography.chapterOpening.dividerColour}`
                        : undefined
                    }}>
                      <span className={isLegacyTypography ? 'text-xl font-serif font-bold text-zinc-900 block mb-3' : 'block'} style={isLegacyTypography ? undefined : {
                        fontFamily: effectiveTypography.chapterOpening.numberFontFamily,
                        fontSize: `${effectiveTypography.chapterOpening.numberFontSizePt}pt`,
                        fontWeight: effectiveTypography.chapterOpening.numberWeight,
                        color: effectiveTypography.chapterOpening.numberColour,
                        marginBottom: `${effectiveTypography.chapterOpening.numberToTitleSpacingPt}pt`
                      }}>{displayParts.numberLabel}</span>
                      {displayParts.titleLabel && (
                        <h1 className={isLegacyTypography ? 'text-2xl font-serif font-bold' : undefined} style={isLegacyTypography ? undefined : {
                          fontFamily: effectiveTypography.chapterOpening.titleFontFamily,
                          fontSize: `${effectiveTypography.chapterOpening.titleFontSizePt}pt`,
                          fontWeight: effectiveTypography.chapterOpening.titleWeight,
                          color: effectiveTypography.chapterOpening.titleColour
                        }}>{displayParts.titleLabel}</h1>
                      )}
                      {ch.subtitle && <p className={isLegacyTypography ? 'text-sm font-serif italic text-zinc-600 mt-1' : 'italic mt-1'} style={isLegacyTypography ? undefined : {
                        fontFamily: effectiveTypography.chapterOpening.subtitleFontFamily,
                        fontSize: `${effectiveTypography.chapterOpening.subtitleFontSizePt}pt`,
                        fontWeight: effectiveTypography.chapterOpening.subtitleWeight,
                        color: effectiveTypography.chapterOpening.subtitleColour
                      }}>{ch.subtitle}</p>}
                    </div>
                    )}

                    <div 
                      className="space-y-3 font-serif text-sm leading-relaxed text-zinc-800 text-justify"
                      style={{
                        hyphens: selectedHyphenation ? 'auto' : 'none',
                        WebkitHyphens: selectedHyphenation ? 'auto' : 'none'
                      }}
                    >
                      {page.blocks.map((block) => {
                        if(block.type==='scene-break'){const s=resolveSceneBreak(block);return <div key={block.id} role="separator" aria-label="Scene break" style={{textAlign:sceneBreakTextAlign(s.alignment),marginTop:`${s.spacingBeforePt}pt`,marginBottom:`${s.spacingAfterPt}pt`,breakAfter:s.keepWithNext?'avoid':undefined}}>{s.style==='rule'?<hr />:<span aria-hidden={s.style!=='custom'}>{s.style==='whitespace'?'':sceneBreakMark(s)}</span>}</div>;}
                        if ((['latex', 'math-inline', 'math-display', 'math-aligned', 'formula'] as BlockType[]).includes(block.type)) return <div key={block.id} className="my-3 break-inside-avoid text-center"><React.Suspense fallback={<span className="font-mono text-sm">{mathSourceForBlock(block)}</span>}><EquationRenderer data={block.mathData} formula={mathSourceForBlock(block)} displayMode={block.type !== 'math-inline'} /></React.Suspense></div>;
                        if ((['accounting-table', 'journal-entry', 'trial-balance', 'financial-statement'] as BlockType[]).includes(block.type)) return <div key={block.id} className="my-3 break-inside-avoid"><AccountingBlock block={block} format={project.accountingFormat ?? DEFAULT_ACCOUNTING_FORMAT} readOnly /></div>;
                        const index=ch.blocks.findIndex(candidate=>candidate.id===block.id);
                        const paragraphFormatting=resolveParagraphFormatting(block,findPreviousParagraphContext(ch.blocks,index),isFirstQualifyingParagraph(ch.blocks,index)?0:index,effectiveTypography);
                        const dropCap=resolveDropCapFormatting({block,blocks:ch.blocks,index,typography:effectiveTypography,palette:colourPalette,paragraphFormatting});
                        const ps=paragraphCss(paragraphFormattingWithDropCap(paragraphFormatting,dropCap));
                        const listItem=resolveStructuredLists(ch.blocks,{accent:colourPalette.colours.accent,body:colourPalette.colours.bodyText}).get(block.id);
                        if (block.type === 'heading') return <h2 key={block.id} style={{...ps,color:resolveBlockTextColour(block,colourPalette)}} className="text-lg font-bold font-serif">{block.text}</h2>;
                        if (block.type === 'subheading') return <h3 key={block.id} style={{...ps,color:resolveBlockTextColour(block,colourPalette)}} className="text-base font-semibold font-serif">{block.text}</h3>;
                        if (block.type === 'worked-example') return <h3 key={block.id} className="break-after-avoid border-l-4 border-orange-500 bg-orange-50 p-2 text-lg font-bold">{block.text}</h3>;
                        if (block.type === 'solution-step') return <h4 key={block.id} className="break-after-avoid border-l-4 border-sky-500 p-2 font-semibold">{block.text}</h4>;
                        if (block.type === 'clause') return <div key={block.id} style={{...ps,color:resolveBlockTextColour(block,colourPalette)}} className="font-bold">{block.text}</div>;
                        if (block.type === 'quote') return <blockquote key={block.id} style={{...ps,color:resolveBlockTextColour(block,colourPalette),borderColor:colourPalette.colours.accent}} className="border-l-2 italic text-center">{block.text}</blockquote>;
                        if (block.type === 'code') return <pre key={block.id} className="bg-zinc-900 text-zinc-100 p-3 rounded text-xs font-mono my-3 overflow-x-auto">{block.codeSnippet || block.text}</pre>;
                        if (block.type === 'image' && block.imageUrl) {
                          const caption = block.imageCaption || block.text;
                          if (block.imageWrap === 'background-watermark') {
                            return (
                              <img
                                key={block.id}
                                src={block.imageUrl}
                                alt={caption || 'Scene Watermark'}
                                className="absolute inset-0 w-full h-full object-contain pointer-events-none transition-all z-0"
                                style={{ opacity: block.imageOpacity ?? 0.2 }}
                              />
                            );
                          }
                          return (
                            <div
                              key={block.id}
                              className={`my-3 overflow-hidden ${
                                block.imageWrap === 'left'
                                  ? 'float-left mr-4 mb-2 max-w-[45%]'
                                  : block.imageWrap === 'right'
                                  ? 'float-right ml-4 mb-2 max-w-[45%]'
                                  : block.imageWrap === 'full'
                                  ? 'w-full text-center'
                                  : 'text-center mx-auto'
                              }`}
                              style={{ width: block.imageWrap === 'left' || block.imageWrap === 'right' ? block.imageWidth || '45%' : block.imageWidth || '100%' }}
                            >
                              <img
                                src={block.imageUrl}
                                alt={caption || 'Illustration'}
                                className={`mx-auto rounded border shadow-sm max-h-72 object-contain ${
                                  block.imageFrameStyle === 'polaroid'
                                    ? 'p-2 bg-white border-2 border-zinc-300 shadow-md transform -rotate-1'
                                    : block.imageFrameStyle === 'vintage'
                                    ? 'sepia contrast-125 border-2 border-amber-800/40'
                                    : block.imageFrameStyle === 'rounded'
                                    ? 'rounded-2xl'
                                    : 'rounded'
                                }`}
                                style={{ opacity: block.imageOpacity ?? 1.0 }}
                              />
                              {caption && (
                                <p className="text-[11px] font-serif italic text-zinc-500 text-center mt-1">
                                  {caption}
                                </p>
                              )}
                            </div>
                          );
                        }
                        if(block.type==='paragraph'&&listItem)return <div key={block.id} role="listitem" aria-level={listItem.level+1} style={{display:'flex',paddingLeft:`${listItem.leftIndentPt}pt`,marginTop:`${listItem.spacingBeforePt}pt`,marginBottom:`${listItem.spacingAfterPt}pt`,color:resolveBlockTextColour(block,colourPalette)}}><span aria-hidden="true" style={{flex:'none',width:`${listItem.hangingIndentPt}pt`,marginRight:'6pt',textAlign:'right',color:listItem.markerColour,fontSize:`${listItem.markerSizePercent}%`}}>{listItem.markerText}</span><span>{block.text}</span></div>;
                        if(block.type==='paragraph')return <p key={block.id} style={{...ps,color:resolveBlockTextColour(block,colourPalette)}}><DropCapText text={block.text} resolved={dropCap}/></p>;
                        return <p key={block.id} style={{...ps,color:resolveBlockTextColour(block,colourPalette)}}>{block.text}</p>;
                      })}
                    </div>
                  </div>

                  {/* Page Footer Number */}
                  <div className="mt-8 pt-4 border-t border-zinc-100 text-center font-serif text-xs text-zinc-400">
                    - {ch.number + 2} -
                  </div>
                </div>
                ))}
              </div>
              );
            })
          )}

        </div>
      </div>

    </div>
  );
};
