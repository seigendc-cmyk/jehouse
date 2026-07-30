import React from 'react';
import type {
  AccountingNumberFormat,
  ContentBlock,
  FinancialStatementRow,
  LedgerRow,
  TrialBalanceRow
} from '../types';
import {
  formatAccountingNumber,
  journalTotals,
  ledgerTotals,
  trialBalanceTotals
} from '../lib/accounting';
import { createMathData, mathSourceForBlock, validateMathSource } from '../lib/mathValidation';
import { isMathBlock, PublishingPreflightIssue } from '../lib/publishingPreflight';
const EquationRenderer = React.lazy(() =>
  import('./blocks/EquationRenderer').then((module) => ({ default: module.EquationRenderer }))
);

const ACCOUNTING_TYPES = new Set([
  'journal-entry', 'ledger', 'trial-balance', 'financial-statement', 'accounting-table'
]);

export const isInspectablePublishingBlock = (block?: ContentBlock): boolean =>
  Boolean(block && (isMathBlock(block) || ACCOUNTING_TYPES.has(block.type)));

export function MathAccountingInspector({
  block,
  format,
  issues,
  onChange,
  onFormatChange
}: {
  block: ContentBlock;
  format: AccountingNumberFormat;
  issues: PublishingPreflightIssue[];
  onChange: (partial: Partial<ContentBlock>, label: string, mergeKey?: string) => void;
  onFormatChange: (format: AccountingNumberFormat) => void;
}) {
  if (isMathBlock(block)) {
    const source = mathSourceForBlock(block);
    const data = block.mathData ?? createMathData(
      source,
      block.type === 'math-inline' ? 'inline' : block.type === 'math-aligned' ? 'aligned' : 'display'
    );
    const validation = validateMathSource(source);
    const updateMath = (next: Partial<typeof data>, label: string) => {
      const nextSource = next.source ?? data.source;
      const metadata = { ...data, ...next };
      const nextData = createMathData(nextSource, next.displayMode ?? data.displayMode, {
        equationNumber: metadata.equationNumber,
        label: metadata.label,
        caption: metadata.caption,
        accessibilityText: metadata.accessibilityText
      });
      onChange({ text: nextSource, latexFormula: nextSource, mathData: nextData }, label, `math-${block.id}`);
    };
    return (
      <div className="pc-publishing-inspector">
        <h3>Mathematics</h3>
        <label>LaTeX source<textarea value={source} onChange={(event) => updateMath({ source: event.target.value }, 'Edit equation source')} /></label>
        <label>Display mode<select value={data.displayMode} onChange={(event) => updateMath({ displayMode: event.target.value as typeof data.displayMode }, 'Change equation display mode')}>
          <option value="inline">Inline</option><option value="display">Display</option><option value="aligned">Aligned</option>
        </select></label>
        <label>Equation number<input value={data.equationNumber ?? ''} onChange={(event) => updateMath({ equationNumber: event.target.value }, 'Edit equation number')} /></label>
        <label>Label<input value={data.label ?? ''} onChange={(event) => updateMath({ label: event.target.value }, 'Edit equation label')} /></label>
        <label>Caption<input value={data.caption ?? ''} onChange={(event) => updateMath({ caption: event.target.value }, 'Edit equation caption')} /></label>
        <label>Accessibility description<textarea value={data.accessibilityText ?? ''} onChange={(event) => updateMath({ accessibilityText: event.target.value }, 'Edit equation accessibility description')} /></label>
        <p className={`pc-validation-status is-${validation.status}`}>Validation: {validation.status}{validation.message ? ` — ${validation.message}` : ''}</p>
        <div className="pc-equation-inspector-preview" aria-label="Equation render preview"><React.Suspense fallback={<span>Rendering preview…</span>}><EquationRenderer data={data} /></React.Suspense></div>
        <IssueList issues={issues} />
      </div>
    );
  }

  const addRow = () => {
    const id = `row-${crypto.randomUUID()}`;
    if (block.journalEntryData) onChange({ journalEntryData: { ...block.journalEntryData, entries: [...block.journalEntryData.entries, { id, date: '', details: '' }] } }, 'Add journal row');
    else if (block.trialBalanceData) onChange({ trialBalanceData: { ...block.trialBalanceData, rows: [...block.trialBalanceData.rows, { id, accountName: '' } as TrialBalanceRow] } }, 'Add trial balance row');
    else if (block.ledgerData) onChange({ ledgerData: [...block.ledgerData, { date: '', account: '', debit: '', credit: '', notes: '' } as LedgerRow] }, 'Add ledger row');
    else if (block.financialStatementData) onChange({ financialStatementData: { ...block.financialStatementData, rows: [...block.financialStatementData.rows, { id, label: 'New line' } as FinancialStatementRow] } }, 'Add statement row');
  };
  const removeRow = () => {
    if (block.journalEntryData?.entries.length) onChange({ journalEntryData: { ...block.journalEntryData, entries: block.journalEntryData.entries.slice(0, -1) } }, 'Remove journal row');
    else if (block.trialBalanceData?.rows.length) onChange({ trialBalanceData: { ...block.trialBalanceData, rows: block.trialBalanceData.rows.slice(0, -1) } }, 'Remove trial balance row');
    else if (block.ledgerData?.length) onChange({ ledgerData: block.ledgerData.slice(0, -1) }, 'Remove ledger row');
    else if (block.financialStatementData?.rows.length) onChange({ financialStatementData: { ...block.financialStatementData, rows: block.financialStatementData.rows.slice(0, -1) } }, 'Remove statement row');
  };
  const totals = block.journalEntryData ? journalTotals(block.journalEntryData)
    : block.trialBalanceData ? trialBalanceTotals(block.trialBalanceData)
    : block.ledgerData ? ledgerTotals(block.ledgerData) : undefined;
  const columns = block.type === 'journal-entry' ? 'Date, Details, Folio, Debit, Credit'
    : block.type === 'ledger' ? 'Date, Account, Debit, Credit, Notes'
    : block.type === 'trial-balance' ? 'Account, Debit, Credit'
    : 'Description, Amount';

  return (
    <div className="pc-publishing-inspector">
      <h3>Accounting</h3>
      <dl className="pc-property-list"><div><dt>Block type</dt><dd>{block.type}</dd></div><div><dt>Columns</dt><dd>{columns}</dd></div></dl>
      <label>Currency<input value={format.currency} onChange={(event) => onFormatChange({ ...format, currency: event.target.value.toUpperCase() })} /></label>
      <label>Decimal precision<input type="number" min="0" max="4" value={format.decimalPlaces} onChange={(event) => onFormatChange({ ...format, decimalPlaces: Math.max(0, Math.min(4, Number(event.target.value))) })} /></label>
      <label>Negative-number style<select value={format.negativeStyle} onChange={(event) => onFormatChange({ ...format, negativeStyle: event.target.value as AccountingNumberFormat['negativeStyle'] })}><option value="parentheses">Parentheses</option><option value="minus">Minus sign</option></select></label>
      <div className="pc-inspector-row-controls"><button type="button" onClick={addRow}>Add row</button><button type="button" onClick={removeRow}>Remove last row</button></div>
      {totals && <dl className="pc-property-list"><div><dt>Debit total</dt><dd>{formatAccountingNumber(totals.debit, format)}</dd></div><div><dt>Credit total</dt><dd>{formatAccountingNumber(totals.credit, format)}</dd></div>{'balanced' in totals && <div><dt>Status</dt><dd>{totals.balanced ? 'Balanced' : 'Imbalanced'}</dd></div>}</dl>}
      <IssueList issues={issues} />
    </div>
  );
}

function IssueList({ issues }: { issues: PublishingPreflightIssue[] }) {
  return issues.length ? <div className="pc-inspector-issues" role="status"><strong>Validation warnings</strong><ul>{issues.map((issue) => <li key={issue.id}>{issue.message}</li>)}</ul></div> : <p className="pc-validation-status is-valid">Validation: no issues found</p>;
}
