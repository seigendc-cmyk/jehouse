import React from 'react';
import {
  AccountingNumberFormat,
  ContentBlock,
  FinancialStatementData,
  JournalEntryData,
  TrialBalanceData
} from '../../types';
import {
  DEFAULT_ACCOUNTING_FORMAT,
  formatAccountingNumber,
  journalTotals,
  trialBalanceTotals
} from '../../lib/accounting';

interface AccountingBlockProps {
  block: ContentBlock;
  format?: AccountingNumberFormat;
  readOnly?: boolean;
  onChange?: (partial: Partial<ContentBlock>) => void;
}

const numericValue = (value: string): number | undefined => {
  if (!value.trim()) return undefined;
  const parsed = Number(value.replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : undefined;
};

export function AccountingBlock({
  block,
  format = DEFAULT_ACCOUNTING_FORMAT,
  readOnly = false,
  onChange
}: AccountingBlockProps) {
  if (block.type === 'journal-entry' && block.journalEntryData) {
    return <JournalTable data={block.journalEntryData} format={format} readOnly={readOnly} onChange={(journalEntryData) => onChange?.({ journalEntryData })} />;
  }
  if (block.type === 'trial-balance' && block.trialBalanceData) {
    return <TrialBalanceTable data={block.trialBalanceData} format={format} readOnly={readOnly} onChange={(trialBalanceData) => onChange?.({ trialBalanceData })} />;
  }
  if (block.type === 'financial-statement' && block.financialStatementData) {
    return <FinancialStatementTable data={block.financialStatementData} format={format} />;
  }
  if (block.tableData) {
    return (
      <div className="overflow-x-auto rounded border border-zinc-300">
        <table className="w-full border-collapse text-sm">
          <caption className="p-2 font-semibold">{block.tableData.title}</caption>
          <thead><tr>{block.tableData.headers.map((header) => <th key={header} scope="col" className="border p-2 text-left">{header}</th>)}</tr></thead>
          <tbody>{block.tableData.rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, index) => <td key={index} className="border p-2">{cell}</td>)}</tr>)}</tbody>
        </table>
      </div>
    );
  }
  return <div className="rounded border border-amber-300 p-3 text-sm text-amber-800">Accounting block has no structured rows.</div>;
}

function JournalTable({
  data,
  format,
  readOnly,
  onChange
}: {
  data: JournalEntryData;
  format: AccountingNumberFormat;
  readOnly: boolean;
  onChange: (data: JournalEntryData) => void;
}) {
  const totals = journalTotals(data);
  return (
    <div className="overflow-x-auto rounded border border-zinc-300 bg-white text-zinc-900">
      <table className="w-full min-w-[620px] border-collapse text-sm">
        <caption className="p-2 font-bold">{data.title || 'General Journal'}</caption>
        <thead><tr className="bg-zinc-100"><th scope="col" className="border p-2">Date</th><th scope="col" className="border p-2 text-left">Details</th><th scope="col" className="border p-2">Folio</th><th scope="col" className="border p-2 text-right">Debit</th><th scope="col" className="border p-2 text-right">Credit</th></tr></thead>
        <tbody>
          {data.entries.map((entry, rowIndex) => (
            <tr key={entry.id}>
              {(['date', 'details', 'folio'] as const).map((key) => <td key={key} className="border p-1">{readOnly ? entry[key] : <input aria-label={`${key} row ${rowIndex + 1}`} className="w-full bg-transparent p-1" value={entry[key] ?? ''} onChange={(event) => onChange({ ...data, entries: data.entries.map((item) => item.id === entry.id ? { ...item, [key]: event.target.value } : item) })} />}</td>)}
              {(['debit', 'credit'] as const).map((key) => <td key={key} className="border p-1 text-right font-mono">{readOnly ? formatAccountingNumber(entry[key] ?? 0, format, data.currencyOverride) : <input aria-label={`${key} row ${rowIndex + 1}`} inputMode="decimal" className="w-full bg-transparent p-1 text-right" value={entry[key] ?? ''} onChange={(event) => onChange({ ...data, entries: data.entries.map((item) => item.id === entry.id ? { ...item, [key]: numericValue(event.target.value) } : item) })} />}</td>)}
            </tr>
          ))}
        </tbody>
        <tfoot><tr className="border-t-2 font-bold"><th colSpan={3} scope="row" className="p-2 text-right">Total</th><td className="border p-2 text-right">{formatAccountingNumber(totals.debit, format, data.currencyOverride)}</td><td className="border p-2 text-right">{formatAccountingNumber(totals.credit, format, data.currencyOverride)}</td></tr></tfoot>
      </table>
      {!readOnly ? <button type="button" className="m-2 rounded border px-2 py-1 text-xs" onClick={() => onChange({ ...data, entries: [...data.entries, { id: crypto.randomUUID(), date: '', details: '' }] })}>Add journal row</button> : null}
      {data.validateBalance && !totals.balanced ? <p role="alert" className="p-2 text-sm font-semibold text-amber-700">Journal is out of balance by {formatAccountingNumber(Math.abs(totals.difference), format, data.currencyOverride)}.</p> : null}
    </div>
  );
}

