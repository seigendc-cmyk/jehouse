import {describe,it,expect} from 'vitest';
import {createEmptyBookProject} from '../data/createEmptyBookProject';
import {migrateStoredProject} from '../persistence/projectSchema';
import {resolveActivePalette} from './bookColours';
import {FormattingHistoryController} from './formattingHistory';
import {dropCapHtml,LEGACY_DROP_CAPS,paragraphFormattingWithDropCap,resolveDropCapFormatting,resolveFirstPrintableCharacter} from './dropCaps';
import {resolveParagraphFormatting} from './paragraphFormatting';

const setup=(text='The morning...')=>{
 const project=createEmptyBookProject(); const typography=structuredClone(project.typography!);
 typography.dropCaps={...LEGACY_DROP_CAPS,enabledByDefault:true,defaultContext:'chapter-only'};
 const block={id:'p1',type:'paragraph' as const,text};
 const blocks=[block,{id:'p2',type:'paragraph' as const,text:'Second'}];
 const paragraph=resolveParagraphFormatting(block,undefined,0,typography);
 return {project,typography,block,blocks,paragraphFormatting:paragraph,palette:resolveActivePalette(project.colourSettings!)};
};

describe('semantic drop caps',()=>{
 it.each([
  ['The morning...','','T'],['"The morning..."','"','T'],["'The morning...'","'",'T'],
  ['“The morning...”','“','T'],['(The morning...)','(','T'],['7 days','','7'],['Élan','','É'],['東京','','東']
 ])('finds a Unicode printable opening in %s',(text,prefix,cap)=>expect(resolveFirstPrintableCharacter(text)).toMatchObject({prefix,cap}));
 it('returns no opening for empty and unsupported-symbol text',()=>{expect(resolveFirstPrintableCharacter('  ')).toBeNull();expect(resolveFirstPrintableCharacter('😀 !!!')).toBeNull();});
 it('does not duplicate text in HTML',()=>{const s=setup('"The morning"'),r=resolveDropCapFormatting({...s,index:0});const html=dropCapHtml(s.block.text,r,x=>x);expect(html.replace(/<[^>]+>/g,'')).toBe(s.block.text);});
 it('only qualifies the first chapter paragraph by default',()=>{const s=setup();expect(resolveDropCapFormatting({...s,index:0}).enabled).toBe(true);expect(resolveDropCapFormatting({...s,block:s.blocks[1],index:1,paragraphFormatting:resolveParagraphFormatting(s.blocks[1],s.block,1,s.typography)}).enabled).toBe(false);});
 it('qualifies after a scene break only when configured',()=>{const s=setup(),scene={id:'s',type:'scene-break' as const,text:''},block={id:'p',type:'paragraph' as const,text:'After'};const blocks=[s.block,scene,block];const input={...s,block,blocks,index:2,paragraphFormatting:resolveParagraphFormatting(block,scene,2,s.typography)};expect(resolveDropCapFormatting(input).enabled).toBe(false);s.typography.dropCaps.defaultContext='chapter-and-scene';expect(resolveDropCapFormatting(input).enabled).toBe(true);});
 it('supports heading context only in the explicit mode',()=>{const s=setup(),heading={id:'h',type:'heading' as const,text:'Section'},block={id:'p',type:'paragraph' as const,text:'After'},blocks=[s.block,heading,block];s.typography.dropCaps.defaultContext='chapter-scene-and-heading';expect(resolveDropCapFormatting({...s,block,blocks,index:2,paragraphFormatting:resolveParagraphFormatting(block,heading,2,s.typography)}).enabled).toBe(true);});
 it('rejects captions, empty paragraphs, and hanging indents',()=>{const s=setup();expect(resolveDropCapFormatting({...s,block:{id:'c',type:'caption',text:'Caption'},index:0}).enabled).toBe(false);expect(resolveDropCapFormatting({...s,block:{...s.block,text:''},index:0}).enabled).toBe(false);expect(resolveDropCapFormatting({...s,index:0,paragraphFormatting:{...s.paragraphFormatting,mode:'hanging'}}).reason).toBe('hanging-indent-conflict');});
 it('lets block overrides win and clearing restores inheritance',()=>{const s=setup();expect(resolveDropCapFormatting({...s,block:{...s.block,dropCapFormatting:{enabled:false}},index:0}).enabled).toBe(false);expect(resolveDropCapFormatting({...s,block:{...s.block,dropCapFormatting:undefined},index:0}).enabled).toBe(true);});
 it('clamps lines, character count, weight, and spacing',()=>{const s=setup(),r=resolveDropCapFormatting({...s,block:{...s.block,dropCapFormatting:{lines:99,characterCount:20,fontWeight:5000,spacingRightPt:999,spacingTopPt:-99}},index:0});expect(r).toMatchObject({lines:4,characterCount:3,fontWeight:900,spacingRightPt:36,spacingTopPt:-18});});
 it('removes first-line indent without changing other paragraph values',()=>{const s=setup(),r=resolveDropCapFormatting({...s,index:0});expect(paragraphFormattingWithDropCap({...s.paragraphFormatting,firstLineIndentPt:20,leftIndentPt:8},r)).toMatchObject({firstLineIndentPt:0,leftIndentPt:8});});
 it('migrates legacy records idempotently without IDs, text, or appearance changes',()=>{const s=setup(),record:any={schemaVersion:4,projectId:s.project.id,localRevision:0,project:{...s.project,typography:{...s.project.typography,dropCaps:undefined}},createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),lastSavedAt:new Date().toISOString(),syncStatus:'local-only'};const before=structuredClone(record.project.chapters),m=migrateStoredProject(record)!;expect(m.schemaVersion).toBe(6);expect(m.project.typography!.dropCaps).toEqual(LEGACY_DROP_CAPS);expect(m.project.chapters).toEqual(before);expect(migrateStoredProject(m)).toEqual(m);});
 it('uses approved new-project defaults',()=>{expect(createEmptyBookProject({category:'Fiction & Literature'}).typography!.dropCaps.enabledByDefault).toBe(true);expect(createEmptyBookProject({category:'Academic & Textbook'}).typography!.dropCaps.enabledByDefault).toBe(false);});
 it('resolves explicit colour first without changing text colours',()=>{const s=setup(),block={...s.block,textColour:'#123456',dropCapFormatting:{colour:'#abcdef'}},r=resolveDropCapFormatting({...s,block,index:0});expect(r.colour.toLowerCase()).toBe('#abcdef');expect(block.textColour).toBe('#123456');});
 it.each([['dropped','dropped'],['raised','raised'],['in-margin','in-margin']] as const)('resolves %s safely',(style,expected)=>{const s=setup(),r=resolveDropCapFormatting({...s,block:{...s.block,dropCapFormatting:{enabled:true,style}},index:0});expect(r.style).toBe(expected);});
 it('participates in Phase F undo and redo without changing text',()=>{const s=setup(),history=new FormattingHistoryController(),after=structuredClone(s.project);after.chapters[0].blocks[0].dropCapFormatting={enabled:true,style:'raised'};history.execute({label:'Change drop cap',scope:'block-formatting',before:s.project,after});expect(history.undo()!.project.chapters[0].blocks[0].text).toBe(s.project.chapters[0].blocks[0].text);expect(history.redo()!.project.chapters[0].blocks[0].dropCapFormatting).toEqual({enabled:true,style:'raised'});});
});
