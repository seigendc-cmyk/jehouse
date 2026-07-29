import {
  BookColourPalette, BookColourRole, BookColourSettings, BookProject,
  BookTypographySettings, ContentBlock
} from '../types';

const roles: BookColourRole[] = ['bodyText','primaryHeading','secondaryHeading','chapterNumber','chapterTitle','chapterSubtitle','continuationHeader','runningHeader','divider','quote','caption','mutedText','hyperlink','accent','pageBackground'];
const palette = (id: string, name: string, values: Partial<Record<BookColourRole, string>>): BookColourPalette => ({
  id, name, source: 'built-in',
  colours: Object.fromEntries(roles.map(role => [role, values[role] ?? ({
    bodyText:'#171717', primaryHeading:'#262626', secondaryHeading:'#404040', chapterNumber:'#262626',
    chapterTitle:'#262626', chapterSubtitle:'#525252', continuationHeader:'#334155',
    runningHeader:'#404040', divider:'#a3a3a3', quote:'#525252', caption:'#525252',
    mutedText:'#737373', hyperlink:'#1d4ed8', accent:'#525252', pageBackground:'#ffffff'
  } as Record<BookColourRole,string>)[role]])) as Record<BookColourRole,string>
});
const deepFreeze = <T>(v:T):T => { if (v && typeof v === 'object' && !Object.isFrozen(v)) { Object.freeze(v); Object.values(v as Record<string,unknown>).forEach(deepFreeze); } return v; };
export const BOOK_COLOUR_PALETTES = deepFreeze({
  'classic-black': palette('classic-black','Classic Black',{}),
  'warm-literary': palette('warm-literary','Warm Literary',{bodyText:'#292421',primaryHeading:'#4a2c20',secondaryHeading:'#6b4636',chapterNumber:'#9a4f35',chapterTitle:'#4a2c20',chapterSubtitle:'#795548',continuationHeader:'#5d4037',divider:'#b0a39a',quote:'#795548',accent:'#b85c3b'}),
  'modern-orange': palette('modern-orange','Modern Orange',{bodyText:'#262626',primaryHeading:'#171717',secondaryHeading:'#374151',chapterNumber:'#ea580c',chapterTitle:'#171717',continuationHeader:'#334155',divider:'#d6a98e',accent:'#ea580c'}),
  'academic-blue': palette('academic-blue','Academic Blue',{primaryHeading:'#172554',secondaryHeading:'#475569',chapterNumber:'#1e3a8a',chapterTitle:'#172554',continuationHeader:'#334155',divider:'#7890ad',hyperlink:'#1d4ed8',accent:'#2563eb'}),
  'african-earth': palette('african-earth','African Earth',{bodyText:'#211a16',primaryHeading:'#4b2e1f',secondaryHeading:'#3f6212',chapterNumber:'#b45309',chapterTitle:'#4b2e1f',chapterSubtitle:'#6b4f3a',continuationHeader:'#4b2e1f',divider:'#a89078',quote:'#6b4f3a',accent:'#a16207'}),
  monochrome: palette('monochrome','Monochrome',{bodyText:'#111111',primaryHeading:'#222222',secondaryHeading:'#444444',chapterNumber:'#333333',chapterTitle:'#222222',chapterSubtitle:'#555555',continuationHeader:'#333333',runningHeader:'#444444',divider:'#999999',quote:'#555555',caption:'#666666',mutedText:'#777777',hyperlink:'#333333',accent:'#555555'})
} as const);
export type BuiltInColourPaletteId = keyof typeof BOOK_COLOUR_PALETTES;

