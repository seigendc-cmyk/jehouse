import React, { useState, useEffect } from 'react';
import { Minimize2, Volume2, VolumeX, Sun, Moon, Clock } from 'lucide-react';
import { BookColourSettings, BookTypographySettings, Chapter, PageOrientation, TrimSize } from '../types';
import { getChapterDisplayLabel } from '../lib/documentDisplayLabel';
import { getEffectiveTypography, resolveProjectTypography } from '../lib/bookTypography';
import { resolveActivePalette, resolveBlockTextColour } from '../lib/bookColours';
import { findPreviousParagraphContext, isFirstQualifyingParagraph, paragraphCss, resolveParagraphFormatting } from '../lib/paragraphFormatting';
import { paragraphFormattingWithDropCap, resolveDropCapFormatting } from '../lib/dropCaps';
import { DropCapText } from './DropCapText';
import { resolveSceneBreak, sceneBreakMark, sceneBreakTextAlign } from '../lib/sceneBreak';
import { AccountingBlock } from './blocks/AccountingBlock';
import { createMathData, mathSourceForBlock } from '../lib/mathValidation';
import { DEFAULT_ACCOUNTING_FORMAT } from '../lib/accounting';
import { BlockType } from '../types';

const EquationRenderer = React.lazy(() =>
  import('./blocks/EquationRenderer').then((module) => ({ default: module.EquationRenderer }))
);

interface FocusModeProps {
  chapter: Chapter;
  isOpen: boolean;
  onClose: () => void;
  onUpdateChapter: (updated: Chapter) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  typography?: BookTypographySettings;
  trimSize?: TrimSize;
  pageOrientation?: PageOrientation;
  colourSettings?: BookColourSettings;
}