function TrialBalanceTable({
  data,
  format,
  readOnly,
  onChange
}: {
  data: TrialBalanceData;
  format: AccountingNumberFormat;
  readOnly: boolean;
  onChange: (data: TrialBalanceData) => void;
}) {
  const totals = trialBalanceTotals(data);
  return (
    <div className="overflow-x-auto rounded border border-zinc-300 bg-white text-zinc-900">
      <table className="w-full min-w-[520px] border-collapse text-sm">
        <caption className="p-2 font-bold">{data.title || 'Trial Balance'}</caption>
        <thead><tr className="bg-zinc-100"><th scope="col" className="border p-2 text-left">Account</th><th scope="col" className="border p-2 text-right">Debit balance</th><th scope="col" className="border p-2 text-right">Credit balance</th></tr></thead>
        <tbody>{data.rows.map((row, rowIndex) => <tr key={row.id}><td className="border p-1">{readOnly ? row.accountName : <input aria-label={`account row ${rowIndex + 1}`} className="w-full p-1" value={row.accountName} onChange={(event) => onChange({ ...data, rows: data.rows.map((item) => item.id === row.id ? { ...item, accountName: event.target.value } : item) })} />}</td>{(['debit', 'credit'] as const).map((key) => <td key={key} className="border p-1 text-right font-mono">{readOnly ? formatAccountingNumber(row[key] ?? 0, format, data.currencyOverride) : <input aria-label={`${key} balance row ${rowIndex + 1}`} className="w-full p-1 text-right" value={row[key] ?? ''} onChange={(event) => onChange({ ...data, rows: data.rows.map((item) => item.id === row.id ? { ...item, [key]: numericValue(event.target.value) } : item) })} />}</td>)}</tr>)}</tbody>
        <tfoot><tr className="border-y-4 border-double font-bold"><th scope="row" className="p-2 text-right">Total</th><td className="border p-2 text-right">{formatAccountingNumber(totals.debit, format, data.currencyOverride)}</td><td className="border p-2 text-right">{formatAccountingNumber(totals.credit, format, data.currencyOverride)}</td></tr></tfoot>
      </table>
      {!readOnly ? <button type="button" className="m-2 rounded border px-2 py-1 text-xs" onClick={() => onChange({ ...data, rows: [...data.rows, { id: crypto.randomUUID(), accountName: '' }] })}>Add trial-balance row</button> : null}
      {data.validateEquality && !totals.balanced ? <p role="alert" className="p-2 text-sm font-semibold text-amber-700">Trial balance differs by {formatAccountingNumber(Math.abs(totals.difference), format, data.currencyOverride)}.</p> : null}
    </div>
  );
}

function FinancialStatementTable({ data, format }: { data: FinancialStatementData; format: AccountingNumberFormat }) {
  return (
    <div className="overflow-x-auto rounded border border-zinc-300 bg-white p-3 text-zinc-900">
      <table className="w-full border-collapse text-sm">
        <caption className="pb-3"><strong>{data.title || data.statementType.replace(/-/g, ' ')}</strong>{data.period ? <span className="block text-xs">{data.period}</span> : null}</caption>
        <tbody>{data.rows.map((row) => <tr key={row.id} className={row.emphasis === 'total' || row.emphasis === 'double-total' ? 'font-bold' : ''}><th scope="row" className="p-1 text-left" style={{ paddingLeft: `${(row.level ?? 0) * 1.25 + 0.25}rem` }}>{row.label}</th><td className={`p-1 text-right font-mono ${row.emphasis === 'double-total' ? 'border-y-4 border-double' : row.emphasis === 'total' ? 'border-t-2' : row.emphasis === 'subtotal' ? 'border-t' : ''}`}>{row.amount === undefined ? '' : formatAccountingNumber(row.amount, format, data.currencyOverride)}</td></tr>)}</tbody>
      </table>
    </div>
  );
}
