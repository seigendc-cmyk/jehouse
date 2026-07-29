import { describe, expect, it } from 'vitest';
import {
  chapterTitleIncludesNumber,
  getChapterDisplayLabel,
  getDocumentDisplayLabel
} from './documentDisplayLabel';

describe('canonical document display labels', () => {
  it.each([
    ['Chapter 1', 'Chapter 1'],
    ['', 'Chapter 1'],
    ['Introduction', 'Chapter 1 — Introduction'],
    ['Chapter 1: Introduction', 'Chapter 1: Introduction']
  ])('formats stored chapter title %j without duplicate prefixes', (title, expected) => {
    expect(getChapterDisplayLabel(1, title)).toBe(expected);
  });

  it('uses the real non-chapter workspace name', () => {
    expect(getDocumentDisplayLabel({ workspace: 'cover' })).toBe('Cover Studio');
    expect(getDocumentDisplayLabel({ workspace: 'frontmatter' })).toBe('Front Matter');
  });

  it('identifies when an editable stored title already carries the chapter number', () => {
    expect(chapterTitleIncludesNumber(1, 'Chapter 1: Opening')).toBe(true);
    expect(chapterTitleIncludesNumber(1, 'Opening')).toBe(false);
  });
});
