import {
  BookColourPalette,
  BookTypographySettings,
  ContentBlock,
  DropCapSettings
} from '../types';
import { normalizeHexColour } from './bookColours';
import { ResolvedParagraphFormatting } from './paragraphFormatting';

export const LEGACY_DROP_CAPS: DropCapSettings = {
  schemaVersion: 1, presetId: 'legacy', enabledByDefault: false,
  defaultContext: 'manual-only', style: 'dropped', lines: 3, characterCount: 1,
  fontFamily: 'Georgia, serif', fontWeight: 700, fontStyle: 'normal',
  colourSource: 'inherit-body', spacingRightPt: 5, spacingTopPt: 0,
  baselineAdjustmentPt: 0, useSmallCapsForFollowingWords: false, followingWordCount: 0
};

export const DROP_CAP_PRESETS: Record<string, DropCapSettings> = {
  legacy: LEGACY_DROP_CAPS,
  'modern-fiction': {...LEGACY_DROP_CAPS,presetId:'modern-fiction',enabledByDefault:true,defaultContext:'chapter-only',style:'dropped',lines:3,colourSource:'inherit-chapter'},
  'classic-literary': {...LEGACY_DROP_CAPS,presetId:'classic-literary',enabledByDefault:true,defaultContext:'chapter-only',style:'dropped',lines:4,fontFamily:'"EB Garamond", serif',fontWeight:500,spacingRightPt:7},
  'dramatic-fiction': {...LEGACY_DROP_CAPS,presetId:'dramatic-fiction',enabledByDefault:true,defaultContext:'chapter-only',style:'dropped',lines:4,fontWeight:800,colourSource:'palette-accent'},
  academic: {...LEGACY_DROP_CAPS,presetId:'academic'},
  minimal: {...LEGACY_DROP_CAPS,presetId:'minimal',enabledByDefault:true,defaultContext:'chapter-only',style:'raised',lines:2,fontWeight:500}
};

const clamp=(n:number,min:number,max:number)=>Math.min(max,Math.max(min,Number.isFinite(n)?n:min));
const letterOrNumber = (value:string) => /[\p{L}\p{N}]/u.test(value);

export interface PrintableOpening { prefix:string; cap:string; remainder:string }
export function resolveFirstPrintableCharacter(text:string,characterCount=1):PrintableOpening|null {
  const chars=Array.from(text); let visible=0;
  while(visible<chars.length&&/\s/u.test(chars[visible]))visible++;
  if(visible===chars.length)return null;
  let letter=visible;
  while(letter<chars.length&&!letterOrNumber(chars[letter]))letter++;
  if(letter===chars.length)return null;
  const count=Math.round(clamp(characterCount,1,3));
  const capEnd=Math.min(chars.length,letter+count);
  // Opening punctuation remains inline; renderers never copy it into the cap.
  return {prefix:chars.slice(0,letter).join(''),cap:chars.slice(letter,capEnd).join(''),remainder:chars.slice(capEnd).join('')};
}

export interface ResolvedDropCap {
  enabled:boolean; style:'dropped'|'in-margin'|'raised'; lines:number; characterCount:number;
  fontFamily:string;fontWeight:number;fontStyle:'normal'|'italic';colour:string;
  spacingRightPt:number;spacingTopPt:number;baselineAdjustmentPt:number;
  opening:PrintableOpening|null; reason:string;
}

export function resolveDropCapFormatting(input:{
  block:ContentBlock; blocks:ContentBlock[]; index:number; typography:BookTypographySettings;
  palette:BookColourPalette; paragraphFormatting:ResolvedParagraphFormatting;
}):ResolvedDropCap {
  const {block,blocks,index,typography,palette,paragraphFormatting}=input;
  const settings=typography.dropCaps??LEGACY_DROP_CAPS, override=block.dropCapFormatting;
  const previous=(()=>{for(let i=index-1;i>=0;i--){const b=blocks[i];if(b.type==='caption'||(b.type==='paragraph'&&!b.text.trim()))continue;return b;}})();
  const first=!blocks.slice(0,index).some(b=>b.type==='paragraph'&&b.text.trim());
  const contextual=settings.enabledByDefault&&(
    (settings.defaultContext!=='manual-only'&&first) ||
    (settings.defaultContext==='chapter-and-scene'&&previous?.type==='scene-break') ||
    (settings.defaultContext==='chapter-scene-and-heading'&&['scene-break','heading','subheading'].includes(previous?.type??''))
  );
  const eligible=block.type==='paragraph'&&block.text.trim().length>0;
  const enabled=eligible&&(override?.enabled??contextual)&&override?.style!=='none';
  const opening=enabled?resolveFirstPrintableCharacter(block.text,override?.characterCount??settings.characterCount):null;
  const hangingConflict=paragraphFormatting.mode==='hanging';
  const source=settings.colourSource;
  const colour=normalizeHexColour(override?.colour??'') ??
    (source==='custom'?normalizeHexColour(settings.customColour??''):undefined) ??
    (source==='palette-accent'?palette.colours.accent:source==='inherit-chapter'?palette.colours.chapterTitle:source==='inherit-body'?palette.colours.bodyText:undefined) ??
    palette.colours.bodyText ?? '#111111';
  const requested=override?.style&&override.style!=='inherit'&&override.style!=='none'?override.style:settings.style;
  return {
    enabled:enabled&&!!opening&&!hangingConflict,
    style:requested==='custom'?'dropped':requested,
    lines:Math.round(clamp(override?.lines??settings.lines,1,4)),
    characterCount:Math.round(clamp(override?.characterCount??settings.characterCount,1,3)),
    fontFamily:override?.fontFamily??settings.fontFamily,fontWeight:Math.round(clamp(override?.fontWeight??settings.fontWeight,100,900)),
    fontStyle:settings.fontStyle,colour,spacingRightPt:clamp(override?.spacingRightPt??settings.spacingRightPt,0,36),
    spacingTopPt:clamp(override?.spacingTopPt??settings.spacingTopPt,-18,36),
    baselineAdjustmentPt:clamp(settings.baselineAdjustmentPt,-18,18),opening,
    reason:!eligible?'unsupported-block':hangingConflict?'hanging-indent-conflict':!opening?'no-printable-character':enabled?'enabled':'disabled'
  };
}

export const paragraphFormattingWithDropCap=(p:ResolvedParagraphFormatting,d:ResolvedDropCap):ResolvedParagraphFormatting=>
  d.enabled?{...p,firstLineIndentPt:0}:p;

export function dropCapHtml(text:string,resolved:ResolvedDropCap,escape:(value:string)=>string):string {
  if(!resolved.enabled||!resolved.opening)return escape(text);
  const {prefix,cap,remainder}=resolved.opening;
  const style=resolved.style==='raised'
    ?`font-size:${resolved.lines}em;line-height:1;vertical-align:${resolved.baselineAdjustmentPt}pt;`
    :`float:left;font-size:${resolved.lines*1.05}em;line-height:.82;margin:${resolved.spacingTopPt}pt ${resolved.spacingRightPt}pt 0 0;${resolved.style==='in-margin'?`margin-left:-${resolved.lines*.45}em;`:''}`;
  return `${escape(prefix)}<span class="drop-cap drop-cap-${resolved.style}" style="${style}font-family:${escape(resolved.fontFamily)};font-weight:${resolved.fontWeight};font-style:${resolved.fontStyle};color:${resolved.colour}">${escape(cap)}</span>${escape(remainder)}`;
}
