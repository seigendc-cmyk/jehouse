export type UITheme = 'sahara_dusk' | 'classic_dark' | 'warm_light';

export type BookCategory = 
  | 'Fiction & Literature'
  | 'Non-Fiction & Biography'
  | 'Academic & Textbook'
  | 'Business & Executive'
  | 'Science, Tech & Math'
  | 'Poetry & Arts';

export type TrimSize = '6x9' | '8.5x11' | 'A4' | 'A5' | '5x8' | 'Legal';

export type FontPairing = 'Classic Serif' | 'Modern Sans' | 'Garamond Editorial' | 'Technical Mono' | 'Literary Lora' | 'Cinzel Display' | 'Playfair Editorial' | 'Courier Typewriter';

export type FontFamily = 
  | 'Georgia, serif'
  | '"EB Garamond", serif'
  | 'Lora, serif'
  | '"Playfair Display", serif'
  | 'Cinzel, serif'
  | 'system-ui, sans-serif'
  | '"JetBrains Mono", monospace'
  | '"Courier Prime", monospace';

export type BlockType = 
  | 'paragraph'
  | 'heading'
  | 'subheading'
  | 'clause'
  | 'item'
  | 'image'
  | 'latex'
  | 'code'
  | 'ledger'
  | 'quiz'
  | 'callout'
  | 'quote'
  | 'pagebreak'
  | 'spreadsheet'
  | 'graph'
  | 'table'
  | 'caption';

