import { describe, expect, it } from 'vitest';
import { normalizeEducationalPaste } from './educationalPaste';
import { FormattingHistoryController } from './formattingHistory';
import { createEmptyBookProject } from '../data/createEmptyBookProject';

const algebraSample = `## Problem 1: Algebraic Equations

Solve for x:

\` \\frac{3x-2}{4}+\\frac{x+1}{2}=6 \`

### Step 1: Find the lowest common denominator

The denominators are 4 and 2.

\` \\text{LCM}=4 \`

### Step 2: Simplify

\` 3x-2+2(x+1)=24 \`

Therefore:

\` \\boxed{x=4.8} \``;

describe('educational paste normalization', () => {
  it('structures the supplied algebra problem without changing its mathematical source', () => {
    let id = 0;
    const result = normalizeEducationalPaste(algebraSample, () => `block-${++id}`);
    expect(result.blocks[0]).toMatchObject({ type: 'worked-example', problemNumber: '1', text: 'Problem 1: Algebraic Equations' });
    expect(result.blocks.some((block) => block.type === 'solution-step' && block.stepNumber === '1')).toBe(true);
    expect(result.blocks.filter((block) => block.type === 'math-display')).toHaveLength(4);
    expect(result.blocks.find((block) => block.mathData?.source.includes('\\frac{3x-2}{4}'))?.mathData?.source)
      .toBe('\\frac{3x-2}{4}+\\frac{x+1}{2}=6');
    expect(result.originalSource).toBe(algebraSample);
  });

  it('keeps ordinary backtick code as code and confidently detects inline mathematics', () => {
    const result = normalizeEducationalPaste('Run `console.log(x);`, solve for `x`, and simplify `x^2 + 2x + 1`.');
    expect(result.blocks.some((block) => block.type === 'code' && block.codeSnippet === 'console.log(x);')).toBe(true);
    expect(result.blocks.some((block) => block.type === 'math-inline' && block.mathData?.source === 'x')).toBe(true);
    expect(result.blocks.some((block) => block.type === 'math-inline' && block.mathData?.source === 'x^2 + 2x + 1')).toBe(true);
  });

  it('retains Markdown heading hierarchy and separate adjacent display equations', () => {
    const result = normalizeEducationalPaste('# Unit\n#### Note\n`\\sqrt{x}`\n`\\sum_{i=1}^{n}i`');
    expect(result.blocks.map((block) => block.type)).toEqual(['heading', 'clause', 'math-display', 'math-display']);
  });

  it('flags missing educational values without inventing them', () => {
    const source = 'Solve for:\nThe denominators are.\nMultiply every term by:\nDivide both sides by.';
    const result = normalizeEducationalPaste(source);
    expect(result.warnings.map((warning) => warning.message)).toEqual([
      'Possible missing variable after “Solve for”.',
      'Possible missing values after “The denominators are”.',
      'Possible missing multiplier after “Multiply every term by”.',
      'Possible missing divisor after “Divide both sides by”.'
    ]);
    expect(result.blocks.map((block) => block.text).join('\n')).toBe(source);
  });

  it('imports a Markdown journal as editable structured rows', () => {
    const result = normalizeEducationalPaste('| Date | Details | Folio | Debit | Credit |\n| --- | --- | --- | ---: | ---: |\n| 2026-01-01 | Cash | J1 | 100 | |\n| 2026-01-01 | Capital | J1 | | 100 |');
    expect(result.blocks).toHaveLength(1);
    expect(result.blocks[0].type).toBe('journal-entry');
    expect(result.blocks[0].journalEntryData?.entries[0]).toMatchObject({ details: 'Cash', debit: 100 });
  });

  it('imports Markdown lists as shared structural metadata with marker-free text', () => {
    const result = normalizeEducationalPaste('3. Third\n4. Fourth\n  - Nested');
    expect(result.blocks.map(block => block.text)).toEqual(['Third', 'Fourth', 'Nested']);
    expect(result.blocks[0].listFormatting).toMatchObject({ type: 'ordered', startAt: 3, restart: true });
    expect(result.blocks[1].listFormatting?.listId).toBe(result.blocks[0].listFormatting?.listId);
    expect(result.blocks[2].listFormatting).toMatchObject({ type: 'unordered', level: 1 });
  });

  it('records the complete transformation as one undoable editor transaction', () => {
    const project = createEmptyBookProject();
    const before = project;
    const pasted = normalizeEducationalPaste(algebraSample).blocks;
    const after = { ...project, chapters: [{ ...project.chapters[0], blocks: [...project.chapters[0].blocks, ...pasted] }] };
    const history = new FormattingHistoryController();
    expect(history.execute({ label: 'Paste structured educational content', scope: 'structure', before, after })).toBe(true);
    expect(history.undo()?.project).toEqual(before);
  });
});
