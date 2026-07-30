import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AccountingBlock } from '../components/blocks/AccountingBlock';
import { DEFAULT_ACCOUNTING_FORMAT, formatAccountingNumber, journalTotals, ledgerTotals, trialBalanceTotals } from './accounting';

describe('accounting publishing structures', () => {
  const balancedJournal = {
    entries: [
      { id: '1', date: '2026-01-01', details: 'Cash', debit: 1250 },
      { id: '2', date: '2026-01-01', details: 'Capital', credit: 1250 }
    ],
    validateBalance: true
  };

  it('validates balanced and unbalanced journals', () => {
    expect(journalTotals(balancedJournal).balanced).toBe(true);
    expect(journalTotals({ ...balancedJournal, entries: [{ ...balancedJournal.entries[0], debit: 1300 }, balancedJournal.entries[1]] }).difference).toBe(50);
  });

  it('validates trial-balance equality and differences', () => {
    const data = { rows: [{ id: '1', accountName: 'Cash', debit: 500 }, { id: '2', accountName: 'Capital', credit: 450 }], validateEquality: true };
    expect(trialBalanceTotals(data)).toMatchObject({ debit: 500, credit: 450, difference: 50, balanced: false });
    expect(trialBalanceTotals({ ...data, rows: [{ ...data.rows[0], debit: 450 }, data.rows[1]] }).balanced).toBe(true);
  });

  it('calculates legacy ledger totals without rasterizing the table', () => {
    expect(ledgerTotals([
      { date: '2026-01-01', account: 'Cash', debit: '$1,000.00', credit: '' },
      { date: '2026-01-02', account: 'Bank', debit: '', credit: '$250.00' }
    ])).toEqual({ debit: 1000, credit: 250, balance: 750 });
  });

  it('formats currency, negative values, zeroes, and decimal precision', () => {
    expect(formatAccountingNumber(1250, DEFAULT_ACCOUNTING_FORMAT)).toBe('$1,250.00');
    expect(formatAccountingNumber(-350, DEFAULT_ACCOUNTING_FORMAT)).toBe('($350.00)');
    expect(formatAccountingNumber(0, DEFAULT_ACCOUNTING_FORMAT)).toBe('—');
    expect(formatAccountingNumber(12.5, { ...DEFAULT_ACCOUNTING_FORMAT, currency: 'EUR', decimalPlaces: 3 })).toBe('€12.500');
  });

  it('renders professional semantic journal and financial-statement tables', () => {
    const journalHtml = renderToStaticMarkup(<AccountingBlock block={{ id: 'j', type: 'journal-entry', text: '', journalEntryData: balancedJournal }} readOnly />);
    const statementHtml = renderToStaticMarkup(<AccountingBlock block={{ id: 's', type: 'financial-statement', text: '', financialStatementData: { statementType: 'profit-or-loss', rows: [{ id: 'r', label: 'Gross profit', amount: 500, emphasis: 'double-total' }] } }} readOnly />);
    expect(journalHtml).toContain('<table');
    expect(journalHtml).toContain('scope="col"');
    expect(statementHtml).toContain('Gross profit');
    expect(statementHtml).toContain('border-double');
  });
});
