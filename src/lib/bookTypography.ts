import {
  BookCategory,
  BookProject,
  BookTypographySettings,
  PageOrientation,
  TrimSize,
  TypographyPresetId
} from '../types';
import { cloneParagraphPreset } from './paragraphFormatting';

const base = (
  presetId: TypographyPresetId,
  overrides: Partial<BookTypographySettings> = {}
): BookTypographySettings => ({
  schemaVersion: 1,
  presetId,
  body: {
    fontFamily: 'Georgia, serif',
    fontSizePt: 11,
    fontWeight: 400,
    lineHeight: 1.65,
    textColour: '#111111',
    paragraphSpacingBeforePt: 0,
    paragraphSpacingAfterPt: 8
  },
  chapterOpening: {
    alignment: 'centre',
    numberFontFamily: 'Georgia, serif',
    numberFontSizePt: 22,
    numberWeight: 700,
    numberColour: '#111111',
    titleFontFamily: 'Georgia, serif',
    titleFontSizePt: 18,
    titleWeight: 400,
    titleColour: '#111111',
    subtitleFontFamily: 'Georgia, serif',
    subtitleFontSizePt: 13,
    subtitleWeight: 400,
    subtitleColour: '#555555',
    topSpacingPt: 36,
    numberToTitleSpacingPt: 6,
    titleToBodySpacingPt: 24,
    showDivider: true,
    dividerColour: '#111111',
    dividerThicknessPt: 1.5,
    dividerWidthPercent: 100,
    suppressRunningHeader: true
  },
  continuation: {
    enabled: true,
    alignment: 'split',
    fontFamily: 'Georgia, serif',
    fontSizePt: 11,
    fontWeight: 700,
    fontColour: '#222222',
    showChapterNumber: true,
    showChapterTitle: true,
    showContinued: true,
    showDivider: true,
    dividerColour: '#111111',
    dividerThicknessPt: 1.5
  },
  paragraphs: {
    schemaVersion: 1,
    presetId: 'legacy',
    defaultMode: 'none',
    firstParagraphAfterChapter: 'inherit',
    subsequentParagraphMode: 'inherit',
    firstLineIndentPt: 0,
    leftIndentPt: 0,
    rightIndentPt: 0,
    hangingIndentPt: 0,
    spacingBeforePt: 0,
    spacingAfterPt: 8,
    lineHeight: 1.65,
    suppressIndentAfterHeading: false,
    suppressIndentAfterSceneBreak: false,
    suppressIndentAfterImage: false,
    widowOrphanEnabled: false,
    minimumLines: 2,
    keepWithNextForHeadings: true
  },
  runningHeaders: {
    suppressOnChapterOpening: true,
    suppressOnBlankPages: true,
    oddPageSource: 'book-title',
    evenPageSource: 'book-title'
  },
  ...overrides
});

const presets: Record<Exclude<TypographyPresetId, 'custom'>, BookTypographySettings> = {
  legacy: base('legacy'),
  'modern-bold': base('modern-bold', {
    paragraphs: cloneParagraphPreset('fiction-standard'),
    chapterOpening: {
      ...base('legacy').chapterOpening,
      numberFontFamily: 'system-ui, sans-serif',
      numberFontSizePt: 25,
      numberWeight: 800,
      titleFontFamily: 'system-ui, sans-serif',
      titleFontSizePt: 21,
      titleWeight: 750,
      topSpacingPt: 42,
      dividerColour: '#ea580c',
      dividerThicknessPt: 1,
      dividerWidthPercent: 34
    },
    continuation: {
      ...base('legacy').continuation,
      fontFamily: 'system-ui, sans-serif',
      fontSizePt: 9,
      fontWeight: 600,
      dividerThicknessPt: 0.75
    }
  }),
  'classic-literary': base('classic-literary', {
    paragraphs: cloneParagraphPreset('literary'),
    chapterOpening: {
      ...base('legacy').chapterOpening,
      numberFontFamily: '"EB Garamond", serif',
      numberFontSizePt: 20,
      numberWeight: 500,
      titleFontFamily: '"EB Garamond", serif',
      titleFontSizePt: 20,
      titleWeight: 500,
      subtitleFontFamily: '"EB Garamond", serif',
      topSpacingPt: 54,
      titleToBodySpacingPt: 30,
      dividerColour: '#9ca3af',
      dividerThicknessPt: 0.5,
      dividerWidthPercent: 24
    }
  }),
  'contemporary-minimal': base('contemporary-minimal', {
    paragraphs: cloneParagraphPreset('block-paragraph'),
    chapterOpening: {
      ...base('legacy').chapterOpening,
      alignment: 'left',
      numberFontFamily: 'system-ui, sans-serif',
      numberFontSizePt: 13,
      numberWeight: 700,
      titleFontFamily: 'system-ui, sans-serif',
      titleFontSizePt: 19,
      titleWeight: 650,
      topSpacingPt: 24,
      numberToTitleSpacingPt: 3,
      titleToBodySpacingPt: 18,
      dividerThicknessPt: 0.5,
      dividerWidthPercent: 100
    }
  }),
  academic: base('academic', {
    paragraphs: cloneParagraphPreset('academic'),
    body: {
      ...base('legacy').body,
      fontFamily: '"EB Garamond", serif',
      lineHeight: 1.55,
      paragraphSpacingAfterPt: 6
    },
    chapterOpening: {
      ...base('legacy').chapterOpening,
      alignment: 'left',
      numberFontFamily: 'system-ui, sans-serif',
      numberFontSizePt: 12,
      numberWeight: 700,
      titleFontFamily: 'system-ui, sans-serif',
      titleFontSizePt: 18,
      titleWeight: 700,
      topSpacingPt: 20,
      titleToBodySpacingPt: 16,
      dividerWidthPercent: 100
    }
  }),
  'dramatic-fiction': base('dramatic-fiction', {
    paragraphs: cloneParagraphPreset('fiction-standard'),
    chapterOpening: {
      ...base('legacy').chapterOpening,
      numberFontSizePt: 34,
      numberWeight: 800,
      titleFontSizePt: 23,
      titleWeight: 700,
      topSpacingPt: 62,
      numberToTitleSpacingPt: 10,
      titleToBodySpacingPt: 34,
      dividerWidthPercent: 28
    }
  })
};

