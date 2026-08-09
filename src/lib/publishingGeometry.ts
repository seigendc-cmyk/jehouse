import { ExportSettings, PageOrientation, TrimSize } from '../types';

export const DEFAULT_PRINT_BLEED_INCHES = 0.125;
export const DEFAULT_PRINT_DPI = 300;

export const TRIM_DIMENSIONS_INCHES: Record<TrimSize, { width: number; height: number }> = {
  '5x8': { width: 5, height: 8 },
  '6x9': { width: 6, height: 9 },
  '8.5x11': { width: 8.5, height: 11 },
  A4: { width: 210 / 25.4, height: 297 / 25.4 },
  A5: { width: 148 / 25.4, height: 210 / 25.4 },
  Legal: { width: 8.5, height: 14 }
};

export type PublishingGeometrySettings = Pick<
  ExportSettings,
  'trimSize' | 'bleedInches' | 'printDpi' | 'trimWidthInches' | 'trimHeightInches'
>;

const finiteInRange = (value: unknown, fallback: number, min: number, max: number) =>
  typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;

export function getTrimDimensionsInches(trimSize: TrimSize | string) {
  const known = TRIM_DIMENSIONS_INCHES[trimSize as TrimSize];
  if (known) return known;
  const custom = /^\s*(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)\s*$/i.exec(String(trimSize));
  if (custom) return { width: Number(custom[1]), height: Number(custom[2]) };
  return TRIM_DIMENSIONS_INCHES['6x9'];
}

export function resolvePublishingGeometry(settings: PublishingGeometrySettings) {
  const standard = getTrimDimensionsInches(settings.trimSize);
  const trimWidthInches = finiteInRange(settings.trimWidthInches, standard.width, 1, 100);
  const trimHeightInches = finiteInRange(settings.trimHeightInches, standard.height, 1, 100);
  const bleedInches = finiteInRange(settings.bleedInches, DEFAULT_PRINT_BLEED_INCHES, 0, 1);
  const dpi = finiteInRange(settings.printDpi, DEFAULT_PRINT_DPI, 72, 1200);
  return {
    trimWidthInches,
    trimHeightInches,
    bleedInches,
    dpi,
    requiredWidth: Math.round((trimWidthInches + bleedInches * 2) * dpi),
    requiredHeight: Math.round((trimHeightInches + bleedInches * 2) * dpi)
  };
}

export function normalizePublishingGeometrySettings<T extends PublishingGeometrySettings>(settings: T): T {
  const geometry = resolvePublishingGeometry(settings);
  return {
    ...settings,
    bleedInches: geometry.bleedInches,
    printDpi: geometry.dpi,
    ...(settings.trimWidthInches === undefined ? {} : { trimWidthInches: geometry.trimWidthInches }),
    ...(settings.trimHeightInches === undefined ? {} : { trimHeightInches: geometry.trimHeightInches })
  };
}

export function pageSizeCss(settings: PublishingGeometrySettings, orientation: PageOrientation = 'portrait') {
  const geometry = resolvePublishingGeometry(settings);
  const width = orientation === 'landscape' ? geometry.trimHeightInches : geometry.trimWidthInches;
  const height = orientation === 'landscape' ? geometry.trimWidthInches : geometry.trimHeightInches;
  return `${width}in ${height}in`;
}
