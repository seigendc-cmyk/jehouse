import {
  AccountingNumberFormat,
  JournalEntryData,
  LedgerRow,
  TrialBalanceData
} from '../types';

export const DEFAULT_ACCOUNTING_FORMAT: AccountingNumberFormat = {
  currency: 'USD',
  decimalPlaces: 2,
  thousandsSeparator: ',',
  decimalSeparator: '.',
  negativeStyle: 'parentheses',
  zeroDisplay: 'dash',
  currencySymbolPosition: 'before',
  dateFormat: 'YYYY-MM-DD'
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  ZAR: 'R',
  ZWG: 'ZiG',
  BWP: 'P'
};

export function formatAccountingNumber(
  value: number,
  format: AccountingNumberFormat = DEFAULT_ACCOUNTING_FORMAT,
  currencyOverride?: string
): string {
  if (value === 0 && format.zeroDisplay !== 'zero') return format.zeroDisplay === 'dash' ? '—' : '';
  const absolute = Math.abs(value);
  const parts = absolute.toFixed(format.decimalPlaces).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, format.thousandsSeparator);
  const number = parts.length === 2 ? `${parts[0]}${format.decimalSeparator}${parts[1]}` : parts[0];
  const currency = currencyOverride ?? format.currency;
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;
  const signed = format.currencySymbolPosition === 'before' ? `${symbol}${number}` : `${number} ${symbol}`;
  if (value >= 0) return signed;
  return format.negativeStyle === 'parentheses' ? `(${signed})` : `-${signed}`;
}

export function journalTotals(data: JournalEntryData): { debit: number; credit: number; difference: number; balanced: boolean } {
  const debit = data.entries.reduce((sum, entry) => sum + (entry.debit ?? 0), 0);
  const credit = data.entries.reduce((sum, entry) => sum + (entry.credit ?? 0), 0);
  const difference = Number((debit - credit).toFixed(8));
  return { debit, credit, difference, balanced: Math.abs(difference) < 0.000001 };
}

export function trialBalanceTotals(data: TrialBalanceData): { debit: number; credit: number; difference: number; balanced: boolean } {
  const debit = data.rows.reduce((sum, row) => sum + (row.debit ?? 0), 0);
  const credit = data.rows.reduce((sum, row) => sum + (row.credit ?? 0), 0);
  const difference = Number((debit - credit).toFixed(8));
  return { debit, credit, difference, balanced: Math.abs(difference) < 0.000001 };
}

export function ledgerTotals(rows: LedgerRow[]): { debit: number; credit: number; balance: number } {
  const amount = (value: string): number => {
    const parsed = Number(value.replace(/[^\d.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  };
  const debit = rows.reduce((sum, row) => sum + amount(row.debit), 0);
  const credit = rows.reduce((sum, row) => sum + amount(row.credit), 0);
  return { debit, credit, balance: Number((debit - credit).toFixed(8)) };
}