export const FocusMode: React.FC<FocusModeProps> = ({
  chapter,
  isOpen,
  onClose,
  onUpdateChapter,
  darkMode,
  onToggleDarkMode,
  typography,
  trimSize = '6x9',
  pageOrientation = 'portrait',
  colourSettings
}) => {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [focusedBlockIdx, setFocusedBlockIdx] = useState(0);

  if (!isOpen) return null;
  const effectiveTypography = getEffectiveTypography({
    typography: resolveProjectTypography({ typography }),
    pageSize: trimSize as TrimSize,
    orientation: pageOrientation as PageOrientation
  });
  const typographyStyle = effectiveTypography.presetId === 'legacy' ? undefined : {
    fontFamily: effectiveTypography.body.fontFamily,
    fontSize: `${effectiveTypography.body.fontSizePt}pt`,
    lineHeight: effectiveTypography.body.lineHeight,
    color: darkMode ? undefined : effectiveTypography.body.textColour
  };
  const palette = resolveActivePalette(colourSettings ?? {schemaVersion:1,activePaletteId:'classic-black',customPalettes:[],recentColours:[]});

  // Simple Web Audio API typewriter sound simulator
  const playTypewriterClick = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600 + Math.random() * 200, ctx.currentTime);
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {}
  };

  const handleTextChange = (blockId: string, text: string) => {
    playTypewriterClick();
    const updatedBlocks = chapter.blocks.map((b) => (b.id === blockId ? { ...b, text } : b));
    
    // Recalculate word count
    const totalWords = updatedBlocks.reduce((acc, b) => acc + b.text.trim().split(/\s+/).filter(Boolean).length, 0);
    onUpdateChapter({ ...chapter, blocks: updatedBlocks, wordCount: totalWords });
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col transition-colors ${darkMode ? 'bg-[#1c0d0b] text-[#fff6f2]' : 'bg-[#faf9f5] text-zinc-900'}`}>
      
      {/* Top Minimal Chrome Header */}
      <header className="px-8 py-4 flex items-center justify-between opacity-40 hover:opacity-100 transition-opacity select-none">
        <div className="flex items-center gap-3 text-xs font-semibold">
          <span className="text-orange-500 font-bold uppercase tracking-wider">
            {getChapterDisplayLabel(chapter.number, chapter.title)} Focus View
          </span>
          <span>•</span>
          <span>{chapter.wordCount} words</span>
          <span>•</span>
          <span>~{Math.ceil(chapter.wordCount / 250)} min read</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-full hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 text-xs flex items-center gap-1"
            title="Toggle Typewriter Sound Effect"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-orange-500" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-full hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 text-xs flex items-center gap-1 font-bold"
            title="Exit Focus Mode"
          >
            <Minimize2 className="w-4 h-4" />
            <span className="hidden sm:inline">Exit Focus</span>
          </button>
        </div>
      </header>

      {/* Main Centered Minimalist Typewriter Canvas */}
      <main className="flex-1 overflow-y-auto px-6 py-12 flex justify-center">
        <div className="w-full max-w-2xl space-y-6 font-serif leading-loose text-lg" style={typographyStyle}>
          
          <h1 className="text-3xl font-black font-sans text-center tracking-tight mb-8" style={effectiveTypography.presetId === 'legacy' ? undefined : {
            fontFamily: effectiveTypography.chapterOpening.titleFontFamily,
            fontSize: `${effectiveTypography.chapterOpening.titleFontSizePt}pt`,
            fontWeight: effectiveTypography.chapterOpening.titleWeight,
            textAlign: effectiveTypography.chapterOpening.alignment === 'centre' ? 'center' : effectiveTypography.chapterOpening.alignment
          }}>
            {chapter.title}
          </h1>

          {chapter.blocks.map((block, idx) => {
            const isFocused = focusedBlockIdx === idx;
            if(block.type==='scene-break'){const s=resolveSceneBreak(block);return <div key={block.id} role="separator" aria-label="Scene break" style={{textAlign:sceneBreakTextAlign(s.alignment),marginTop:`${s.spacingBeforePt}pt`,marginBottom:`${s.spacingAfterPt}pt`,breakAfter:s.keepWithNext?'avoid':undefined}}>{s.style==='rule'?<hr />:<span aria-hidden={s.style!=='custom'}>{s.style==='whitespace'?'':sceneBreakMark(s)}</span>}</div>;}
            if ((['latex', 'math-inline', 'math-display', 'math-aligned', 'formula'] as BlockType[]).includes(block.type)) {
              return (
                <div key={block.id} className="rounded border border-transparent p-2 hover:border-orange-400" onClick={() => setFocusedBlockIdx(idx)}>
                  {isFocused ? (
                    <div className="space-y-2">
                      <textarea
                        aria-label="Edit LaTeX source"
                        className="w-full rounded border bg-transparent p-2 font-mono text-sm"
                        value={mathSourceForBlock(block)}
                        onChange={(event) => {
                          const source = event.target.value;
                          const mode = block.type === 'math-inline' ? 'inline' : block.type === 'math-aligned' ? 'aligned' : 'display';
                          const updatedBlocks = chapter.blocks.map((item) => item.id === block.id ? { ...item, latexFormula: source, mathData: createMathData(source, mode) } : item);
                          onUpdateChapter({ ...chapter, blocks: updatedBlocks });
                        }}
                      />
                      <React.Suspense fallback={<span className="font-mono text-sm">{mathSourceForBlock(block)}</span>}><EquationRenderer data={block.mathData} formula={mathSourceForBlock(block)} displayMode={block.type !== 'math-inline'} /></React.Suspense>
                    </div>
                  ) : <React.Suspense fallback={<span className="font-mono text-sm">{mathSourceForBlock(block)}</span>}><EquationRenderer data={block.mathData} formula={mathSourceForBlock(block)} displayMode={block.type !== 'math-inline'} /></React.Suspense>}
                </div>
              );
            }
            if ((['accounting-table', 'journal-entry', 'trial-balance', 'financial-statement'] as BlockType[]).includes(block.type)) {
              return <div key={block.id} onClick={() => setFocusedBlockIdx(idx)}><AccountingBlock block={block} format={DEFAULT_ACCOUNTING_FORMAT} readOnly /></div>;
            }

            const paragraphFormatting=resolveParagraphFormatting(block,findPreviousParagraphContext(chapter.blocks,idx),isFirstQualifyingParagraph(chapter.blocks,idx)?0:idx,effectiveTypography);
            const dropCap=resolveDropCapFormatting({block,blocks:chapter.blocks,index:idx,typography:effectiveTypography,palette,paragraphFormatting});
            const resolvedParagraph=paragraphFormattingWithDropCap(paragraphFormatting,dropCap);
            return (
              <div 
                key={block.id} 
                className={`transition-opacity duration-300 ${isFocused ? 'opacity-100' : 'opacity-35 hover:opacity-75'}`}
                onClick={() => setFocusedBlockIdx(idx)}
                style={darkMode ? undefined : {color:resolveBlockTextColour(block,palette)}}
              >
                {block.type === 'heading' ? (
                  <input
                    type="text"
                    value={block.text}
                    onChange={(e) => handleTextChange(block.id, e.target.value)}
                    className="w-full text-xl font-bold font-sans bg-transparent border-none focus:outline-hidden"
                    style={paragraphCss(resolveParagraphFormatting(block,findPreviousParagraphContext(chapter.blocks,idx),isFirstQualifyingParagraph(chapter.blocks,idx)?0:idx,effectiveTypography))}
                  />
                ) : isFocused ? (
                  <textarea
                    value={block.text}
                    onChange={(e) => handleTextChange(block.id, e.target.value)}
                    onFocus={() => setFocusedBlockIdx(idx)}
                    rows={Math.max(2, Math.ceil(block.text.length / 70))}
                    className="w-full bg-transparent border-none focus:outline-hidden resize-none leading-relaxed text-lg tracking-wide font-serif"
                    placeholder="Type freely..."
                    autoFocus={idx === focusedBlockIdx}
                    style={paragraphCss(resolvedParagraph)}
                  />
                ) : (
                  <p style={paragraphCss(resolvedParagraph)} aria-label={dropCap.enabled?'Paragraph with drop cap':undefined}>
                    <DropCapText text={block.text} resolved={dropCap} />
                  </p>
                )}
              </div>
            );
          })}

        </div>
      </main>

    </div>
  );
};
