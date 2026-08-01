import { describe, expect, it } from 'vitest';
import {
  createMathAccountingBlock,
  INSERT_MATH_ACCOUNTING_COMMANDS,
  MATH_ACCOUNTING_COMMAND_LABELS
} from './workspaceCommands';

describe('author mathematics and accounting commands', () => {
  it('defines every requested command label', () => {
    expect(Object.values(MATH_ACCOUNTING_COMMAND_LABELS)).toEqual([
      'Paste Worked Problem',
      'Insert Inline Equation',
      'Insert Display Equation',
      'Insert Aligned Working',
      'Insert Boxed Answer',
      'Insert Formula',
      'Insert Journal Entry',
      'Insert Ledger',
      'Insert Trial Balance',
      'Insert Financial Statement',
      'Validate Current Block',
      'Run Chapter Preflight',
      'Preview Print Layout'
    ]);
  });

  it('creates authoritative editable blocks without generated HTML', () => {
    const blocks = [...INSERT_MATH_ACCOUNTING_COMMANDS].map((command, index) =>
      createMathAccountingBlock(command, `block-${index}`)!
    );
    expect(blocks.map((block) => block.type)).toEqual([
      'math-inline', 'math-display', 'math-aligned', 'math-display', 'formula',
      'journal-entry', 'ledger', 'trial-balance', 'financial-statement'
    ]);
    expect(blocks.every((block) => !('html' in block))).toBe(true);
    expect(blocks.find((block) => block.type === 'math-aligned')?.mathData?.source).toContain('\\begin{aligned}');
    expect(blocks.find((block) => block.semanticRole === 'answer')?.latexFormula).toBe('\\boxed{x = 3}');
    expect(blocks.find((block) => block.type === 'journal-entry')?.journalEntryData?.entries).toHaveLength(1);
  });
});