const deepFreeze = <T>(value: T): T => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value as Record<string, unknown>).forEach(deepFreeze);
  }
  return value;
};

export const BOOK_TYPOGRAPHY_PRESETS = deepFreeze(presets);

export function cloneTypographyPreset(
  presetId: Exclude<TypographyPresetId, 'custom'>
): BookTypographySettings {
  return structuredClone(BOOK_TYPOGRAPHY_PRESETS[presetId]);
}

export function getLegacyTypography(): BookTypographySettings {
  return cloneTypographyPreset('legacy');
}

export function getDefaultTypography(category: BookCategory): BookTypographySettings {
  return cloneTypographyPreset(category === 'Academic & Textbook' ? 'academic' : 'modern-bold');
}

export function resolveProjectTypography(project: Pick<BookProject, 'typography'>): BookTypographySettings {
  if (!project.typography) return getLegacyTypography();
  const legacy = getLegacyTypography();
  return {
    ...structuredClone(project.typography),
    paragraphs: {...legacy.paragraphs, ...structuredClone(project.typography.paragraphs)}
  };
}

export function markTypographyCustom(
  typography: BookTypographySettings,
  update: (draft: BookTypographySettings) => void
): BookTypographySettings {
  const draft = structuredClone(typography);
  update(draft);
  draft.presetId = 'custom';
  return draft;
}

const trimScale: Record<TrimSize, number> = {
  A4: 1.08,
  '8.5x11': 1.06,
  Legal: 1.06,
  '6x9': 1,
  A5: 0.94,
  '5x8': 0.91
};

export function getEffectiveTypography(input: {
  typography: BookTypographySettings;
  pageSize: TrimSize;
  orientation?: PageOrientation;
}): BookTypographySettings {
  if (input.typography.presetId === 'legacy') return structuredClone(input.typography);
  const scale = trimScale[input.pageSize] * (input.orientation === 'landscape' ? 0.96 : 1);
  const bounded = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, Math.round(value * scale * 10) / 10));
  const result = structuredClone(input.typography);
  result.body.fontSizePt = bounded(result.body.fontSizePt, 9, 14);
  result.chapterOpening.numberFontSizePt = bounded(result.chapterOpening.numberFontSizePt, 12, 38);
  result.chapterOpening.titleFontSizePt = bounded(result.chapterOpening.titleFontSizePt, 14, 28);
  result.chapterOpening.subtitleFontSizePt = bounded(result.chapterOpening.subtitleFontSizePt, 9, 16);
  result.continuation.fontSizePt = bounded(result.continuation.fontSizePt, 8, 12);
  return result;
}

export function resolveRunningHeaderText(
  source: BookTypographySettings['runningHeaders']['oddPageSource'],
  project: Pick<BookProject, 'title' | 'author'>,
  chapterLabel: string,
  customText = ''
): string {
  if (source === 'book-title') return project.title;
  if (source === 'author') return project.author;
  if (source === 'custom') return customText;
  return chapterLabel;
}
