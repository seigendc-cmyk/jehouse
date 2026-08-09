import { describe, expect, it } from 'vitest';
import { normalizePublishingGeometrySettings, pageSizeCss, resolvePublishingGeometry } from './publishingGeometry';

describe('canonical publishing geometry', () => {
  it('resolves trim, bleed and DPI from export settings', () => {
    expect(resolvePublishingGeometry({ trimSize: '6x9', bleedInches: 0.25, printDpi: 200 })).toMatchObject({
      trimWidthInches: 6,
      trimHeightInches: 9,
      bleedInches: 0.25,
      dpi: 200,
      requiredWidth: 1300,
      requiredHeight: 1900
    });
  });

  it('supports imported custom geometry without hard-coding a trim', () => {
    expect(resolvePublishingGeometry({ trimSize: '6x9', trimWidthInches: 7, trimHeightInches: 10, bleedInches: 0, printDpi: 300 }))
      .toMatchObject({ requiredWidth: 2100, requiredHeight: 3000 });
    expect(pageSizeCss({ trimSize: '6x9', trimWidthInches: 7, trimHeightInches: 10 }, 'landscape')).toBe('10in 7in');
  });

  it('normalizes invalid imported geometry safely', () => {
    expect(resolvePublishingGeometry({ trimSize: 'A5', bleedInches: -2, printDpi: Number.NaN, trimWidthInches: 0 })).toMatchObject({
      bleedInches: 0,
      dpi: 300,
      trimWidthInches: 1
    });
  });

  it('persists canonical bleed and DPI while retaining optional custom trim semantics', () => {
    expect(normalizePublishingGeometrySettings({ trimSize: '6x9' })).toEqual({ trimSize: '6x9', bleedInches: 0.125, printDpi: 300 });
    expect(normalizePublishingGeometrySettings({ trimSize: '6x9', trimWidthInches: 0 })).toMatchObject({ trimWidthInches: 1 });
  });
});
