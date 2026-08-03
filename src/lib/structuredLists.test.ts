import { describe, expect, it } from 'vitest';
import { ContentBlock } from '../types';
import {
  MAX_LIST_LEVEL, changeListLevel, convertBlocksToList, listFormatting, mergeWithPreviousList,
  orderedMarker, removeListFormatting, resolveStructuredLists, sanitizeCustomMarker, splitListAt,
  unorderedMarker, renderListBlockMarkdown, renderListRunHtml
} from './structuredLists';

const paragraph = (id: string, text = `Text ${id}`): ContentBlock => ({ id, type: 'paragraph', text });

describe('semantic structured lists', () => {
  it.each(['unordered', 'ordered'] as const)('converts a paragraph to %s metadata without changing text or ID', (type) => {
    const source = paragraph('p1', 'Marker-free manuscript');
    const converted = convertBlocksToList([source], [source.id], type, 'list-1')[0];
    expect(converted).toMatchObject({ id: 'p1', text: source.text, listFormatting: { listId: 'list-1', type, level: 0 } });
    expect(converted.text).not.toMatch(/^(?:•|-|\*|\d+\.)\s/);
  });

  it('gives multiple selected paragraphs one stable list identity', () => {
    const converted = convertBlocksToList([paragraph('a'), paragraph('b')], ['a', 'b'], 'unordered', 'shared');
    expect(converted.map((block) => block.listFormatting?.listId)).toEqual(['shared', 'shared']);
  });

  it('skips unsupported structural blocks', () => {
    const heading: ContentBlock = { id: 'h', type: 'heading', text: 'Heading' };
    expect(convertBlocksToList([heading], ['h'], 'ordered', 'list')[0]).toEqual(heading);
  });

  it('removes only list metadata and preserves manuscript content', () => {
    const listed = { ...paragraph('a'), listFormatting: listFormatting('unordered', 'list') };
    expect(removeListFormatting(listed)).toEqual(paragraph('a'));
  });

  it('promotes, demotes, clamps levels, and keeps list identity', () => {
    const blocks = convertBlocksToList([paragraph('a'), paragraph('b')], ['a', 'b'], 'ordered', 'list');
    const demoted = changeListLevel(blocks, 1, 1);
    expect(demoted[1].listFormatting).toMatchObject({ listId: 'list', level: 1 });
    expect(changeListLevel(demoted, 1, 99)[1].listFormatting?.level).toBe(1);
    expect(changeListLevel(demoted, 1, -99)[1].listFormatting?.level).toBe(0);
    expect(MAX_LIST_LEVEL).toBe(4);
  });

  it.each([
    ['disc', '•'], ['circle', '◦'], ['square', '▪'], ['dash', '–'], ['arrow', '→'], ['check', '✓']
  ] as const)('resolves unordered %s markers', (style, marker) => {
    expect(unorderedMarker(style)).toBe(marker);
  });

  it('sanitizes and length-limits custom markers with a safe fallback', () => {
    expect(sanitizeCustomMarker('<script>javascript:ABCDEFGHIJK')).not.toMatch(/[<>]|javascript:/i);
    expect(Array.from(sanitizeCustomMarker('ABCDEFGHIJK')).length).toBeLessThanOrEqual(8);
    expect(unorderedMarker('custom', '<style=x>')).not.toContain('<');
    expect(unorderedMarker('custom', '')).toBe('•');
  });

  it.each([
    ['decimal', '3.'], ['lower-alpha', 'c.'], ['upper-alpha', 'C.'], ['lower-roman', 'iii.'],
    ['upper-roman', 'III.'], ['decimal-leading-zero', '03.'], ['decimal-outline', '1.3.']
  ] as const)('resolves ordered %s markers', (style, marker) => {
    expect(orderedMarker(style, 3, [1, 3])).toBe(marker);
  });

  it('resolves start, restart, continuation, nesting, and deterministic counters', () => {
    const blocks = [
      { ...paragraph('a'), listFormatting: listFormatting('ordered', 'list', { startAt: 4 }) },
      { ...paragraph('b'), listFormatting: listFormatting('ordered', 'list') },
      { ...paragraph('c'), listFormatting: listFormatting('ordered', 'list', { level: 1, orderedStyle: 'decimal-outline' }) },
      { ...paragraph('d'), listFormatting: listFormatting('ordered', 'list', { restart: true, startAt: 2 }) }
    ];
    const first = resolveStructuredLists(blocks);
    const second = resolveStructuredLists(structuredClone(blocks));
    expect([...first.values()].map((item) => item.markerText)).toEqual(['4.', '5.', '5.1.', '2.']);
    expect(second).toEqual(first);
  });

  it('recalculates numbering after insertion, deletion, and movement', () => {
    const listed = convertBlocksToList([paragraph('a'), paragraph('b'), paragraph('c')], ['a', 'b', 'c'], 'ordered', 'list');
    const markers = (blocks: ContentBlock[]) => [...resolveStructuredLists(blocks).values()].map((item) => item.markerText);
    expect(markers(listed)).toEqual(['1.', '2.', '3.']);
    expect(markers([listed[0], listed[2]])).toEqual(['1.', '2.']);
    expect(markers([listed[2], listed[0], listed[1]])).toEqual(['1.', '2.', '3.']);
  });

  it('splits and merges logical list identities reversibly', () => {
    const listed = convertBlocksToList([paragraph('a'), paragraph('b'), paragraph('c')], ['a', 'b', 'c'], 'ordered', 'old');
    const split = splitListAt(listed, 1, 'new');
    expect(split.map((block) => block.listFormatting?.listId)).toEqual(['old', 'new', 'new']);
    expect(mergeWithPreviousList(split, 1).map((block) => block.listFormatting?.listId)).toEqual(['old', 'old', 'old']);
  });

  it('resolves list indentation, spacing, colour precedence, and marker size', () => {
    const block = { ...paragraph('a'), textColour: '#123456', listFormatting: listFormatting('unordered', 'list', { level: 2, markerSizePercent: 999, spacingAfterPt: 12 }) };
    expect(resolveStructuredLists([block], { accent: '#abcdef' }).get('a')).toMatchObject({
      leftIndentPt: 72, hangingIndentPt: 14, spacingAfterPt: 12, markerColour: '#123456', markerSizePercent: 200
    });
  });

  it('exports valid nested semantic HTML without inserting markers into text', () => {
    const blocks = convertBlocksToList([paragraph('a', 'Top'), paragraph('b', 'Child')], ['a', 'b'], 'ordered', 'list');
    blocks[1].listFormatting!.level = 1;
    const html = renderListRunHtml(blocks);
    expect(html).toContain('<ol>');
    expect(html).toContain('<li data-list-id="list"');
    expect(html).toContain('Top<ol><li');
    expect(html).not.toContain('1. Top');
  });

  it('generates Markdown markers only at export time', () => {
    const block = { ...paragraph('a', 'Marker-free'), listFormatting: listFormatting('ordered', 'list', { level: 1 }) };
    const item = resolveStructuredLists([block]).get('a')!;
    expect(renderListBlockMarkdown(block, item)).toBe('  1. Marker-free');
    expect(block.text).toBe('Marker-free');
  });
});
