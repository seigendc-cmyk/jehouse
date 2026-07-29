export type DocumentWorkspace =
  | 'editor'
  | 'cover'
  | 'frontmatter'
  | 'watermark'
  | 'exportSettings';

const WORKSPACE_LABELS: Record<Exclude<DocumentWorkspace, 'editor'>, string> = {
  cover: 'Cover Studio',
  frontmatter: 'Front Matter',
  watermark: 'Watermark',
  exportSettings: 'Export Settings'
};

export function getChapterDisplayLabel(chapterNumber: number, storedTitle?: string): string {
  return getChapterDisplayParts(chapterNumber, storedTitle).combinedLabel;
}

export interface ChapterDisplayParts {
  numberLabel: string;
  titleLabel: string;
  combinedLabel: string;
}

export function getChapterDisplayParts(
  chapterNumber: number,
  storedTitle?: string
): ChapterDisplayParts {
  const prefix = `Chapter ${chapterNumber}`;
  const title = storedTitle?.trim() ?? '';
  if (!title || title.toLowerCase() === prefix.toLowerCase()) {
    return { numberLabel: prefix, titleLabel: '', combinedLabel: prefix };
  }

  const prefixedTitle = title.match(
    new RegExp(`^Chapter ${chapterNumber}\\s*[:—-]\\s*(.+)$`, 'i')
  );
  if (prefixedTitle) {
    return {
      numberLabel: prefix,
      titleLabel: prefixedTitle[1].trim(),
      combinedLabel: title
    };
  }

  return {
    numberLabel: prefix,
    titleLabel: title,
    combinedLabel: `${prefix} — ${title}`
  };
}

export function chapterTitleIncludesNumber(chapterNumber: number, storedTitle?: string): boolean {
  const title = storedTitle?.trim() ?? '';
  return new RegExp(`^Chapter ${chapterNumber}(?:\\s*[:—-].*)?$`, 'i').test(title);
}

export function getDocumentDisplayLabel({
  workspace,
  chapterNumber,
  chapterTitle,
  episodeNumber,
  episodeTitle
}: {
  workspace: DocumentWorkspace;
  chapterNumber?: number;
  chapterTitle?: string;
  episodeNumber?: number;
  episodeTitle?: string;
}): string | undefined {
  if (workspace !== 'editor') return WORKSPACE_LABELS[workspace];
  if (episodeNumber) {
    const prefix = `Episode ${episodeNumber}`;
    const title = (episodeTitle || chapterTitle || '').trim();
    return !title || title.toLowerCase().startsWith(prefix.toLowerCase())
      ? title || prefix
      : `${prefix} — ${title}`;
  }
  return chapterNumber === undefined
    ? undefined
    : getChapterDisplayLabel(chapterNumber, chapterTitle);
}
