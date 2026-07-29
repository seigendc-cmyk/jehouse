import { describe, expect, it } from 'vitest';
import { createEmptyBookProject } from './createEmptyBookProject';

describe('createEmptyBookProject', () => {
  it('creates a valid clean project without fabricated identity or publishing data', () => {
    const project = createEmptyBookProject();
    expect(project.id).toMatch(/^book-/);
    expect(project.title).toBe('');
    expect(project.author).toBe('');
    expect(project.frontMatter.isbn).toBe('');
    expect(project.frontMatter.publisher).toBe('');
    expect(project.cloudSynced).toBe(false);
    expect(project.lastSaved).toBe('');
  });

  it('uses only structural chapter defaults with no sample prose', () => {
    const project = createEmptyBookProject({ title: 'My Book' });
    expect(project.title).toBe('My Book');
    expect(project.chapters).toHaveLength(1);
    expect(project.chapters[0].wordCount).toBe(0);
    expect(project.chapters[0].blocks.map((block) => block.text).join('')).toBe('');
    expect(project.assets).toEqual([]);
    expect(project.bibliography).toEqual([]);
  });

  it('generates unique project, chapter and block identifiers', () => {
    const first = createEmptyBookProject();
    const second = createEmptyBookProject();
    expect(first.id).not.toBe(second.id);
    expect(first.chapters[0].id).not.toBe(second.chapters[0].id);
    expect(first.chapters[0].blocks[0].id).not.toBe(second.chapters[0].blocks[0].id);
  });
});
