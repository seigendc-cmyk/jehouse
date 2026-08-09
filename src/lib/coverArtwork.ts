import { CoverArtworkAssetInfo, CoverConfig, CoverPrintSuitability } from '../types';
import { PublishingGeometrySettings, resolvePublishingGeometry } from './publishingGeometry';

export const DEFAULT_COVER_IMAGE_OPACITY = 90;
export const DEFAULT_COVER_IMAGE_QUALITY = 88;
const MAX_SAFE_CANVAS_DIMENSION = 16_384;
const MAX_SAFE_CANVAS_PIXELS = 100_000_000;

const clamp = (value: unknown, fallback: number, min: number, max: number) =>
  typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;

const bool = (value: unknown, fallback: boolean) => typeof value === 'boolean' ? value : fallback;
export function getCoverPrintRequirements(settings: PublishingGeometrySettings) {
  const geometry = resolvePublishingGeometry(settings);
  return {
    width: geometry.requiredWidth,
    height: geometry.requiredHeight,
    bleedInches: geometry.bleedInches,
    dpi: geometry.dpi
  };
}

export function classifyCoverSuitability(
  width: number,
  height: number,
  requiredWidth: number,
  requiredHeight: number
): CoverPrintSuitability {
  if (![width, height, requiredWidth, requiredHeight].every((value) => Number.isFinite(value) && value > 0)) {
    return 'Low Resolution';
  }
  const coverage = Math.min(width / requiredWidth, height / requiredHeight);
  if (coverage >= 1) return 'Excellent';
  if (coverage >= 0.8) return 'Good';
  return 'Low Resolution';
}

export function planCoverArtworkResize(
  sourceWidth: number,
  sourceHeight: number,
  requiredWidth: number,
  requiredHeight: number,
  automaticResize = true
) {
  if (![sourceWidth, sourceHeight, requiredWidth, requiredHeight].every((value) => Number.isFinite(value) && value > 0)) {
    throw new Error('Cover artwork dimensions are invalid.');
  }
  const resized = automaticResize
    && sourceWidth > requiredWidth * 1.25
    && sourceHeight > requiredHeight * 1.25;
  const scale = resized ? Math.max(requiredWidth / sourceWidth, requiredHeight / sourceHeight) : 1;
  return {
    width: Math.round(sourceWidth * scale),
    height: Math.round(sourceHeight * scale),
    resized,
    scale
  };
}

export async function optimizeCoverArtwork(
  file: File,
  settings: PublishingGeometrySettings,
  options: { quality?: number; automaticResize?: boolean } = {}
) {
  const required = getCoverPrintRequirements(settings);
  const quality = clamp(options.quality, DEFAULT_COVER_IMAGE_QUALITY, 70, 100);
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    throw new Error('The selected file is not a valid supported raster image.');
  }
  try {
    const plan = planCoverArtworkResize(bitmap.width, bitmap.height, required.width, required.height, options.automaticResize ?? true);
    if (plan.width > MAX_SAFE_CANVAS_DIMENSION || plan.height > MAX_SAFE_CANVAS_DIMENSION || plan.width * plan.height > MAX_SAFE_CANVAS_PIXELS) {
      throw new Error('Artwork is too large to encode safely. Enable automatic optimization or use a smaller source image.');
    }
    const canvas = document.createElement('canvas');
    canvas.width = plan.width;
    canvas.height = plan.height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('This browser cannot process cover artwork.');
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(bitmap, 0, 0, plan.width, plan.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', quality / 100));
    if (!blob || blob.type !== 'image/webp') throw new Error('WebP encoding is not supported in this browser.');
    const artworkAsset: CoverArtworkAssetInfo = {
      originalName: file.name,
      originalFormat: file.type || 'image',
      originalSizeBytes: file.size,
      optimizedSizeBytes: blob.size,
      width: plan.width,
      height: plan.height,
      requiredWidth: required.width,
      requiredHeight: required.height,
      quality,
      format: 'webp',
      suitability: classifyCoverSuitability(plan.width, plan.height, required.width, required.height),
      resized: plan.resized
    };
    return { blob, artworkAsset };
  } finally {
    bitmap.close();
  }
}

export function coverImageStyle(cover: CoverConfig) {
  const normalized = normalizeCoverConfig(cover);
  return {
    opacity: normalized.imageOpacity! / 100,
    filter: `brightness(${normalized.imageBrightness}%) contrast(${normalized.imageContrast}%)`
  };
}

export function coverImageCss(cover: CoverConfig): string {
  const style = coverImageStyle(cover);
  return `opacity: ${style.opacity}; filter: ${style.filter};`;
}

