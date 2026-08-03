import React, { useEffect, useMemo, useState } from 'react';
import { BookColourRole, BookColourSettings, BookProject, BookTypographySettings, TypographyPresetId } from '../types';
import {
  BOOK_TYPOGRAPHY_PRESETS,
  cloneTypographyPreset,
  getEffectiveTypography,
  markTypographyCustom,
  resolveProjectTypography
} from '../lib/bookTypography';
import { Check, RotateCcw, Type, X } from 'lucide-react';
import { addRecentColour, applyPaletteToTypography, BOOK_COLOUR_PALETTES, clonePalette, contrastRatio, contrastStatus, createColourSettings, createCustomPalette, normalizeHexColour, resolveActivePalette, resolveColourSettings } from '../lib/bookColours';
import { cloneParagraphPreset, PARAGRAPH_PRESETS, paragraphCss, resolveParagraphFormatting } from '../lib/paragraphFormatting';
import { DROP_CAP_PRESETS, paragraphFormattingWithDropCap, resolveDropCapFormatting } from '../lib/dropCaps';
import { DropCapText } from './DropCapText';

interface BookTypographyModalProps {
  project: BookProject;
  isOpen: boolean;
  onClose: () => void;
  onApply: (typography: BookTypographySettings, colourSettings: BookColourSettings) => void;
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
  const currentColours = useMemo(() => resolveColourSettings(project), [project]);
  const [colourDraft, setColourDraft] = useState<BookColourSettings>(currentColours);
  const [target, setTarget] = useState<BookColourRole>('chapterTitle');
  const [hex, setHex] = useState('#111111');
  useEffect(() => {
    if (isOpen) { setDraft(current); setColourDraft(currentColours); }
  }, [current, currentColours, isOpen]);
  const activePalette = resolveActivePalette(colourDraft);
  const ratio = contrastRatio(activePalette.colours[target], activePalette.colours.pageBackground);

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
                  if (id !== 'custom') {
                    const preset=cloneTypographyPreset(id);
                    setDraft(value=>({...preset,dropCaps:structuredClone(value.dropCaps)}));
                  }
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
            <fieldset className="space-y-3 rounded-xl border p-4">
              <legend className="px-1 text-sm font-bold">Colour Palette</legend>
              <label className="text-xs">Book palette
                <select value={colourDraft.activePaletteId} onChange={(e) => setColourDraft(v=>({...v,activePaletteId:e.target.value}))} className="mt-1 w-full rounded border px-2 py-1.5">
                  {Object.values(BOOK_COLOUR_PALETTES).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                  {colourDraft.customPalettes.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </label>
              <div className="grid grid-cols-5 gap-2" aria-label={`${activePalette.name} colours`}>
                {Object.entries(activePalette.colours).slice(0,10).map(([name,value])=><button key={name} type="button" aria-label={`${name} ${value}`} title={`${name}: ${value}`} onClick={()=>{setTarget(name as BookColourRole);setHex(value);}} className="h-8 rounded border focus:ring-2" style={{backgroundColor:value}} />)}
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={()=>setDraft(v=>applyPaletteToTypography(v,activePalette))} className="rounded border px-3 py-1.5 text-xs font-bold">Apply Palette to Book Styles</button>
                <button type="button" onClick={()=>setColourDraft(v=>{const custom=createCustomPalette(activePalette);return {...v,activePaletteId:custom.id,customPalettes:[...v.customPalettes,custom]};})} className="rounded border px-3 py-1.5 text-xs font-bold">Duplicate Palette</button>
                <button type="button" onClick={()=>{const custom=createCustomPalette(clonePalette(activePalette),'Custom Palette');setColourDraft(v=>({...v,activePaletteId:custom.id,customPalettes:[...v.customPalettes,custom]}));}} className="rounded border px-3 py-1.5 text-xs font-bold">Create Custom</button>
                {activePalette.source==='custom'&&<button type="button" onClick={()=>{const name=window.prompt('Palette name',activePalette.name)?.trim();if(name)setColourDraft(v=>({...v,customPalettes:v.customPalettes.map(p=>p.id===activePalette.id?{...p,name}:p)}));}} className="rounded border px-3 py-1.5 text-xs font-bold">Rename Custom</button>}
                {activePalette.source==='custom'&&activePalette.id!=='legacy-derived'&&<button type="button" onClick={()=>setColourDraft(v=>({...v,activePaletteId:'legacy-derived',customPalettes:v.customPalettes.filter(p=>p.id!==activePalette.id)}))} className="rounded border px-3 py-1.5 text-xs font-bold">Delete Custom</button>}
                <button type="button" onClick={()=>setColourDraft(createColourSettings(current))} className="rounded border px-3 py-1.5 text-xs font-bold">Restore Built-in Defaults</button>
              </div>
              <p className="text-xs text-zinc-600">Block-specific colours remain unchanged.</p>
            </fieldset>
            <fieldset className="space-y-3 rounded-xl border p-4">
              <legend className="px-1 text-sm font-bold">Style Colour</legend>
              <label className="text-xs">Applying colour to
                <select value={target} onChange={e=>{const role=e.target.value as BookColourRole;setTarget(role);setHex(activePalette.colours[role]);}} className="mt-1 w-full rounded border px-2 py-1.5">
                  {Object.keys(activePalette.colours).filter(x=>x!=='pageBackground').map(role=><option key={role} value={role}>{role.replace(/([A-Z])/g,' $1')}</option>)}
                </select>
              </label>
              <div className="flex gap-2"><input type="color" value={normalizeHexColour(hex)??'#111111'} onChange={e=>setHex(e.target.value)} aria-label="Style colour" /><input value={hex} onChange={e=>setHex(e.target.value)} className="w-32 rounded border px-2 font-mono" aria-invalid={!normalizeHexColour(hex)} />
                <button type="button" disabled={!normalizeHexColour(hex)} onClick={()=>{const n=normalizeHexColour(hex)!;setColourDraft(v=>{let palettes=v.customPalettes;let p=resolveActivePalette(v);if(p.source==='built-in'){p=createCustomPalette(p,`${p.name} Custom`);palettes=[...palettes,p];}p.colours[target]=n;palettes=palettes.map(x=>x.id===p.id?p:x);return {...v,activePaletteId:p.id,customPalettes:palettes,recentColours:addRecentColour(v.recentColours,n)};});}} className="rounded bg-orange-600 px-3 py-1.5 text-xs font-bold text-white">Apply</button>
              </div>
              <div className="flex gap-1">{colourDraft.recentColours.map(c=><button type="button" key={c} aria-label={`Recent colour ${c}`} onClick={()=>setHex(c)} className="h-7 w-7 rounded border" style={{backgroundColor:c}} />)}</div>
              <p aria-live="polite" className="text-xs">{contrastStatus(ratio)} contrast{ratio ? ` (${ratio.toFixed(2)}:1)` : ''}. Printed output may vary by printer, paper and ink.</p>
            </fieldset>

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
              <legend className="px-1 text-sm font-bold">Drop Caps</legend>
              <label className="col-span-2 flex gap-2 text-xs"><input type="checkbox" checked={draft.dropCaps.enabledByDefault} onChange={e=>edit(v=>{v.dropCaps.enabledByDefault=e.target.checked;v.dropCaps.presetId='custom';})}/>Enable Drop Caps</label>
              <label className="text-xs">Context<select value={draft.dropCaps.defaultContext} onChange={e=>edit(v=>{v.dropCaps.defaultContext=e.target.value as typeof v.dropCaps.defaultContext;v.dropCaps.presetId='custom';})} className="mt-1 w-full rounded border px-2 py-1"><option value="chapter-only">Chapter opening</option><option value="chapter-and-scene">Chapter and scene</option><option value="chapter-scene-and-heading">Chapter, scene and heading</option><option value="manual-only">Manual only</option></select></label>
              <label className="text-xs">Style<select value={draft.dropCaps.style} onChange={e=>edit(v=>{v.dropCaps.style=e.target.value as typeof v.dropCaps.style;v.dropCaps.presetId='custom';})} className="mt-1 w-full rounded border px-2 py-1"><option value="dropped">Dropped</option><option value="raised">Raised</option><option value="in-margin">In Margin</option><option value="custom">Custom</option></select></label>
              {([['lines','Lines',1,4],['characterCount','Characters',1,3],['fontWeight','Font weight',100,900],['spacingRightPt','Right spacing (pt)',0,36],['spacingTopPt','Top spacing (pt)',-18,36],['baselineAdjustmentPt','Baseline (pt)',-18,18]] as const).map(([field,label,min,max])=><label key={field} className="text-xs">{label}<input type="number" min={min} max={max} value={draft.dropCaps[field]} onChange={e=>edit(v=>{(v.dropCaps[field] as number)=Number(e.target.value);v.dropCaps.presetId='custom';})} className="mt-1 w-full rounded border px-2 py-1"/></label>)}
              <label className="col-span-2 text-xs">Font family<input value={draft.dropCaps.fontFamily} onChange={e=>edit(v=>{v.dropCaps.fontFamily=e.target.value;v.dropCaps.presetId='custom';})} className="mt-1 w-full rounded border px-2 py-1"/></label>
              <label className="text-xs">Font style<select value={draft.dropCaps.fontStyle} onChange={e=>edit(v=>{v.dropCaps.fontStyle=e.target.value as 'normal'|'italic';v.dropCaps.presetId='custom';})} className="mt-1 w-full rounded border px-2 py-1"><option value="normal">Normal</option><option value="italic">Italic</option></select></label>
              <label className="text-xs">Colour source<select value={draft.dropCaps.colourSource} onChange={e=>edit(v=>{v.dropCaps.colourSource=e.target.value as typeof v.dropCaps.colourSource;v.dropCaps.presetId='custom';})} className="mt-1 w-full rounded border px-2 py-1"><option value="inherit-body">Body</option><option value="inherit-chapter">Chapter</option><option value="palette-accent">Accent</option><option value="custom">Custom</option></select></label>
              {draft.dropCaps.colourSource==='custom'&&<label className="col-span-2 text-xs">Custom colour <input type="color" value={normalizeHexColour(draft.dropCaps.customColour??'')??'#111111'} onChange={e=>edit(v=>{v.dropCaps.customColour=e.target.value;v.dropCaps.presetId='custom';})}/><span className="ml-2 font-mono">{draft.dropCaps.customColour??'#111111'}</span></label>}
              <button type="button" onClick={()=>edit(v=>{v.dropCaps=structuredClone(DROP_CAP_PRESETS[v.presetId==='classic-literary'?'classic-literary':v.presetId==='dramatic-fiction'?'dramatic-fiction':v.presetId==='academic'?'academic':v.presetId==='contemporary-minimal'?'minimal':'modern-fiction']);})} className="col-span-2 rounded border px-3 py-1.5 text-xs font-bold">Reset to Preset</button>
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
              <label className="col-span-2 text-xs">Paragraph preset
                <select value={draft.paragraphs.presetId} onChange={e=>{const id=e.target.value as keyof typeof PARAGRAPH_PRESETS;setDraft(v=>({...v,paragraphs:cloneParagraphPreset(id)}));}} className="mt-1 w-full rounded border px-2 py-1.5">
                  {Object.entries(PARAGRAPH_PRESETS).map(([id,p])=><option key={id} value={id}>{id.replace(/-/g,' ')}</option>)}
                  <option value="custom" disabled>Custom</option>
                </select>
              </label>
              <label className="text-xs" title="Controls only the first paragraph after a chapter heading.">First paragraph
                <select value={draft.paragraphs.firstParagraphAfterChapter} onChange={(e) => edit(v => { v.paragraphs.firstParagraphAfterChapter = e.target.value as BookTypographySettings['paragraphs']['firstParagraphAfterChapter']; })} className="mt-1 w-full rounded border px-2 py-1.5">
                  <option value="inherit">Inherit</option><option value="no-indent">No indent</option><option value="block">Block</option>
                </select>
              </label>
              {([['firstLineIndentPt','First-line indent'],['leftIndentPt','Left indent'],['rightIndentPt','Right indent'],['hangingIndentPt','Hanging indent'],['spacingBeforePt','Spacing before'],['spacingAfterPt','Spacing after']] as const).map(([field,label])=><label key={field} className="text-xs">{label} (pt)<input type="number" min="0" max={field.includes('left')||field.includes('right')?144:72} value={draft.paragraphs[field]} onChange={e=>edit(v=>{v.paragraphs[field]=Number(e.target.value);v.paragraphs.presetId='custom';})} className="mt-1 w-full rounded border px-2 py-1.5" /></label>)}
              <label className="text-xs">Line height<input type="number" min=".8" max="3" step=".05" value={draft.paragraphs.lineHeight} onChange={e=>edit(v=>{v.paragraphs.lineHeight=Number(e.target.value);v.paragraphs.presetId='custom';})} className="mt-1 w-full rounded border px-2 py-1.5" /></label>
              <label className="col-span-2 flex gap-2 text-xs"><input type="checkbox" checked={draft.paragraphs.suppressIndentAfterHeading} onChange={e=>edit(v=>{v.paragraphs.suppressIndentAfterHeading=e.target.checked;})}/>No indent after heading</label>
              <label className="col-span-2 flex gap-2 text-xs"><input type="checkbox" checked={draft.paragraphs.suppressIndentAfterImage} onChange={e=>edit(v=>{v.paragraphs.suppressIndentAfterImage=e.target.checked;})}/>No indent after image or figure</label>
              <label className="col-span-2 flex gap-2 text-xs"><input type="checkbox" checked={draft.paragraphs.suppressIndentAfterSceneBreak} onChange={e=>edit(v=>{v.paragraphs.suppressIndentAfterSceneBreak=e.target.checked;v.paragraphs.presetId='custom';})}/>No indent after semantic scene break (when supported)</label>
              <label className="col-span-2 flex gap-2 text-xs"><input type="checkbox" checked={draft.paragraphs.widowOrphanEnabled} onChange={e=>edit(v=>{v.paragraphs.widowOrphanEnabled=e.target.checked;v.paragraphs.presetId='custom';})}/>Widow/orphan control</label>
              <label className="text-xs">Minimum lines<input type="number" min="2" max="4" value={draft.paragraphs.minimumLines} onChange={e=>edit(v=>{v.paragraphs.minimumLines=Math.min(4,Math.max(2,Number(e.target.value)));v.paragraphs.presetId='custom';})} className="mt-1 w-full rounded border px-2 py-1.5" /></label>
              <label className="col-span-2 flex gap-2 text-xs"><input type="checkbox" checked={draft.paragraphs.keepWithNextForHeadings} onChange={e=>edit(v=>{v.paragraphs.keepWithNextForHeadings=e.target.checked;v.paragraphs.presetId='custom';})}/>Keep headings with following paragraph</label>
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
            <article className="mx-auto min-h-[560px] max-w-md bg-white p-10 shadow-lg" style={{ color: activePalette.colours.bodyText, fontFamily: effective.body.fontFamily, fontSize: `${effective.body.fontSizePt}pt`, lineHeight: effective.body.lineHeight }}>
              <header style={{ textAlign: effective.chapterOpening.alignment === 'centre' ? 'center' : effective.chapterOpening.alignment, paddingTop: `${effective.chapterOpening.topSpacingPt}pt`, marginBottom: `${effective.chapterOpening.titleToBodySpacingPt}pt` }}>
                <div style={{ fontFamily: effective.chapterOpening.numberFontFamily, fontSize: `${effective.chapterOpening.numberFontSizePt}pt`, fontWeight: effective.chapterOpening.numberWeight, color: effective.chapterOpening.numberColour }}>Chapter Seven</div>
                <h3 style={{ margin: `${effective.chapterOpening.numberToTitleSpacingPt}pt 0 0`, fontFamily: effective.chapterOpening.titleFontFamily, fontSize: `${effective.chapterOpening.titleFontSizePt}pt`, fontWeight: effective.chapterOpening.titleWeight, color: effective.chapterOpening.titleColour }}>The Turning Point</h3>
                <p style={{ margin: '5pt 0 0', fontFamily: effective.chapterOpening.subtitleFontFamily, fontSize: `${effective.chapterOpening.subtitleFontSizePt}pt`, color: effective.chapterOpening.subtitleColour }}>A quiet decision changes everything</p>
                {effective.chapterOpening.showDivider && <hr style={{ width: `${effective.chapterOpening.dividerWidthPercent}%`, border: 0, borderTop: `${effective.chapterOpening.dividerThicknessPt}pt solid ${effective.chapterOpening.dividerColour}` }} />}
              </header>
              {(()=>{const b={id:'drop-cap-preview',type:'paragraph' as const,text:'The morning arrived without ceremony, laying a pale ribbon of light across the floorboards.'},blocks=[b],paragraphFormatting=resolveParagraphFormatting(b,undefined,0,effective),dropCap=resolveDropCapFormatting({block:b,blocks,index:0,typography:effective,palette:activePalette,paragraphFormatting});return <p style={paragraphCss(paragraphFormattingWithDropCap(paragraphFormatting,dropCap))}><DropCapText text={b.text} resolved={dropCap}/></p>;})()}
              <p>Beyond the window, the city continued as though nothing important had happened.</p>
              {(() => { const samples=[{id:'p1',type:'paragraph' as const,text:''},{id:'p2',type:'paragraph' as const,text:''}]; return samples.map((b,i)=><p key={b.id} style={paragraphCss(resolveParagraphFormatting(b,samples[i-1],i,effective))}>{i===0?'First paragraph after the chapter opening begins flush left.':'The following paragraph demonstrates the inherited first-line rhythm.'}</p>); })()}
              <h4 style={{color:activePalette.colours.primaryHeading}}>A Primary Heading</h4>
              <blockquote style={{color:activePalette.colours.quote,borderLeft:`3px solid ${activePalette.colours.accent}`,paddingLeft:12}}>A quiet sentence held apart from the story.</blockquote>
              <small style={{color:activePalette.colours.caption}}>Figure 1. A sample caption</small>
              <p><a style={{color:activePalette.colours.hyperlink}}>A sample hyperlink</a></p>
              {effective.continuation.enabled && <div style={{ display: 'flex', justifyContent: effective.continuation.alignment === 'split' ? 'space-between' : effective.continuation.alignment, marginTop: '36pt', borderBottom: effective.continuation.showDivider ? `${effective.continuation.dividerThicknessPt}pt solid ${effective.continuation.dividerColour}` : undefined, fontFamily: effective.continuation.fontFamily, fontSize: `${effective.continuation.fontSizePt}pt`, fontWeight: effective.continuation.fontWeight, color: effective.continuation.fontColour }}><span>Chapter Seven — The Turning Point</span>{effective.continuation.showContinued && <span>Continued</span>}</div>}
            </article>
          </section>
        </div>

        <footer className="flex flex-wrap justify-end gap-2 border-t px-5 py-4">
          <button onClick={() => {setDraft(current);setColourDraft(currentColours);}} className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-bold"><RotateCcw className="h-4 w-4" /> Reset to Current</button>
          <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm font-bold">Cancel</button>
          <button onClick={() => { onApply(structuredClone(draft), structuredClone(colourDraft)); onClose(); }} className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white"><Check className="h-4 w-4" /> Apply to Book</button>
        </footer>
      </div>
    </div>
  );
};
