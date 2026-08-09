import { afterEach, describe, expect, it, vi } from 'vitest';
import { createEmptyBookProject } from '../data/createEmptyBookProject';
import {
  classifyCoverSuitability,
  coverImageCss,
  getCoverPrintRequirements,
  normalizeCoverConfig,
  optimizeCoverArtwork,
  planCoverArtworkResize,
  resetCoverImageAppearance,
  showCoverField
} from './coverArtwork';

afterEach(() => vi.unstubAllGlobals());

describe('cover artwork settings', () => {
  it('calculates print dimensions from the selected trim plus bleed', () => {
    expect(getCoverPrintRequirements({ trimSize: '6x9' })).toMatchObject({ width: 1875, height: 2775, dpi: 300 });
    expect(getCoverPrintRequirements({ trimSize: 'A5' })).toMatchObject({ width: 1823, height: 2555, dpi: 300 });
  });

  it('classifies actual pixel coverage without pretending to upscale', () => {
    expect(classifyCoverSuitability(1875, 2775, 1875, 2775)).toBe('Excellent');
    expect(classifyCoverSuitability(1500, 2220, 1875, 2775)).toBe('Good');
    expect(classifyCoverSuitability(900, 1200, 1875, 2775)).toBe('Low Resolution');
  });

  it.each([
    [2000, 3000, 'Excellent'],
    [1998, 3000, 'Good'],
    [1600, 2400, 'Good'],
    [1598, 2400, 'Low Resolution'],
    [2000, 2000, 'Low Resolution']
  ] as const)('uses the limiting dimension at suitability boundaries (%i × %i)', (width, height, expected) => {
    expect(classifyCoverSuitability(width, height, 2000, 3000)).toBe(expected);
  });

  it('resizes only beyond the 25% threshold, preserves aspect ratio, and never upscales', () => {
    expect(planCoverArtworkResize(2500, 3750, 2000, 3000)).toMatchObject({ width: 2500, height: 3750, resized: false });
    expect(planCoverArtworkResize(2501, 3751, 2000, 3000)).toMatchObject({ width: 2000, height: 3000, resized: true });
    expect(planCoverArtworkResize(800, 1200, 2000, 3000)).toMatchObject({ width: 800, height: 1200, resized: false, scale: 1 });
    const wide = planCoverArtworkResize(6000, 4000, 2000, 3000);
    expect(wide.width / wide.height).toBeCloseTo(1.5, 3);
    expect(wide.height).toBe(3000);
  });

  it('keeps brightness, contrast and opacity independent', () => {
    const cover = { ...createEmptyBookProject().cover, imageBrightness: 125, imageContrast: 110, imageOpacity: 70 };
    expect(coverImageCss(cover)).toContain('opacity: 0.7');
    expect(coverImageCss(cover)).toContain('brightness(125%)');
    expect(coverImageCss(cover)).toContain('contrast(110%)');
  });

  it('uses backward-compatible typography defaults and honors the master switch', () => {
    const legacy = normalizeCoverConfig(createEmptyBookProject().cover);
    expect(showCoverField(legacy, 'title')).toBe(true);
    expect(showCoverField(legacy, 'series')).toBe(false);
    expect(showCoverField(legacy, 'imprint')).toBe(false);
    expect(showCoverField({ ...legacy, showBookDetails: false }, 'title')).toBe(false);
  });

  it('clamps malformed persisted appearance settings and drops unusable metadata', () => {
    const cover = normalizeCoverConfig({
      ...createEmptyBookProject().cover,
      imageBrightness: -1,
      imageContrast: 999,
      imageOpacity: Number.NaN,
      imageQuality: 101,
      artworkAsset: { width: 0 } as never
    });
    expect(cover).toMatchObject({ imageBrightness: 50, imageContrast: 140, imageOpacity: 90, imageQuality: 100 });
    expect(cover.artworkAsset).toBeUndefined();
  });

  it('resets appearance without clearing artwork or child typography choices', () => {
    const cover = { ...createEmptyBookProject().cover, artworkUrl: 'data:image/webp;base64,abc', showSubtitle: false, imageBrightness: 125, imageContrast: 110, imageOpacity: 70 };
    expect(resetCoverImageAppearance(cover)).toMatchObject({ artworkUrl: cover.artworkUrl, showSubtitle: false, imageBrightness: 100, imageContrast: 100, imageOpacity: 100 });
  });

  it.each(['image/jpeg', 'image/png', 'image/webp'])('decodes %s with EXIF orientation and records real output metadata', async (type) => {
    const close = vi.fn();
    const drawImage = vi.fn();
    const toBlob = vi.fn((callback: BlobCallback, outputType: string, quality: number) => {
      expect(outputType).toBe('image/webp');
      expect(quality).toBe(0.88);
      callback(new Blob(['encoded-webp'], { type: outputType }));
    });
    const createImageBitmapMock = vi.fn(async () => ({ width: 4000, height: 6000, close }));
    vi.stubGlobal('createImageBitmap', createImageBitmapMock);
    vi.stubGlobal('document', { createElement: () => ({ width: 0, height: 0, getContext: () => ({ drawImage, imageSmoothingEnabled: false, imageSmoothingQuality: 'low' }), toBlob }) });
    const file = { name: `cover.${type.split('/')[1]}`, type, size: 4_800_000 } as File;
    const result = await optimizeCoverArtwork(file, { trimSize: '6x9' });
    expect(createImageBitmapMock).toHaveBeenCalledWith(file, { imageOrientation: 'from-image' });
    expect(drawImage).toHaveBeenCalled();
    expect(close).toHaveBeenCalled();
    expect(result.artworkAsset).toMatchObject({ originalFormat: type, originalSizeBytes: 4_800_000, optimizedSizeBytes: 12, format: 'webp', quality: 88, resized: true });
    expect(result.artworkAsset.width / result.artworkAsset.height).toBeCloseTo(2 / 3, 3);
  });

  it('rejects corrupt raster input with a stable message', async () => {
    vi.stubGlobal('createImageBitmap', vi.fn(async () => { throw new Error('decode failed'); }));
    await expect(optimizeCoverArtwork({ name: 'bad.jpg', type: 'image/jpeg', size: 12 } as File, { trimSize: '6x9' }))
      .rejects.toThrow('not a valid supported raster image');
  });

  it('preserves a transparent PNG canvas by never painting an opaque background', async () => {
    const fillRect = vi.fn();
    vi.stubGlobal('createImageBitmap', vi.fn(async () => ({ width: 1000, height: 1500, close: vi.fn() })));
    vi.stubGlobal('document', { createElement: () => ({
      width: 0,
      height: 0,
      getContext: () => ({ drawImage: vi.fn(), fillRect, imageSmoothingEnabled: false, imageSmoothingQuality: 'low' }),
      toBlob: (callback: BlobCallback) => callback(new Blob(['alpha-webp'], { type: 'image/webp' }))
    }) });
    await optimizeCoverArtwork({ name: 'transparent.png', type: 'image/png', size: 1200 } as File, { trimSize: '6x9' });
    expect(fillRect).not.toHaveBeenCalled();
  });

  it('fails safely instead of allocating an unsafe canvas when automatic resizing is disabled', async () => {
    const close = vi.fn();
    vi.stubGlobal('createImageBitmap', vi.fn(async () => ({ width: 20_000, height: 20_000, close })));
    await expect(optimizeCoverArtwork({ name: 'huge.webp', type: 'image/webp', size: 1 } as File, { trimSize: '6x9' }, { automaticResize: false }))
      .rejects.toThrow('too large to encode safely');
    expect(close).toHaveBeenCalled();
  });
});
