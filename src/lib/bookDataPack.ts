import { BookProject } from '../types';
import { runPublishingPreflight } from './publishingPreflight';

export const BOOK_DATA_PACK_SCHEMA_VERSION = '2.0.0';
export const MINIMUM_OFFLINE_SHELL_VERSION = '2.0.0';

export function validateBookDataPackCompatibility(
  value: unknown,
  shellVersion = MINIMUM_OFFLINE_SHELL_VERSION
): { compatible: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!value || typeof value !== 'object') return { compatible: false, errors: ['Data pack must be an object.'] };
  const pack = value as { schemaVersion?: string; minimumShellVersion?: string; projectData?: unknown };
  if (pack.schemaVersion !== BOOK_DATA_PACK_SCHEMA_VERSION) errors.push(`Unsupported data-pack schema ${pack.schemaVersion ?? 'missing'}.`);
  if (!pack.projectData || typeof pack.projectData !== 'object') errors.push('Data pack has no semantic projectData payload.');
  const requiredMajor = Number(pack.minimumShellVersion?.split('.')[0] ?? NaN);
  const shellMajor = Number(shellVersion.split('.')[0]);
  if (!Number.isFinite(requiredMajor) || shellMajor < requiredMajor) errors.push(`Offline shell ${shellVersion} is older than required ${pack.minimumShellVersion ?? 'unknown'}.`);
  return { compatible: errors.length === 0, errors };
}

export function createBookDataPack(project: BookProject) {
  const preflight = runPublishingPreflight(project);
  const canonicalProject = JSON.stringify(project);
  let checksum = 2166136261;
  for (let index = 0; index < canonicalProject.length; index += 1) {
    checksum ^= canonicalProject.charCodeAt(index);
    checksum = Math.imul(checksum, 16777619);
  }
  return {
    schemaVersion: BOOK_DATA_PACK_SCHEMA_VERSION,
    minimumShellVersion: MINIMUM_OFFLINE_SHELL_VERSION,
    exportedAt: new Date().toISOString(),
    checksum: (checksum >>> 0).toString(16).padStart(8, '0'),
    metadata: {
      id: project.id,
      title: project.title,
      subtitle: project.subtitle,
      author: project.author,
      category: project.category,
      isbn: project.frontMatter.isbn,
      publisher: project.frontMatter.publisher
    },
    rendering: {
      mathematics: {
        renderer: 'katex',
        sourceFormat: 'latex',
        runtime: 'shell-bundled',
        networkRequired: false
      },
      typography: project.typography,
      colours: project.colourSettings,
      accountingFormat: project.accountingFormat
    },
    navigation: project.chapters.map((chapter) => ({ id: chapter.id, number: chapter.number, title: chapter.title })),
    searchIndex: project.chapters.flatMap((chapter) =>
      chapter.blocks.map((block) => ({
        chapterId: chapter.id,
        blockId: block.id,
        text: [block.text, block.mathData?.accessibilityText].filter(Boolean).join(' ')
      }))
    ),
    requiredAssets: {
      localFonts: ['KaTeX_Main-Regular.woff2', 'KaTeX_Math-Italic.woff2'],
      mathRuntime: 'bundled-with-shell',
      projectAssets: project.assets ?? []
    },
    preflight,
    projectData: project
  };
}
