import { BlockParagraphFormatting, BookTypographySettings, ContentBlock, ParagraphPresetId } from '../types';

const presets: Record<Exclude<ParagraphPresetId,'custom'>, BookTypographySettings['paragraphs']> = {
  legacy:{schemaVersion:1,presetId:'legacy',defaultMode:'none',firstParagraphAfterChapter:'inherit',subsequentParagraphMode:'inherit',firstLineIndentPt:0,leftIndentPt:0,rightIndentPt:0,hangingIndentPt:0,spacingBeforePt:0,spacingAfterPt:8,lineHeight:1.65,suppressIndentAfterHeading:false,suppressIndentAfterSceneBreak:false,suppressIndentAfterImage:false,widowOrphanEnabled:false,minimumLines:2,keepWithNextForHeadings:true},
  'fiction-standard':{schemaVersion:1,presetId:'fiction-standard',defaultMode:'first-line',firstParagraphAfterChapter:'no-indent',subsequentParagraphMode:'first-line',firstLineIndentPt:20,leftIndentPt:0,rightIndentPt:0,hangingIndentPt:0,spacingBeforePt:0,spacingAfterPt:0,lineHeight:1.5,suppressIndentAfterHeading:true,suppressIndentAfterSceneBreak:true,suppressIndentAfterImage:true,widowOrphanEnabled:true,minimumLines:2,keepWithNextForHeadings:true},
  literary:{schemaVersion:1,presetId:'literary',defaultMode:'first-line',firstParagraphAfterChapter:'no-indent',subsequentParagraphMode:'first-line',firstLineIndentPt:24,leftIndentPt:0,rightIndentPt:0,hangingIndentPt:0,spacingBeforePt:0,spacingAfterPt:0,lineHeight:1.6,suppressIndentAfterHeading:true,suppressIndentAfterSceneBreak:true,suppressIndentAfterImage:true,widowOrphanEnabled:true,minimumLines:2,keepWithNextForHeadings:true},
  'block-paragraph':{schemaVersion:1,presetId:'block-paragraph',defaultMode:'block',firstParagraphAfterChapter:'block',subsequentParagraphMode:'block',firstLineIndentPt:0,leftIndentPt:0,rightIndentPt:0,hangingIndentPt:0,spacingBeforePt:0,spacingAfterPt:10,lineHeight:1.5,suppressIndentAfterHeading:false,suppressIndentAfterSceneBreak:false,suppressIndentAfterImage:false,widowOrphanEnabled:true,minimumLines:2,keepWithNextForHeadings:true},
  academic:{schemaVersion:1,presetId:'academic',defaultMode:'first-line',firstParagraphAfterChapter:'no-indent',subsequentParagraphMode:'first-line',firstLineIndentPt:18,leftIndentPt:0,rightIndentPt:0,hangingIndentPt:0,spacingBeforePt:0,spacingAfterPt:6,lineHeight:1.55,suppressIndentAfterHeading:true,suppressIndentAfterSceneBreak:false,suppressIndentAfterImage:true,widowOrphanEnabled:true,minimumLines:2,keepWithNextForHeadings:true},
  compact:{schemaVersion:1,presetId:'compact',defaultMode:'first-line',firstParagraphAfterChapter:'no-indent',subsequentParagraphMode:'first-line',firstLineIndentPt:12,leftIndentPt:0,rightIndentPt:0,hangingIndentPt:0,spacingBeforePt:0,spacingAfterPt:2,lineHeight:1.35,suppressIndentAfterHeading:true,suppressIndentAfterSceneBreak:false,suppressIndentAfterImage:false,widowOrphanEnabled:true,minimumLines:2,keepWithNextForHeadings:true}
};
const deepFreeze=<T>(value:T):T=>{if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.freeze(value);Object.values(value as Record<string,unknown>).forEach(deepFreeze);}return value;};
export const PARAGRAPH_PRESETS=deepFreeze(presets);
export const cloneParagraphPreset=(id:Exclude<ParagraphPresetId,'custom'>)=>structuredClone(PARAGRAPH_PRESETS[id]);
export const pointsTo=(pt:number,unit:'pt'|'mm'|'cm'|'in')=>unit==='pt'?pt:unit==='in'?pt/72:unit==='mm'?pt*25.4/72:pt*2.54/72;
export const toPoints=(value:number,unit:'pt'|'mm'|'cm'|'in')=>unit==='pt'?value:unit==='in'?value*72:unit==='mm'?value*72/25.4:value*72/2.54;
const clamp=(n:number,min:number,max:number)=>Math.min(max,Math.max(min,Number.isFinite(n)?n:min));
export interface ResolvedParagraphFormatting {mode:string;firstLineIndentPt:number;leftIndentPt:number;rightIndentPt:number;hangingIndentPt:number;spacingBeforePt:number;spacingAfterPt:number;lineHeight:number;widows:number;orphans:number;keepWithNext:boolean}
export const isQualifyingBodyParagraph=(block:ContentBlock)=>block.type==='paragraph'&&block.text.trim().length>0;
export function findPreviousParagraphContext(blocks:ContentBlock[],index:number):ContentBlock|undefined {
 for(let i=index-1;i>=0;i--){const b=blocks[i];if(b.type==='caption'||(b.type==='paragraph'&&!b.text.trim()))continue;return b;} return undefined;
}
export function isFirstQualifyingParagraph(blocks:ContentBlock[],index:number):boolean {
 if(!isQualifyingBodyParagraph(blocks[index]))return false;
 return !blocks.slice(0,index).some(isQualifyingBodyParagraph);
}
export function resolveParagraphFormatting(block:ContentBlock,previousBlock:ContentBlock|undefined,index:number,t:BookTypographySettings):ResolvedParagraphFormatting {
 const p=t.paragraphs,o=block.paragraphFormatting??{}; const body=block.type==='paragraph';
 let suppress=body&&index===0&&p.firstParagraphAfterChapter==='no-indent';
 if(body&&previousBlock&&(previousBlock.type==='heading'||previousBlock.type==='subheading'||previousBlock.type==='clause')&&p.suppressIndentAfterHeading)suppress=true;
 if(body&&previousBlock?.type==='image'&&p.suppressIndentAfterImage)suppress=true;
 const mode=o.mode&&o.mode!=='inherit'?o.mode:(suppress?'none':p.defaultMode);
 const hanging=clamp(o.hangingIndentPt??p.hangingIndentPt,0,72);
 return {mode,firstLineIndentPt:mode==='first-line'?clamp(o.firstLineIndentPt??p.firstLineIndentPt,0,72):mode==='hanging'?-hanging:0,leftIndentPt:clamp(o.leftIndentPt??p.leftIndentPt,0,144)+(mode==='hanging'?hanging:0),rightIndentPt:clamp(o.rightIndentPt??p.rightIndentPt,0,144),hangingIndentPt:hanging,spacingBeforePt:clamp(o.spacingBeforePt??p.spacingBeforePt,0,72),spacingAfterPt:clamp(o.spacingAfterPt??p.spacingAfterPt,0,72),lineHeight:clamp(o.lineHeight??p.lineHeight,.8,3),widows:p.widowOrphanEnabled?p.minimumLines:1,orphans:p.widowOrphanEnabled?p.minimumLines:1,keepWithNext:p.keepWithNextForHeadings&&['heading','subheading','clause'].includes(block.type)};
}
export const paragraphCss=(r:ResolvedParagraphFormatting)=>({textIndent:`${r.firstLineIndentPt}pt`,paddingLeft:`${r.leftIndentPt}pt`,paddingRight:`${r.rightIndentPt}pt`,marginTop:`${r.spacingBeforePt}pt`,marginBottom:`${r.spacingAfterPt}pt`,lineHeight:r.lineHeight,widows:r.widows,orphans:r.orphans,breakAfter:r.keepWithNext?'avoid':undefined} as const);
