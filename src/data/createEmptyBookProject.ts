import { BookCategory, BookProject } from '../types';
import { getDefaultTypography } from '../lib/bookTypography';

export interface EmptyBookProjectOptions {
  title?: string;
  subtitle?: string;
  author?: string;
  category?: BookCategory;
}

export function createEmptyBookProject(
  options: EmptyBookProjectOptions = {}
): BookProject {
  const id = `book-${Date.now()}-${crypto.randomUUID()}`;
  const title = options.title?.trim() ?? '';
  const subtitle = options.subtitle?.trim() ?? '';
  const author = options.author?.trim() ?? '';

  const category = options.category ?? 'Fiction & Literature';
  return {
    id,
    title,
    subtitle,
    author,
    category,
    lastSaved: '',
    cloudSynced: false,
    archived: false,
    series: {
      isSeries: false,
      seriesTitle: '',
      seasons: []
    },
    cover: {
      title,
      subtitle,
      author,
      publisher: '',
      coverBgColor: '#EA580C',
      textColor: '#FFFFFF',
      accentColor: '#C2410C',
      spineWidthMm: 12,
      backBlurb: '',
      fullBleedImage: false,
      imageOpacity: 100,
      layoutStyle: 'modern-minimal'
    },
    frontMatter: {
      includeTitlePage: true,
      includeCopyright: false,
      copyrightText: '',
      isbn: '',
      publisher: '',
      includeDedication: false,
      dedicationText: '',
      includeForeword: false,
      forewordAuthor: '',
      forewordContent: '',
      includeExecutiveSummary: false,
      executiveSummaryContent: '',
      includeTOC: true
    },
    chapters: [
      {
        id: `chapter-${crypto.randomUUID()}`,
        number: 1,
        title: 'Chapter 1',
        wordCount: 0,
        blocks: [
          {
            id: `block-${crypto.randomUUID()}`,
            type: 'paragraph',
            text: '',
            fontFamily: 'Georgia, serif',
            fontSize: 16,
            align: 'left',
            lineHeight: 1.6
          }
        ]
      }
    ],
    watermark: {
      enabled: false,
      type: 'text',
      text: 'DRAFT',
      opacity: 0.08,
      rotation: -35,
      fontSize: 54
    },
    exportSettings: {
      includeCover: true,
      includeFrontMatter: true,
      includeExecSummary: false,
      includeTOC: true,
      includeQuizzes: false,
      includeWatermark: false,
      includeFootnotes: true,
      includeBibliography: false,
      trimSize: '6x9',
      fontPairing: 'Classic Serif',
      marginPreset: 'standard',
      showRunningHeader: true,
      showPageNumbers: true,
      enableHyphenation: true,
      autoHyphenation: true
    },
    typography: getDefaultTypography(category),
    headerFooter: {
      enabled: true,
      headerLeftText: '',
      headerCenterText: '',
      headerRightText: '',
      footerLeftText: '',
      footerCenterText: 'Page {page}',
      footerRightText: '',
      showPageNumbers: true,
      headerDividerLine: false,
      footerDividerLine: false
    },
    assets: [],
    bibliography: [],
    isReviewModeActive: false,
    showReviewMarkup: true
  };
}