export function showCoverField(
  cover: CoverConfig,
  field: 'title' | 'subtitle' | 'author' | 'series' | 'imprint'
): boolean {
  if (cover.showBookDetails === false) return false;
  const setting = {
    title: cover.showTitle,
    subtitle: cover.showSubtitle,
    author: cover.showAuthor,
    series: cover.showSeries,
    imprint: cover.showImprint
  }[field];
  return setting ?? (field === 'title' || field === 'subtitle' || field === 'author');
}

export function resetCoverImageAppearance(cover: CoverConfig): CoverConfig {
  return { ...cover, imageBrightness: 100, imageContrast: 100, imageOpacity: 100 };
}

function normalizeArtworkAsset(value: unknown): CoverArtworkAssetInfo | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const asset = value as Partial<CoverArtworkAssetInfo>;
  if (![asset.originalSizeBytes, asset.optimizedSizeBytes, asset.width, asset.height].every((item) => typeof item === 'number' && Number.isFinite(item) && item >= 0)) return undefined;
  if (asset.width! <= 0 || asset.height! <= 0) return undefined;
  const requiredWidth = clamp(asset.requiredWidth, 1, 1, Number.MAX_SAFE_INTEGER);
  const requiredHeight = clamp(asset.requiredHeight, 1, 1, Number.MAX_SAFE_INTEGER);
  return {
    originalName: typeof asset.originalName === 'string' ? asset.originalName : 'cover-artwork',
    originalFormat: typeof asset.originalFormat === 'string' ? asset.originalFormat : 'image',
    originalSizeBytes: asset.originalSizeBytes!,
    optimizedSizeBytes: asset.optimizedSizeBytes!,
    width: asset.width!,
    height: asset.height!,
    requiredWidth,
    requiredHeight,
    quality: clamp(asset.quality, DEFAULT_COVER_IMAGE_QUALITY, 70, 100),
    format: 'webp',
    suitability: classifyCoverSuitability(asset.width!, asset.height!, requiredWidth, requiredHeight),
    resized: bool(asset.resized, false)
  };
}

export function normalizeCoverConfig(
  value: Partial<CoverConfig> | null | undefined,
  metadata: { title?: string; subtitle?: string; author?: string; publisher?: string } = {}
): CoverConfig {
  const cover = value ?? {};
  return {
    ...cover,
    title: typeof cover.title === 'string' ? cover.title : metadata.title ?? '',
    subtitle: typeof cover.subtitle === 'string' ? cover.subtitle : metadata.subtitle ?? '',
    author: typeof cover.author === 'string' ? cover.author : metadata.author ?? '',
    publisher: typeof cover.publisher === 'string' ? cover.publisher : metadata.publisher ?? '',
    coverBgColor: typeof cover.coverBgColor === 'string' ? cover.coverBgColor : '#EA580C',
    textColor: typeof cover.textColor === 'string' ? cover.textColor : '#FFFFFF',
    accentColor: typeof cover.accentColor === 'string' ? cover.accentColor : '#C2410C',
    spineWidthMm: clamp(cover.spineWidthMm, 12, 0, 100),
    backBlurb: typeof cover.backBlurb === 'string' ? cover.backBlurb : '',
    artworkUrl: typeof cover.artworkUrl === 'string' ? cover.artworkUrl : undefined,
    artworkPrompt: typeof cover.artworkPrompt === 'string' ? cover.artworkPrompt : undefined,
    layoutStyle: ['centered', 'modern-minimal', 'bold-editorial', 'classic-frame'].includes(String(cover.layoutStyle))
      ? cover.layoutStyle as CoverConfig['layoutStyle']
      : 'modern-minimal',
    showBookDetails: bool(cover.showBookDetails, true),
    showTitle: bool(cover.showTitle, true),
    showSubtitle: bool(cover.showSubtitle, true),
    showAuthor: bool(cover.showAuthor, true),
    showSeries: bool(cover.showSeries, false),
    showImprint: bool(cover.showImprint, false),
    fullBleedImage: bool(cover.fullBleedImage, false),
    imageOpacity: clamp(cover.imageOpacity, DEFAULT_COVER_IMAGE_OPACITY, 40, 100),
    imageBrightness: clamp(cover.imageBrightness, 100, 50, 160),
    imageContrast: clamp(cover.imageContrast, 100, 70, 140),
    imageFormat: 'webp',
    imageQuality: clamp(cover.imageQuality, DEFAULT_COVER_IMAGE_QUALITY, 70, 100),
    optimizeArtworkAutomatically: bool(cover.optimizeArtworkAutomatically, true),
    artworkAsset: normalizeArtworkAsset(cover.artworkAsset)
  };
}
