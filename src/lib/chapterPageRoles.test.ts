import { describe, expect, it } from 'vitest';
import { ContentBlock } from '../types';
import {
  classifyChapterBlocks,
  getChapterPageRole,
  shouldShowChapterRunningHeader
} from './chapterPageRoles';

describe('chapter print-preview page roles', () => {
  it('classifies the first segment as opening and later segments as continuation', () => {
    expect(getChapterPageRole(0)).toBe('chapter-opening');
    expect(getChapterPageRole(1)).toBe('chapter-continuation');
  });

  it('keeps opening content separate from continuation content at explicit page breaks', () => {
    const blocks = [
      { id: 'opening', type: 'paragraph', text: 'Opening text' },
      { id: 'break', type: 'pagebreak', text: '' },
      { id: 'continued', type: 'paragraph', text: 'Continued text' }
    ] as ContentBlock[];

    expect(classifyChapterBlocks(blocks)).toEqual([
      { role: 'chapter-opening', blocks: [blocks[0]] },
      { role: 'chapter-continuation', blocks: [blocks[2]] }
    ]);
  });

  it('suppresses running headers on opening pages and allows them on continuations', () => {
    expect(shouldShowChapterRunningHeader('chapter-opening', true)).toBe(false);
    expect(shouldShowChapterRunningHeader('chapter-continuation', true)).toBe(true);
    expect(shouldShowChapterRunningHeader('chapter-continuation', false)).toBe(false);
  });
});
