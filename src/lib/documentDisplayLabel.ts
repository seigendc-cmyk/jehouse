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
  const prefix = `Chapter ${chapterNumber}`;
  const title = storedTitle?.trim() ?? '';
  if (!title) return prefix;
  if (chapterTitleIncludesNumber(chapterNumber, title)) return title;
  return `${prefix} — ${title}`;
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
