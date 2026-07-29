import { ContentBlock } from '../types';

export type ChapterPageRole = 'chapter-opening' | 'chapter-continuation';

export function getChapterPageRole(segmentIndex: number): ChapterPageRole {
  return segmentIndex === 0 ? 'chapter-opening' : 'chapter-continuation';
}

export function shouldShowChapterRunningHeader(
  role: ChapterPageRole,
  enabled: boolean
): boolean {
  return enabled && role === 'chapter-continuation';
}

export function classifyChapterBlocks(
  blocks: ContentBlock[]
): Array<{ role: ChapterPageRole; blocks: ContentBlock[] }> {
  const pages: Array<{ role: ChapterPageRole; blocks: ContentBlock[] }> = [
    { role: 'chapter-opening', blocks: [] }
  ];

  for (const block of blocks) {
    if (block.type === 'pagebreak') {
      pages.push({ role: getChapterPageRole(pages.length), blocks: [] });
    } else {
      pages[pages.length - 1].blocks.push(block);
    }
  }

  return pages;
}
