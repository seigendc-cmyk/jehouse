import { describe, expect, it } from 'vitest';
import { createBookDataPack } from '../../src/lib/bookDataPack';
import { journalTotals, trialBalanceTotals } from '../../src/lib/accounting';
import {
  accountingRowsForDocument,
  renderAccountingMarkdown,
  renderMathForExport,
} from '../../src/lib/exportUtils';
import { createMathAccountingQaFixture } from './createMathAccountingQaFixture';

describe('deterministic mathematics and accounting production QA fixture', () => {
  it('has stable identifiers and covers the required semantic publishing cases', () => {
    const project = createMathAccountingQaFixture();
    const blocks = project.chapters.flatMap(chapter => chapter.blocks);
    const ids = blocks.map(block => block.id);

    expect(project.id).toBe('qa-math-accounting-production-fixture-v1');
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual(expect.arrayContaining([
      'qa-math-inline',
      'qa-math-nested-fraction',
      'qa-math-boxed',
      'qa-math-aligned',
      'qa-math-matrix',
      'qa-math-long-width',
      'qa-math-invalid',
      'qa-journal-balanced',
      'qa-journal-unbalanced',
      'qa-accounting-t-account',
      'qa-trial-balanced',
      'qa-trial-unbalanced',
      'qa-profit-loss',
      'qa-financial-position',
      'qa-journal-multipage',
      'qa-offline-search-target',
      'qa-offline-missing-asset',
    ]));
    expect(blocks.find(block => block.id === 'qa-journal-multipage')?.journalEntryData?.entries).toHaveLength(64);
  });

  it('contains both balanced and deliberately unbalanced accounting controls', () => {
    const blocks = createMathAccountingQaFixture().chapters.flatMap(chapter => chapter.blocks);
    const balancedJournal = blocks.find(block => block.id === 'qa-journal-balanced')?.journalEntryData;
    const unbalancedJournal = blocks.find(block => block.id === 'qa-journal-unbalanced')?.journalEntryData;
    const balancedTrial = blocks.find(block => block.id === 'qa-trial-balanced')?.trialBalanceData;
    const unbalancedTrial = blocks.find(block => block.id === 'qa-trial-unbalanced')?.trialBalanceData;

    expect(balancedJournal && journalTotals(balancedJournal).balanced).toBe(true);
    expect(unbalancedJournal && journalTotals(unbalancedJournal).difference).toBe(500);
    expect(balancedTrial && trialBalanceTotals(balancedTrial).balanced).toBe(true);
    expect(unbalancedTrial && trialBalanceTotals(unbalancedTrial).difference).toBe(500);
  });

  it('produces the same semantic checksum on repeated construction', () => {
    const first = createBookDataPack(createMathAccountingQaFixture());
    const second = createBookDataPack(createMathAccountingQaFixture());
    expect(first.checksum).toBe(second.checksum);
    expect(first.navigation).toHaveLength(3);
    expect(first.searchIndex.some(entry => entry.text.includes('Quasar reconciliation'))).toBe(true);
  });

  it('retains structured accounting rows for Markdown and document exports', () => {
    const project = createMathAccountingQaFixture();
    const blocks = project.chapters.flatMap(chapter => chapter.blocks);
    const journal = blocks.find(block => block.id === 'qa-journal-balanced')!;
    const statement = blocks.find(block => block.id === 'qa-profit-loss')!;
    const tAccount = blocks.find(block => block.id === 'qa-accounting-t-account')!;

    expect(renderAccountingMarkdown(journal, project)).toContain('| 2025-01-02 | Bank | B1 | R12,500.00 |');
    expect(renderAccountingMarkdown(statement, project)).toContain('| Profit for the year | R36,875.00 |');
    expect(accountingRowsForDocument(tAccount, project)).toMatchObject({
      title: 'T-account — Bank',
      headers: ['Date', 'Account', 'Debit', 'Credit', 'Notes'],
    });
  });

  it('preserves a visible box around boxed answers in print and PDF markup', () => {
    const project = createMathAccountingQaFixture();
    const boxed = project.chapters
      .flatMap(chapter => chapter.blocks)
      .find(block => block.id === 'qa-math-boxed')!;

    expect(renderMathForExport(boxed, 'visible-warning')).toContain('math-boxed');
  });
});
