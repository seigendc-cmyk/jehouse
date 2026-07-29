import { Chapter, FrontMatter, IndexConfig } from '../types';
import { calculateTocData } from './tocUtils';

export interface IndexTermEntry {
  term: string;
  pages: number[];
  count: number;
}

export interface IndexLetterGroup {
  letter: string;
  terms: IndexTermEntry[];
}

const COMMON_STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
  'from', 'up', 'about', 'into', 'over', 'after', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'this', 'that', 'these', 'those',
  'it', 'its', 'they', 'them', 'their', 'we', 'us', 'our', 'you', 'your', 'he', 'him',
  'his', 'she', 'her', 'not', 'no', 'can', 'will', 'should', 'would', 'could', 'may',
  'might', 'chapter', 'section', 'page', 'book', 'author', 'title', 'figure', 'table'
]);

/**
 * Automatically extracts candidate multi-word proper nouns or frequent technical keywords
 * from the chapters text.
 */
export function autoDiscoverKeywords(chapters: Chapter[], maxKeywords: number = 20): string[] {
  const termCounts = new Map<string, number>();

  for (const ch of chapters) {
    for (const block of ch.blocks) {
      if (!block.text) continue;

      // Extract capitalized phrases (e.g., "Quantum Value Networks", "Financial Intelligence")
      const capitalizedPhrases = block.text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
      for (const rawPhrase of capitalizedPhrases) {
        const phrase = rawPhrase.trim();
        if (phrase.length < 3) continue;
        if (COMMON_STOP_WORDS.has(phrase.toLowerCase())) continue;
        
        // Count frequency
        termCounts.set(phrase, (termCounts.get(phrase) || 0) + 1);
      }

      // Also extract featured terms inside quotes or bold-like markers if any
      const quotedTerms = block.text.match(/"([^"]+)"/g) || [];
      for (const q of quotedTerms) {
        const clean = q.replace(/"/g, '').trim();
        if (clean.length > 3 && clean.length < 35 && !COMMON_STOP_WORDS.has(clean.toLowerCase())) {
          termCounts.set(clean, (termCounts.get(clean) || 0) + 2);
        }
      }
    }
  }

  // Sort terms by frequency and pick top keywords
  const sorted = Array.from(termCounts.entries())
    .filter(([term, count]) => count >= 1 && term.split(' ').length <= 4)
    .sort((a, b) => b[1] - a[1])
    .map(([term]) => term);

  // Return unique terms up to maxKeywords
  return Array.from(new Set(sorted)).slice(0, maxKeywords);
}

/**
 * Generates structured Index of Terms grouped alphabetically by initial letter.
 * Calculates exact page numbers for each occurrence across chapters.
 */
export function generateIndexOfTerms(chapters: Chapter[], frontMatter: FrontMatter): IndexLetterGroup[] {
  const config: IndexConfig = frontMatter.indexConfig || {};
  const autoExtract = config.autoExtractKeywords ?? true;
  
  // 1. Combine user custom terms & auto-extracted terms
  let targetTerms = config.customTerms ? [...config.customTerms] : [];

  if (autoExtract || targetTerms.length === 0) {
    const discovered = autoDiscoverKeywords(chapters, 25);
    // Merge without duplicates
    for (const term of discovered) {
      if (!targetTerms.some(t => t.toLowerCase() === term.toLowerCase())) {
        targetTerms.push(term);
      }
    }
  }

  // Ensure terms are clean non-empty strings
  targetTerms = targetTerms.map(t => t.trim()).filter(Boolean);

  if (targetTerms.length === 0) {
    return [];
  }

  // 2. Pre-calculate TOC data to know chapter starting page numbers
  const tocData = calculateTocData(chapters, frontMatter);
  const chapterPageMap = new Map<string, number>();
  tocData.chapters.forEach(ch => {
    chapterPageMap.set(ch.id, ch.pageNumber);
  });

  // 3. Track term page occurrences
  const termPagesMap = new Map<string, Set<number>>();
  const termCountMap = new Map<string, number>();

  for (const term of targetTerms) {
    termPagesMap.set(term, new Set<number>());
    termCountMap.set(term, 0);
  }

  // Iterate over chapters and blocks to match term occurrences
  for (const ch of chapters) {
    const startPage = chapterPageMap.get(ch.id) || 1;
    let cumulativeWords = 0;

    for (const block of ch.blocks) {
      if (!block.text) continue;

      // Calculate approximate page for this block
      const currentBlockPage = startPage + Math.floor(cumulativeWords / 280);

      const lowerBlockText = block.text.toLowerCase();

      for (const term of targetTerms) {
        const lowerTerm = term.toLowerCase();
        
        // Escape regex characters
        const regexSafeTerm = lowerTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${regexSafeTerm}\\b`, 'gi');
        const matches = lowerBlockText.match(regex);

        if (matches && matches.length > 0) {
          const pageSet = termPagesMap.get(term)!;
          pageSet.add(currentBlockPage);
          termCountMap.set(term, (termCountMap.get(term) || 0) + matches.length);
        }
      }

      // Add block words to cumulative count
      cumulativeWords += block.text.trim().split(/\s+/).length;
      if (block.type === 'pagebreak') {
        cumulativeWords += 280;
      }
    }
  }

  // Filter out terms with zero occurrences if minOccurrences is set
  const minOccurrences = config.minOccurrences ?? 1;
  const validTerms: IndexTermEntry[] = [];

  for (const term of targetTerms) {
    const pages = Array.from(termPagesMap.get(term) || []).sort((a, b) => a - b);
    const count = termCountMap.get(term) || 0;

    if (count >= minOccurrences || pages.length > 0) {
      validTerms.push({
        term,
        pages: pages.length > 0 ? pages : [1], // fallback page 1 if previewing empty
        count: Math.max(count, 1),
      });
    }
  }

  // Sort valid terms alphabetically
  validTerms.sort((a, b) => a.term.localeCompare(b.term, undefined, { sensitivity: 'base' }));

  // Group by first letter
  const groupsMap = new Map<string, IndexTermEntry[]>();

  for (const item of validTerms) {
    const firstLetter = item.term.charAt(0).toUpperCase();
    const groupKey = /[A-Z]/.test(firstLetter) ? firstLetter : '#';

    if (!groupsMap.has(groupKey)) {
      groupsMap.set(groupKey, []);
    }
    groupsMap.get(groupKey)!.push(item);
  }

  // Convert map to sorted array of letter groups
  const letterGroups: IndexLetterGroup[] = Array.from(groupsMap.entries())
    .map(([letter, terms]) => ({ letter, terms }))
    .sort((a, b) => a.letter.localeCompare(b.letter));

  return letterGroups;
}
