import { describe,expect,it } from 'vitest';
import { createEmptyBookProject } from '../data/createEmptyBookProject';
import { cloneParagraphPreset, findPreviousParagraphContext, isFirstQualifyingParagraph, PARAGRAPH_PRESETS, paragraphCss, pointsTo, resolveParagraphFormatting, toPoints } from './paragraphFormatting';
import { migrateStoredProject, wrapLegacyProject } from '../persistence/projectSchema';

const block=(id:string,type:'paragraph'|'heading'|'image'='paragraph')=>({id,type,text:`text-${id}`});
describe('paragraph formatting',()=>{
 it('preserves Legacy appearance',()=>{const p=createEmptyBookProject({category:'Fiction & Literature'});const t={...p.typography!,paragraphs:cloneParagraphPreset('legacy')};expect(resolveParagraphFormatting(block('a'),undefined,0,t).firstLineIndentPt).toBe(0);});
 it('suppresses the first fiction paragraph and indents the next',()=>{const p=createEmptyBookProject();const t={...p.typography!,paragraphs:cloneParagraphPreset('fiction-standard')};expect(resolveParagraphFormatting(block('a'),undefined,0,t).firstLineIndentPt).toBe(0);expect(resolveParagraphFormatting(block('b'),block('a'),1,t).firstLineIndentPt).toBe(20);});
 it('suppresses indentation after headings',()=>{const p=createEmptyBookProject();const t={...p.typography!,paragraphs:cloneParagraphPreset('fiction-standard')};expect(resolveParagraphFormatting(block('p'),block('h','heading'),2,t).firstLineIndentPt).toBe(0);});
 it('suppresses indentation after images',()=>{const p=createEmptyBookProject();const t={...p.typography!,paragraphs:cloneParagraphPreset('fiction-standard')};expect(resolveParagraphFormatting(block('p'),block('i','image'),2,t).firstLineIndentPt).toBe(0);});
 it('uses spacing for block paragraphs',()=>{const p=createEmptyBookProject();const t={...p.typography!,paragraphs:cloneParagraphPreset('block-paragraph')};const r=resolveParagraphFormatting(block('p'),block('a'),1,t);expect(r.firstLineIndentPt).toBe(0);expect(r.spacingAfterPt).toBe(10);});
 it('uses approved academic rhythm',()=>{const p=createEmptyBookProject();const t={...p.typography!,paragraphs:cloneParagraphPreset('academic')};const r=resolveParagraphFormatting(block('p'),block('a'),1,t);expect(r.firstLineIndentPt).toBe(18);expect(r.lineHeight).toBe(1.55);});
 it('gives block overrides precedence and clamps unsafe values',()=>{const p=createEmptyBookProject();const t={...p.typography!,paragraphs:cloneParagraphPreset('fiction-standard')};const b={...block('p'),paragraphFormatting:{mode:'hanging' as const,hangingIndentPt:999,leftIndentPt:200,rightIndentPt:-2,lineHeight:9}};const r=resolveParagraphFormatting(b,block('a'),1,t);expect(r).toMatchObject({firstLineIndentPt:-72,leftIndentPt:216,rightIndentPt:0,lineHeight:3});});
 it('clearing override restores inheritance',()=>{const p=createEmptyBookProject();const t={...p.typography!,paragraphs:cloneParagraphPreset('compact')};const withOverride={...block('p'),paragraphFormatting:{firstLineIndentPt:50}};expect(resolveParagraphFormatting(withOverride,block('a'),1,t).firstLineIndentPt).toBe(50);expect(resolveParagraphFormatting({...withOverride,paragraphFormatting:undefined},block('a'),1,t).firstLineIndentPt).toBe(12);});
 it('converts units deterministically',()=>{expect(toPoints(1,'in')).toBe(72);expect(pointsTo(72,'in')).toBe(1);expect(toPoints(pointsTo(72,'mm'),'mm')).toBeCloseTo(72);});
 it('produces structural CSS without altering text',()=>{const p=createEmptyBookProject();const b=block('p');const before=structuredClone(b);const css=paragraphCss(resolveParagraphFormatting(b,undefined,0,p.typography!));expect(css.textIndent).toContain('pt');expect(b).toEqual(before);});
 it('clones presets independently',()=>{const a=cloneParagraphPreset('literary'),b=cloneParagraphPreset('literary');a.firstLineIndentPt=1;expect(b.firstLineIndentPt).toBe(24);});
 it('keeps preset definitions deeply immutable',()=>{expect(Object.isFrozen(PARAGRAPH_PRESETS)).toBe(true);expect(Object.isFrozen(PARAGRAPH_PRESETS.literary)).toBe(true);});
 it('finds the first qualifying paragraph past captions and empty spacers',()=>{const blocks=[{...block('e'),text:''},{...block('c'),type:'caption' as const},block('p')];expect(isFirstQualifyingParagraph(blocks,2)).toBe(true);expect(findPreviousParagraphContext(blocks,2)).toBeUndefined();});
 it('migrates schema 3 paragraph data to Legacy idempotently without content or ID changes',()=>{
   const project=createEmptyBookProject(); const stored=wrapLegacyProject(project) as any; stored.schemaVersion=3; delete stored.project.typography.paragraphs.schemaVersion;
   const before=structuredClone(stored.project.chapters); const migrated=migrateStoredProject(stored);
   expect(migrated?.schemaVersion).toBe(6);expect(migrated?.project.typography?.paragraphs.presetId).toBe('legacy');expect(migrated?.project.chapters).toEqual(before);expect(migrateStoredProject(migrated)).toEqual(migrated);
 });
});