export interface LedgerRow {
  date: string;
  account: string;
  debit: string;
  credit: string;
  notes?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface SpreadsheetData {
  title?: string;
  columns: string[]; // ['A', 'B', 'C', 'D']
  headers?: string[]; // Custom header titles
  rows: string[][]; // 2D matrix
}

export interface GraphDataPoint {
  label: string;
  value: number;
  value2?: number;
}

export interface GraphBlockData {
  chartType: 'bar' | 'line' | 'area' | 'pie';
  title: string;
  caption?: string;
  color: string;
  legendStyle?: 'default' | 'white' | 'hidden';
  data: GraphDataPoint[];
}

export interface TableBlockData {
  title?: string;
  caption?: string;
  headers: string[];
  rows: string[][];
  striped?: boolean;
}

export interface CaptionData {
  type: 'Figure' | 'Table' | 'Graph' | 'Equation' | 'Listing';
  number?: string;
  text: string;
}

export interface TrackedChange {
  id: string;
  type: 'insertion' | 'deletion';
  text: string;
  originalText?: string;
  author: string;
  timestamp: string;
  blockId: string;
  chapterId?: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface ContentBlock {
  id: string;
  type: BlockType;
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  align?: 'left' | 'center' | 'right' | 'justify';
  indentLevel?: number; // 0, 1, 2, 3
  fontStyle?: 'serif' | 'sans' | 'mono';
  fontSize?: number; // Custom font size in px e.g. 14, 16, 18, 24, 32
  fontFamily?: string; // Custom font family name
  lineHeight?: number; // Custom line height multiplier e.g. 1.4, 1.6
  /** Explicit colour for the complete block. Omit to inherit from book typography. */
  textColour?: string;
  paragraphFormatting?: BlockParagraphFormatting;

  
  // Review Mode / Track Changes
  trackedChanges?: TrackedChange[];
  isInsertedInReview?: boolean;
  isDeletedInReview?: boolean;
  
  // Specific block metadata
  imageUrl?: string;
  imageCaption?: string;
  imageWrap?: 'center' | 'full' | 'left' | 'right' | 'background-watermark' | 'hero-header';
  imageWidth?: string; // e.g. '25%', '33%', '50%', '75%', '100%'
  imageOpacity?: number; // 0.1 to 1.0 (e.g. 0.25 for background scene)
  imageBlendMode?: 'normal' | 'multiply' | 'overlay' | 'screen' | 'darken';
  imageFrameStyle?: 'none' | 'shadow' | 'polaroid' | 'vintage' | 'vignette' | 'rounded';
  imagePositionX?: number; // -50 to 50 fine offset
  imagePositionY?: number; // -50 to 50 fine offset
  
  latexFormula?: string; // e.g. "E = mc^2" or "\int_0^\infty e^{-x^2} dx"
  
  codeLanguage?: string; // 'typescript' | 'python' | 'cpp' | 'sql' | 'html'
  codeSnippet?: string;
  
  ledgerData?: LedgerRow[];
  
  quizQuestions?: QuizQuestion[];
  
  // New Scientific & Data Blocks
  spreadsheetData?: SpreadsheetData;
  graphData?: GraphBlockData;
  tableData?: TableBlockData;
  captionData?: CaptionData;
  
  footnoteRef?: string; // e.g., "1" or "a"
  footnoteText?: string; // e.g., "See Smith et al., 2024, p. 142."
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  subtitle?: string;
  blocks: ContentBlock[];
  wordCount: number;
  seasonId?: string;
  seasonNumber?: number;
  episodeId?: string;
  episodeNumber?: number;
  episodeTitle?: string;
}

export interface Episode {
  id: string;
  episodeNumber: number;
  title: string;
  subtitle?: string;
  synopsis?: string;
  releaseDate?: string;
  chapterIds?: string[];
}

export interface Season {
  id: string;
  seasonNumber: number;
  title: string;
  subtitle?: string;
  description?: string;
  releaseYear?: string;
  episodes: Episode[];
  chapterIds?: string[];
}

export interface SeriesConfig {
  isSeries: boolean;
  seriesTitle: string;
  seriesNumber?: string; // e.g. "Volume 1" or "Book 1 of 5"
  totalSeasons?: number;
  totalEpisodes?: number;
  publisherSeriesId?: string;
  tagline?: string;
  seasons: Season[];
}

export interface CoverConfig {
  title: string;
  subtitle: string;
  author: string;
  publisher: string;
  coverBgColor: string; // e.g., '#1e2022' or '#f97316'
  textColor: string; // e.g., '#ffffff' or '#f97316'
  accentColor: string; // e.g., '#ea580c'
  spineWidthMm: number; // e.g. 18mm
  backBlurb: string;
  artworkUrl?: string;
  artworkPrompt?: string;
  fullBleedImage?: boolean;
  imageOpacity?: number;
  layoutStyle: 'centered' | 'modern-minimal' | 'bold-editorial' | 'classic-frame';
}

export type TocStyle = 'dotted' | 'clean' | 'academic' | 'modern';

export interface TableOfContentsConfig {
  title?: string;
  style?: TocStyle;
  showSubheadings?: boolean;
  showChapterSubtitles?: boolean;
  startPageNumber?: number;
  customChapterPages?: Record<string, number>;
}

export interface FrontMatter {
  includeTitlePage: boolean;
  includeCopyright: boolean;
  copyrightText: string;
  isbn: string;
  publisher: string;
  
  includeDedication: boolean;
  dedicationText: string;
  
  includeForeword: boolean;
  forewordAuthor: string;
  forewordContent: string;
  
  includeExecutiveSummary: boolean;
  executiveSummaryContent: string;
  
  includeTOC: boolean;
  tocConfig?: TableOfContentsConfig;
  
