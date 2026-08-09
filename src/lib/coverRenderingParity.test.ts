import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');

describe('cover renderer parity', () => {
  it('routes field visibility and artwork appearance through shared helpers', () => {
    const designer = source('../components/CoverEditor.tsx');
    const preview = source('../components/PrintPreviewModal.tsx');
    const exports = source('./exportUtils.ts');
    expect(designer).toContain('showCoverField');
    expect(designer).toContain('coverImageStyle');
    expect(preview).toContain('showCoverField');
    expect(preview).toContain('coverImageStyle');
    expect(exports.match(/showCoverField/g)?.length).toBeGreaterThanOrEqual(10);
    expect(exports.match(/coverImageCss/g)?.length).toBeGreaterThanOrEqual(5);
  });

  it('keeps WebP encoding out of slider and trim-size update handlers', () => {
    const designer = source('../components/CoverEditor.tsx');
    expect(designer.match(/optimizeCoverArtwork/g)?.length).toBe(2);
    expect(designer).toContain('processAndSaveImage(file)');
    expect(designer).toContain("[key]: Number(e.target.value)");
  });
});
