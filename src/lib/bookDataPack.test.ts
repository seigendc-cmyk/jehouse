import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createEmptyBookProject } from '../data/createEmptyBookProject';
import { createBookDataPack, validateBookDataPackCompatibility } from './bookDataPack';
import { createMathData } from './mathValidation';
import { runPublishingPreflight } from './publishingPreflight';

describe('mathematics-aware publishing data pack and export readiness', () => {
  it('retains semantic LaTeX, accounting settings, checksums, accessibility, and offline renderer metadata', () => {
    const project = createEmptyBookProject();
    project.chapters[0].blocks = [{
      id: 'math-1',
      type: 'math-display',
      text: '`\\boxed{x=4}`',
      latexFormula: '\\boxed{x=4}',
      mathData: createMathData('\\boxed{x=4}', 'display', { accessibilityText: 'x equals four' })
    }];
    const pack = createBookDataPack(project);
    expect(pack.schemaVersion).toBe('2.0.0');
    expect(pack.rendering.mathematics).toMatchObject({ renderer: 'katex', sourceFormat: 'latex', networkRequired: false });
    expect(pack.projectData.chapters[0].blocks[0].mathData?.source).toBe('\\boxed{x=4}');
    expect(pack.searchIndex[0].text).toContain('x equals four');
    expect(pack.checksum).toMatch(/^[a-f0-9]{8}$/);
  });

  it('blocks invalid mathematics by default and reports the affected block', () => {
    const project = createEmptyBookProject();
    project.chapters[0].blocks = [{ id: 'bad', type: 'math-display', text: '\\frac{', mathData: createMathData('\\frac{', 'display') }];
    const report = runPublishingPreflight(project);
    expect(report.valid).toBe(false);
    expect(report.issues.find((issue) => issue.code === 'invalid-math')).toMatchObject({ blockId: 'bad', severity: 'error' });
  });

  it('rejects unsupported data-pack schemas and shell versions explicitly', () => {
    expect(validateBookDataPackCompatibility({ schemaVersion: '99.0.0', minimumShellVersion: '3.0.0', projectData: {} }, '2.0.0')).toEqual({
      compatible: false,
      errors: ['Unsupported data-pack schema 99.0.0.', 'Offline shell 2.0.0 is older than required 3.0.0.']
    });
  });

  it('waits for fonts and stable animation frames before print capture and has no remote KaTeX dependency', () => {
    const source = readFileSync(new URL('./exportUtils.ts', import.meta.url), 'utf8');
    const educationalSource = readFileSync(new URL('../educationalBooks/generatorUtils.ts', import.meta.url), 'utf8');
    expect(source).toContain('document.fonts && document.fonts.ready');
    expect(source).toContain('requestAnimationFrame');
    expect(source).toContain("output: 'mathml'");
    expect(source).not.toContain('cdn.jsdelivr.net/npm/katex');
    expect(educationalSource).not.toContain('cdn.jsdelivr.net/npm/katex');
    expect(educationalSource).not.toContain('window.katex');
  });
});
