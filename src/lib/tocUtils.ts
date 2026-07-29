import { Chapter, FrontMatter, TableOfContentsConfig } from '../types';

export interface TocSubheadingItem {
  id: string;
  text: string;
  type: 'heading' | 'subheading';
  pageNumber: number;
}

export interface TocChapterItem {
  id: string;
  number: number;
  title: string;
  subtitle?: string;
  pageNumber: number;
  subheadings: TocSubheadingItem[];
}

export interface TocData {
  frontMatterPages: { name: string; pageNumber: number }[];
  chapters: TocChapterItem[];
}

/**
 * Calculates page numbers for front matter sections and chapters.
 * Takes into account word counts, explicit page breaks, and user overrides.
 */
export function calculateTocData(chapters: Chapter[], frontMatter: FrontMatter): TocData {
  const config: TableOfContentsConfig = frontMatter.tocConfig || {};
  
  // 1. Calculate Front Matter Pages Count
  let currentPage = 1;
  const frontMatterPages: { name: string; pageNumber: number }[] = [];

  if (frontMatter.includeTitlePage) {
    frontMatterPages.push({ name: 'Title Page', pageNumber: currentPage });
    currentPage += 1;
  }

  if (frontMatter.includeCopyright) {
    frontMatterPages.push({ name: 'Copyright & Imprint', pageNumber: currentPage });
    currentPage += 1;
  }

  if (frontMatter.includeDedication && frontMatter.dedicationText) {
    frontMatterPages.push({ name: 'Dedication', pageNumber: currentPage });
    currentPage += 1;
  }

  if (frontMatter.includeForeword && frontMatter.forewordContent) {
    // Estimating foreword length
    const forewordWords = frontMatter.forewordContent.trim().split(/\s+/).length;
    const forewordPageCount = Math.max(1, Math.ceil(forewordWords / 300));
    frontMatterPages.push({ name: 'Foreword', pageNumber: currentPage });
    currentPage += forewordPageCount;
  }

  if (frontMatter.includeExecutiveSummary && frontMatter.executiveSummaryContent) {
    const execWords = frontMatter.executiveSummaryContent.trim().split(/\s+/).length;
    const execPageCount = Math.max(1, Math.ceil(execWords / 300));
    frontMatterPages.push({ name: 'Executive Summary', pageNumber: currentPage });
    currentPage += execPageCount;
  }

  if (frontMatter.includeTOC) {
    // TOC itself takes ~1-2 pages depending on chapter count
    const tocPages = chapters.length > 12 ? 2 : 1;
    frontMatterPages.push({ name: 'Table of Contents', pageNumber: currentPage });
    currentPage += tocPages;
  }

  // 2. Starting page for Chapter 1
  // If user set a custom start page for Chapter 1, use it, otherwise use current page after front matter
  let chapterStartPage = config.startPageNumber && config.startPageNumber > 0 
    ? config.startPageNumber 
    : currentPage;

  const calculatedChapters: TocChapterItem[] = [];

  for (const ch of chapters) {
    const customPage = config.customChapterPages?.[ch.id];
    const pageNumber = typeof customPage === 'number' ? customPage : chapterStartPage;

    // Extract subheadings if enabled
    const subheadings: TocSubheadingItem[] = [];
    let cumulativeWordsInChapter = 0;

    for (const block of ch.blocks) {
      if (block.type === 'heading' || block.type === 'subheading') {
        const offsetPages = Math.floor(cumulativeWordsInChapter / 280);
        subheadings.push({
          id: block.id,
          text: block.text || 'Untitled Section',
          type: block.type,
          pageNumber: pageNumber + offsetPages,
        });
      }
      
      if (block.text) {
        cumulativeWordsInChapter += block.text.trim().split(/\s+/).length;
      }
      if (block.type === 'pagebreak') {
        cumulativeWordsInChapter += 280; // simulate a page advance
      }
    }

    calculatedChapters.push({
      id: ch.id,
      number: ch.number,
      title: ch.title,
      subtitle: ch.subtitle,
      pageNumber,
      subheadings,
    });

    // Estimate total pages for this chapter (~280 words per book page)
    const pageBreakCount = ch.blocks.filter(b => b.type === 'pagebreak').length;
    const totalWords = ch.wordCount || ch.blocks.reduce((acc, b) => acc + (b.text ? b.text.split(/\s+/).length : 0), 0);
    const chapterLengthPages = Math.max(1, Math.ceil(totalWords / 280) + pageBreakCount);

    chapterStartPage = pageNumber + chapterLengthPages;
  }

  return {
    frontMatterPages,
    chapters: calculatedChapters,
  };
}