  includeIndex?: boolean;
  indexConfig?: IndexConfig;
}

export interface IndexConfig {
  title?: string;
  customTerms?: string[];
  autoExtractKeywords?: boolean;
  minOccurrences?: number;
  style?: 'columns-2' | 'columns-3' | 'compact';
}

export interface WatermarkConfig {
  enabled: boolean;
  type?: 'text' | 'image' | 'both';
  text: string; // "DRAFT", "CONFIDENTIAL", "SPECIMEN COPY"
  imageUrl?: string; // Custom image watermark or background scene illustration
  opacity: number; // 0.05 to 0.5
  rotation: number; // -45 deg or 0
  fontSize: number; // e.g. 72px
  imageScale?: number; // 0.2 to 2.0
  imagePosition?: 'center' | 'stretch' | 'tile' | 'top-right' | 'bottom-left';
}

export type PageOrientation = 'portrait' | 'landscape';

export type TypographyPresetId =
  | 'legacy'
  | 'modern-bold'
  | 'classic-literary'
  | 'contemporary-minimal'
  | 'academic'
  | 'dramatic-fiction'
  | 'custom';

export type TypographyAlignment = 'left' | 'centre' | 'right';
export type RunningHeaderSource =
  | 'book-title'
  | 'chapter-title'
  | 'chapter-number-title'
  | 'author'
  | 'custom';

export interface BookTypographySettings {
  schemaVersion: 1;
  presetId: TypographyPresetId;
  body: {
    fontFamily: string;
    fontSizePt: number;
    fontWeight: number;
    lineHeight: number;
    textColour: string;
    paragraphSpacingBeforePt: number;
    paragraphSpacingAfterPt: number;
  };
  chapterOpening: {
    alignment: TypographyAlignment;
    numberFontFamily: string;
    numberFontSizePt: number;
    numberWeight: number;
    numberColour: string;
    titleFontFamily: string;
    titleFontSizePt: number;
    titleWeight: number;
    titleColour: string;
    subtitleFontFamily: string;
    subtitleFontSizePt: number;
    subtitleWeight: number;
    subtitleColour: string;
    topSpacingPt: number;
    numberToTitleSpacingPt: number;
    titleToBodySpacingPt: number;
    showDivider: boolean;
    dividerColour: string;
    dividerThicknessPt: number;
    dividerWidthPercent: number;
    suppressRunningHeader: boolean;
  };
  continuation: {
    enabled: boolean;
    alignment: TypographyAlignment | 'split';
    fontFamily: string;
    fontSizePt: number;
    fontWeight: number;
    fontColour: string;
    showChapterNumber: boolean;
    showChapterTitle: boolean;
    showContinued: boolean;
    showDivider: boolean;
    dividerColour: string;
    dividerThicknessPt: number;
  };
  paragraphs: {
    schemaVersion: 1;
    presetId: ParagraphPresetId;
    defaultMode: ParagraphMode;
    firstParagraphAfterChapter: 'inherit' | 'no-indent' | 'block';
    subsequentParagraphMode: 'inherit' | 'first-line' | 'block';
    firstLineIndentPt: number;
    leftIndentPt: number;
    rightIndentPt: number;
    hangingIndentPt: number;
    spacingBeforePt: number;
    spacingAfterPt: number;
    lineHeight: number;
    suppressIndentAfterHeading: boolean;
    suppressIndentAfterSceneBreak: boolean;
    suppressIndentAfterImage: boolean;
    widowOrphanEnabled: boolean;
    minimumLines: number;
    keepWithNextForHeadings: boolean;
  };
  runningHeaders: {
    suppressOnChapterOpening: boolean;
    suppressOnBlankPages: boolean;
    oddPageSource: RunningHeaderSource;
    evenPageSource: RunningHeaderSource;
    customOddText?: string;
    customEvenText?: string;
  };
}

export type ParagraphMode = 'inherit' | 'first-line' | 'block' | 'none' | 'hanging';
export type ParagraphPresetId = 'legacy' | 'fiction-standard' | 'literary' | 'block-paragraph' | 'academic' | 'compact' | 'custom';
export interface BlockParagraphFormatting {
  mode?: ParagraphMode;
  firstLineIndentPt?: number;
  leftIndentPt?: number;
  rightIndentPt?: number;
  hangingIndentPt?: number;
  spacingBeforePt?: number;
  spacingAfterPt?: number;
  lineHeight?: number;
}

export type BookColourRole =
  | 'bodyText' | 'primaryHeading' | 'secondaryHeading' | 'chapterNumber'
  | 'chapterTitle' | 'chapterSubtitle' | 'continuationHeader' | 'runningHeader'
  | 'divider' | 'quote' | 'caption' | 'mutedText' | 'hyperlink' | 'accent'
  | 'pageBackground';

export interface BookColourPalette {
  id: string;
  name: string;
  source: 'built-in' | 'custom';
  colours: Record<BookColourRole, string>;
}

export interface BookColourSettings {
  schemaVersion: 1;
  activePaletteId: string;
  customPalettes: BookColourPalette[];
  recentColours: string[];
}

export type MarginPreset = 'auto' | 'compact' | 'standard' | 'generous' | 'custom';

export interface CustomMargins {
  top: string;
  right: string;
  bottom: string;
  left: string;
}

export type BibEntryType = 'article' | 'book' | 'inproceedings' | 'techreport' | 'phdthesis' | 'misc' | 'online';

export interface BibliographyEntry {
  id: string;
  citeKey: string; // e.g., "smith2024neural"
  entryType: BibEntryType; // e.g. "article", "book", "inproceedings", "misc"
  title: string;
  author: string;
  year: string;
  journalOrPublisher?: string;
  volume?: string;
  numberOrIssue?: string;
  pages?: string;
  doi?: string;
  url?: string;
  note?: string;
}

export interface ExportSettings {
  includeCover: boolean;
  includeFrontMatter: boolean;
  includeExecSummary: boolean;
  includeTOC: boolean;
  includeIndex?: boolean;
  includeQuizzes: boolean;
  includeWatermark: boolean;
  includeFootnotes: boolean;
  includeBibliography?: boolean;
  trimSize: TrimSize;
  pageOrientation?: PageOrientation;
  fontPairing: FontPairing;
  googleSerifFont?: string;
  googleSansFont?: string;
  marginPreset?: MarginPreset;
  customMargins?: CustomMargins;
  showRunningHeader: boolean;
  showPageNumbers: boolean;
  enableHyphenation?: boolean;
  autoHyphenation?: boolean;
}

export interface HeaderFooterConfig {
  enabled: boolean;
  headerLeftText: string;
  headerCenterText: string;
  headerRightText: string;
  footerLeftText: string;
  footerCenterText: string;
  footerRightText: string;
  showPageNumbers: boolean;
  headerDividerLine: boolean;
  footerDividerLine: boolean;
}

export interface ProofreadIssue {
  originalText: string;
  correction: string;
  explanation: string;
  type: 'spelling' | 'grammar' | 'style' | 'punctuation';
}

export type AssetCategory = 'illustrations' | 'charts' | 'covers' | 'figures' | 'photos' | 'uncategorized';

export interface ProjectAsset {
  id: string;
  name: string;
  url: string; // Base64 data URL or external URL
  caption?: string;
  category?: AssetCategory;
  tags?: string[];
  uploadedAt: string;
  sizeBytes?: number;
  width?: number;
  height?: number;
}

export interface BookProject {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  category: BookCategory;
  lastSaved: string;
  cloudSynced: boolean;
  
  series?: SeriesConfig;
  cover: CoverConfig;
  frontMatter: FrontMatter;
  chapters: Chapter[];
  watermark: WatermarkConfig;
  exportSettings: ExportSettings;
  /** Versioned document typography. Optional only for pre-v2 projects read before migration. */
  typography?: BookTypographySettings;
  /** Versioned publication colour metadata. Optional only for projects awaiting migration. */
  colourSettings?: BookColourSettings;
  headerFooter?: HeaderFooterConfig;
  
  // Asset Library
  assets?: ProjectAsset[];

  // Bibliography / Citations
  bibliography?: BibliographyEntry[];

  // Archive flag for book project management
  archived?: boolean;

  // Review Mode & Track Changes Flags
  isReviewModeActive?: boolean;

  showReviewMarkup?: boolean;
}
