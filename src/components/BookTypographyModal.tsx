import React, { useEffect, useMemo, useState } from 'react';
import { BookProject, BookTypographySettings, TypographyPresetId } from '../types';
import {
  BOOK_TYPOGRAPHY_PRESETS,
  cloneTypographyPreset,
  getEffectiveTypography,
  markTypographyCustom,
  resolveProjectTypography
} from '../lib/bookTypography';
import { Check, RotateCcw, Type, X } from 'lucide-react';

interface BookTypographyModalProps {
  project: BookProject;
  isOpen: boolean;
  onClose: () => void;
  onApply: (typography: BookTypographySettings) => void;
}

const presetNames: Record<TypographyPresetId, string> = {
  legacy: 'Legacy',
  'modern-bold': 'Modern Bold',
  'classic-literary': 'Classic Literary',
  'contemporary-minimal': 'Contemporary Minimal',
  academic: 'Academic',
  'dramatic-fiction': 'Dramatic Fiction',
  custom: 'Custom'
};

export const BookTypographyModal: React.FC<BookTypographyModalProps> = ({
  project,
  isOpen,
  onClose,
  onApply
}) => {
  const current = useMemo(() => resolveProjectTypography(project), [project]);
  const [draft, setDraft] = useState<BookTypographySettings>(current);
  useEffect(() => {
    if (isOpen) setDraft(current);
  }, [current, isOpen]);

  const effective = getEffectiveTypography({
    typography: draft,
    pageSize: project.exportSettings.trimSize,
    orientation: project.exportSettings.pageOrientation
  });
  if (!isOpen) return null;

  const edit = (update: (value: BookTypographySettings) => void) =>
    setDraft((value) => markTypographyCustom(value, update));

  return (
    <div className="pc-studio-light fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <div className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border">
        <header className="flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-3">
            <Type className="h-6 w-6 text-orange-600" />
            <div>
              <h2 className="text-lg font-bold">Book Typography</h2>
              <p className="text-xs text-zinc-600" aria-live="polite">
                Current preview: {presetNames[draft.presetId]}
              </p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close Book Typography" title="Cancel" className="rounded-lg p-2">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-2">
          <div className="overflow-y-auto border-r p-5 space-y-5" aria-label="Typography controls">
            <section>
              <label htmlFor="typography-preset" className="mb-1 block text-sm font-bold">Preset</label>
              <select
                id="typography-preset"
                value={draft.presetId}
                onChange={(event) => {
                  const id = event.target.value as TypographyPresetId;
                  if (id !== 'custom') setDraft(cloneTypographyPreset(id));
                }}
                className="w-full rounded-lg border px-3 py-2"
              >
                {Object.entries(presetNames).map(([id, label]) => (
                  <option key={id} value={id} disabled={id === 'custom' && draft.presetId !== 'custom'}>{label}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-zinc-600">
                {draft.presetId === 'legacy'
                  ? 'Legacy preserves the existing book appearance.'
                  : 'Changing an individual setting creates a Custom configuration.'}
              </p>
            </section>

            <fieldset className="grid grid-cols-2 gap-3 rounded-xl border p-4">
              <legend className="px-1 text-sm font-bold">Body Text</legend>
              <label className="col-span-2 text-xs">Font family
                <input value={draft.body.fontFamily} onChange={(e) => edit(v => { v.body.fontFamily = e.target.value; })} className="mt-1 w-full rounded border px-2 py-1.5" />
              </label>
              <label className="text-xs">Size (pt)
                <input type="number" min="9" max="14" value={draft.body.fontSizePt} onChange={(e) => edit(v => { v.body.fontSizePt = Number(e.target.value); })} className="mt-1 w-full rounded border px-2 py-1.5" />
              </label>
              <label className="text-xs">Line height
                <input type="number" min="1.2" max="2" step="0.05" value={draft.body.lineHeight} onChange={(e) => edit(v => { v.body.lineHeight = Number(e.target.value); })} className="mt-1 w-full rounded border px-2 py-1.5" />
              </label>
            </fieldset>

            <fieldset className="grid grid-cols-2 gap-3 rounded-xl border p-4">
              <legend className="px-1 text-sm font-bold">Chapter Opening</legend>
              <label className="text-xs">Alignment
                <select value={draft.chapterOpening.alignment} onChange={(e) => edit(v => { v.chapterOpening.alignment = e.target.value as BookTypographySettings['chapterOpening']['alignment']; })} className="mt-1 w-full rounded border px-2 py-1.5">
                  <option value="left">Left</option><option value="centre">Centre</option><option value="right">Right</option>
                </select>
              </label>
              <label className="text-xs">Title size (pt)
                <input type="number" min="14" max="28" value={draft.chapterOpening.titleFontSizePt} onChange={(e) => edit(v => { v.chapterOpening.titleFontSizePt = Number(e.target.value); })} className="mt-1 w-full rounded border px-2 py-1.5" />
              </label>
              <label className="col-span-2 flex items-center gap-2 text-xs">
                <input type="checkbox" checked={draft.chapterOpening.showDivider} onChange={(e) => edit(v => { v.chapterOpening.showDivider = e.target.checked; })} />
                Show divider
              </label>
            </fieldset>

            <fieldset className="space-y-3 rounded-xl border p-4">
              <legend className="px-1 text-sm font-bold">Continuation Header</legend>
              <label className="flex items-center gap-2 text-xs">
                <input type="checkbox" checked={draft.continuation.enabled} onChange={(e) => edit(v => { v.continuation.enabled = e.target.checked; })} />
                Show compact header on explicit continuation pages
              </label>
            </fieldset>

            <fieldset className="grid grid-cols-2 gap-3 rounded-xl border p-4">
              <legend className="px-1 text-sm font-bold">Paragraph Rules</legend>
              <label className="text-xs" title="Controls only the first paragraph after a chapter heading.">First paragraph
                <select value={draft.paragraphs.firstParagraphAfterChapter} onChange={(e) => edit(v => { v.paragraphs.firstParagraphAfterChapter = e.target.value as BookTypographySettings['paragraphs']['firstParagraphAfterChapter']; })} className="mt-1 w-full rounded border px-2 py-1.5">
                  <option value="inherit">Inherit</option><option value="no-indent">No indent</option><option value="block">Block</option>
                </select>
              </label>
              <label className="text-xs">Subsequent paragraphs
                <select value={draft.paragraphs.subsequentParagraphMode} onChange={(e) => edit(v => { v.paragraphs.subsequentParagraphMode = e.target.value as BookTypographySettings['paragraphs']['subsequentParagraphMode']; })} className="mt-1 w-full rounded border px-2 py-1.5">
                  <option value="inherit">Inherit</option><option value="first-line">First-line</option><option value="block">Block</option>
                </select>
              </label>
            </fieldset>

            <fieldset className="space-y-3 rounded-xl border p-4">
              <legend className="px-1 text-sm font-bold">Running Headers</legend>
              <label className="flex items-center gap-2 text-xs" title="Uses the existing chapter-opening page role.">
                <input type="checkbox" checked={draft.runningHeaders.suppressOnChapterOpening} onChange={(e) => edit(v => {
                  v.runningHeaders.suppressOnChapterOpening = e.target.checked;
                  v.chapterOpening.suppressRunningHeader = e.target.checked;
                })} />
                Suppress on chapter-opening pages
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(['oddPageSource', 'evenPageSource'] as const).map((field) => (
                  <label key={field} className="text-xs">
                    {field === 'oddPageSource' ? 'Odd pages' : 'Even pages'}
                    <select value={draft.runningHeaders[field]} onChange={(e) => edit(v => { v.runningHeaders[field] = e.target.value as BookTypographySettings['runningHeaders'][typeof field]; })} className="mt-1 w-full rounded border px-2 py-1.5">
                      <option value="book-title">Book title</option>
                      <option value="chapter-title">Chapter title</option>
                      <option value="chapter-number-title">Chapter number and title</option>
                      <option value="author">Author</option>
                      <option value="custom">Custom text</option>
                    </select>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <section className="overflow-y-auto bg-slate-100 p-6" aria-label="Typography preview">
            <p className="mb-3 text-xs text-zinc-600">Static sample preview; the manuscript is not changed until Apply to Book.</p>
            <article className="mx-auto min-h-[560px] max-w-md bg-white p-10 shadow-lg" style={{ color: effective.body.textColour, fontFamily: effective.body.fontFamily, fontSize: `${effective.body.fontSizePt}pt`, lineHeight: effective.body.lineHeight }}>
              <header style={{ textAlign: effective.chapterOpening.alignment === 'centre' ? 'center' : effective.chapterOpening.alignment, paddingTop: `${effective.chapterOpening.topSpacingPt}pt`, marginBottom: `${effective.chapterOpening.titleToBodySpacingPt}pt` }}>
                <div style={{ fontFamily: effective.chapterOpening.numberFontFamily, fontSize: `${effective.chapterOpening.numberFontSizePt}pt`, fontWeight: effective.chapterOpening.numberWeight, color: effective.chapterOpening.numberColour }}>Chapter Seven</div>
                <h3 style={{ margin: `${effective.chapterOpening.numberToTitleSpacingPt}pt 0 0`, fontFamily: effective.chapterOpening.titleFontFamily, fontSize: `${effective.chapterOpening.titleFontSizePt}pt`, fontWeight: effective.chapterOpening.titleWeight, color: effective.chapterOpening.titleColour }}>The Turning Point</h3>
                <p style={{ margin: '5pt 0 0', fontFamily: effective.chapterOpening.subtitleFontFamily, fontSize: `${effective.chapterOpening.subtitleFontSizePt}pt`, color: effective.chapterOpening.subtitleColour }}>A quiet decision changes everything</p>
                {effective.chapterOpening.showDivider && <hr style={{ width: `${effective.chapterOpening.dividerWidthPercent}%`, border: 0, borderTop: `${effective.chapterOpening.dividerThicknessPt}pt solid ${effective.chapterOpening.dividerColour}` }} />}
              </header>
              <p>The morning arrived without ceremony, laying a pale ribbon of light across the floorboards.</p>
              <p>Beyond the window, the city continued as though nothing important had happened.</p>
              {effective.continuation.enabled && <div style={{ display: 'flex', justifyContent: effective.continuation.alignment === 'split' ? 'space-between' : effective.continuation.alignment, marginTop: '36pt', borderBottom: effective.continuation.showDivider ? `${effective.continuation.dividerThicknessPt}pt solid ${effective.continuation.dividerColour}` : undefined, fontFamily: effective.continuation.fontFamily, fontSize: `${effective.continuation.fontSizePt}pt`, fontWeight: effective.continuation.fontWeight, color: effective.continuation.fontColour }}><span>Chapter Seven — The Turning Point</span>{effective.continuation.showContinued && <span>Continued</span>}</div>}
            </article>
          </section>
        </div>

        <footer className="flex flex-wrap justify-end gap-2 border-t px-5 py-4">
          <button onClick={() => setDraft(current)} className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-bold"><RotateCcw className="h-4 w-4" /> Reset to Current</button>
          <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm font-bold">Cancel</button>
          <button onClick={() => { onApply(structuredClone(draft)); onClose(); }} className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white"><Check className="h-4 w-4" /> Apply to Book</button>
        </footer>
      </div>
    </div>
  );
};
