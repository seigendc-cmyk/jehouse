import { describe, expect, it } from 'vitest';
import { createEmptyBookProject } from '../data/createEmptyBookProject';
import {
  addRecentColour, applyPaletteToTypography, BOOK_COLOUR_PALETTES, clonePalette,
  contrastRatio, contrastStatus, createColourSettings, createCustomPalette,
  normalizeHexColour, resolveActivePalette, resolveBlockTextColour
} from './bookColours';

describe('book colour system', () => {
  it('keeps stable immutable built-in palettes', () => {
    expect(Object.keys(BOOK_COLOUR_PALETTES)).toEqual(['classic-black','warm-literary','modern-orange','academic-blue','african-earth','monochrome']);
    expect(Object.isFrozen(BOOK_COLOUR_PALETTES['classic-black'].colours)).toBe(true);
  });
  it('clones palettes independently', () => {
    const copy=clonePalette(BOOK_COLOUR_PALETTES['classic-black']); copy.colours.bodyText='#ffffff';
    expect(BOOK_COLOUR_PALETTES['classic-black'].colours.bodyText).not.toBe('#ffffff');
  });
  it('creates uniquely identified custom palettes', () => {
    expect(createCustomPalette(BOOK_COLOUR_PALETTES.monochrome).id).not.toBe(createCustomPalette(BOOK_COLOUR_PALETTES.monochrome).id);
  });
  it.each([['#abc','#aabbcc'],['ABC','#aabbcc'],['#A1B2C3','#a1b2c3']])('normalises %s', (input,expected)=>expect(normalizeHexColour(input)).toBe(expected));
  it.each(['red','url(x)','#12','<script>','#abcd','#aabbccdd'])('rejects invalid opaque colour %s', value=>expect(normalizeHexColour(value)).toBeNull());
  it('deduplicates and bounds recent colours', () => {
    let values:string[]=[]; for(let i=0;i<14;i++) values=addRecentColour(values,`#${i.toString(16).padStart(6,'0')}`);
    expect(values).toHaveLength(10); expect(addRecentColour(values,values[5])[0]).toBe(values[5]);
  });
  it('derives initial settings without changing effective typography colours', () => {
    const project=createEmptyBookProject(); const settings=createColourSettings(project.typography!);
    expect(resolveActivePalette(settings).colours.bodyText).toBe(project.typography!.body.textColour);
    expect(resolveActivePalette(settings).colours.chapterTitle).toBe(project.typography!.chapterOpening.titleColour);
  });
  it('applies palette to supported typography and marks it custom', () => {
    const project=createEmptyBookProject(); const next=applyPaletteToTypography(project.typography!,BOOK_COLOUR_PALETTES['academic-blue']);
    expect(next.presetId).toBe('custom'); expect(next.body.textColour).toBe('#171717'); expect(next.chapterOpening.titleColour).toBe('#172554');
    expect(project.typography!.presetId).not.toBe('custom');
  });
  it('preserves block overrides and restores inheritance when cleared', () => {
    const p=BOOK_COLOUR_PALETTES['warm-literary'];
    expect(resolveBlockTextColour({type:'quote',textColour:'#abcdef'},p)).toBe('#abcdef');
    expect(resolveBlockTextColour({type:'quote'},p)).toBe(p.colours.quote);
    expect(resolveBlockTextColour({type:'paragraph'},p)).toBe(p.colours.bodyText);
  });
  it('calculates WCAG contrast statuses', () => {
    expect(contrastRatio('#000','#fff')).toBeCloseTo(21);
    expect(contrastStatus(21)).toBe('Good'); expect(contrastStatus(3.5)).toBe('Caution'); expect(contrastStatus(2)).toBe('Poor');
  });
  it('resolves a deleted active custom palette safely', () => {
    expect(resolveActivePalette({schemaVersion:1,activePaletteId:'missing',customPalettes:[],recentColours:[]}).id).toBe('classic-black');
  });
  it('keeps block text and identity outside colour resolution', () => {
    const block={id:'b1',type:'paragraph' as const,text:'Unchanged',textColour:'#123456'};
    resolveBlockTextColour(block,BOOK_COLOUR_PALETTES.monochrome);
    expect(block).toEqual({id:'b1',type:'paragraph',text:'Unchanged',textColour:'#123456'});
  });
});