export const normalizeHexColour = (value:string):string|null => {
  const raw=value.trim(); if (!/^#?(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(raw)) return null;
  const h=raw.replace('#','').toLowerCase(); return `#${h.length===3?h.split('').map(c=>c+c).join(''):h}`;
};
export const clonePalette = (p:BookColourPalette):BookColourPalette => structuredClone(p);
export const createCustomPalette = (source:BookColourPalette,name=source.name+' Copy'):BookColourPalette => ({...clonePalette(source),id:`custom-${crypto.randomUUID()}`,name:name.trim()||'Custom Palette',source:'custom'});
export const addRecentColour = (items:string[],value:string,max=10):string[] => { const n=normalizeHexColour(value); return n?[n,...items.map(normalizeHexColour).filter((x):x is string=>!!x&&x!==n)].slice(0,max):items.slice(0,max); };
export const paletteFromTypography = (t:BookTypographySettings):BookColourPalette => ({
  id:'legacy-derived',name:'Current Book Colours',source:'custom',
  colours:{...clonePalette(BOOK_COLOUR_PALETTES['classic-black']).colours,bodyText:t.body.textColour,primaryHeading:t.chapterOpening.titleColour,secondaryHeading:t.chapterOpening.subtitleColour,chapterNumber:t.chapterOpening.numberColour,chapterTitle:t.chapterOpening.titleColour,chapterSubtitle:t.chapterOpening.subtitleColour,continuationHeader:t.continuation.fontColour,runningHeader:t.continuation.fontColour,divider:t.chapterOpening.dividerColour}
});
export const createColourSettings = (t:BookTypographySettings):BookColourSettings => ({schemaVersion:1,activePaletteId:'legacy-derived',customPalettes:[paletteFromTypography(t)],recentColours:[]});
export const resolveColourSettings = (p:Pick<BookProject,'typography'|'colourSettings'>):BookColourSettings => structuredClone(p.colourSettings ?? createColourSettings(p.typography!));
export const resolveActivePalette = (s:BookColourSettings):BookColourPalette => clonePalette((BOOK_COLOUR_PALETTES as Record<string,BookColourPalette>)[s.activePaletteId] ?? s.customPalettes.find(p=>p.id===s.activePaletteId) ?? BOOK_COLOUR_PALETTES['classic-black']);
export const applyPaletteToTypography = (t:BookTypographySettings,p:BookColourPalette):BookTypographySettings => {
  const n=structuredClone(t); n.presetId='custom'; n.body.textColour=p.colours.bodyText;
  n.chapterOpening.numberColour=p.colours.chapterNumber; n.chapterOpening.titleColour=p.colours.chapterTitle;
  n.chapterOpening.subtitleColour=p.colours.chapterSubtitle; n.chapterOpening.dividerColour=p.colours.divider;
  n.continuation.fontColour=p.colours.continuationHeader; n.continuation.dividerColour=p.colours.divider; return n;
};
export const styleColourForBlock = (b:Pick<ContentBlock,'type'>,p:BookColourPalette):string =>
  b.type==='heading'?p.colours.primaryHeading:b.type==='subheading'||b.type==='clause'?p.colours.secondaryHeading:b.type==='quote'?p.colours.quote:b.type==='caption'?p.colours.caption:p.colours.bodyText;
export const resolveBlockTextColour = (b:Pick<ContentBlock,'type'|'textColour'>,p:BookColourPalette):string => normalizeHexColour(b.textColour??'') ?? styleColourForBlock(b,p);
const rgb=(h:string)=>{const n=normalizeHexColour(h);if(!n)return null;return [1,3,5].map(i=>parseInt(n.slice(i,i+2),16));};
export const contrastRatio=(a:string,b:string):number|null=>{const f=(x:number)=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;};const lum=(h:string)=>{const v=rgb(h);if(!v)return null;return .2126*f(v[0])+.7152*f(v[1])+.0722*f(v[2]);};const x=lum(a),y=lum(b);return x===null||y===null?null:(Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
export const contrastStatus=(ratio:number|null):'Good'|'Caution'|'Poor'=>ratio!==null&&ratio>=4.5?'Good':ratio!==null&&ratio>=3?'Caution':'Poor';
