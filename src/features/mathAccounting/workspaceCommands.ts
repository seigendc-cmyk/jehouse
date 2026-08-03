import type { ContentBlock } from '../../types';
import { createMathData } from '../../lib/mathValidation';

export type MathAccountingCommand =
  | 'paste-worked-problem'
  | 'insert-inline-equation'
  | 'insert-display-equation'
  | 'insert-aligned-working'
  | 'insert-boxed-answer'
  | 'insert-formula'
  | 'insert-journal-entry'
  | 'insert-ledger'
  | 'insert-trial-balance'
  | 'insert-financial-statement'
  | 'validate-current-block'
  | 'run-chapter-preflight'
  | 'preview-print-layout';

export const MATH_ACCOUNTING_COMMAND_LABELS: Record<MathAccountingCommand, string> = {
  'paste-worked-problem': 'Paste Worked Problem',
  'insert-inline-equation': 'Insert Inline Equation',
  'insert-display-equation': 'Insert Display Equation',
  'insert-aligned-working': 'Insert Aligned Working',
  'insert-boxed-answer': 'Insert Boxed Answer',
  'insert-formula': 'Insert Formula',
  'insert-journal-entry': 'Insert Journal Entry',
  'insert-ledger': 'Insert Ledger',
  'insert-trial-balance': 'Insert Trial Balance',
  'insert-financial-statement': 'Insert Financial Statement',
  'validate-current-block': 'Validate Current Block',
  'run-chapter-preflight': 'Run Chapter Preflight',
  'preview-print-layout': 'Preview Print Layout',
};

export const INSERT_MATH_ACCOUNTING_COMMANDS = new Set<MathAccountingCommand>([
  'insert-inline-equation',
  'insert-display-equation',
  'insert-aligned-working',
  'insert-boxed-answer',
  'insert-formula',
  'insert-journal-entry',
  'insert-ledger',
  'insert-trial-balance',
  'insert-financial-statement',
]);

export function createMathAccountingBlock(
  command: MathAccountingCommand,
  id: string,
): ContentBlock | undefined {
  if (command === 'insert-inline-equation') {
    return {
      id,
      type: 'math-inline',
      text: 'x',
      latexFormula: 'x',
      mathData: createMathData('x', 'inline'),
      semanticRole: 'explanation',
    };
  }
  if (command === 'insert-display-equation') {
    return {
      id,
      type: 'math-display',
      text: 'E = mc^2',
      latexFormula: 'E = mc^2',
      mathData: createMathData('E = mc^2', 'display'),
    };
  }
  if (command === 'insert-aligned-working') {
    const source = '\\begin{aligned} x + 2 &= 5 \\\\ x &= 3 \\end{aligned}';
    return {
      id,
      type: 'math-aligned',
      text: source,
      latexFormula: source,
      mathData: createMathData(source, 'aligned'),
      semanticRole: 'working',
    };
  }
  if (command === 'insert-boxed-answer') {
    const source = '\\boxed{x = 3}';
    return {
      id,
      type: 'math-display',
      text: source,
      latexFormula: source,
      mathData: createMathData(source, 'display', {
        accessibilityText: 'Boxed answer x equals three',
      }),
      semanticRole: 'answer',
    };
  }
  if (command === 'insert-formula') {
    const source = 'A = \\pi r^2';
    return {
      id,
      type: 'formula',
      text: source,
      latexFormula: source,
      mathData: createMathData(source, 'display', {
        accessibilityText: 'Area equals pi times radius squared',
      }),
    };
  }
  if (command === 'insert-journal-entry') {
    return {
      id,
      type: 'journal-entry',
      text: '',
      journalEntryData: {
        title: 'General Journal',
        entries: [{ id: `${id}-row-1`, date: '', details: '' }],
        validateBalance: true,
      },
    };
  }
  if (command === 'insert-ledger') {
    return {
      id,
      type: 'ledger',
      text: 'Ledger',
      ledgerData: [{ date: '', account: '', debit: '', credit: '', notes: '' }],
    };
  }
  if (command === 'insert-trial-balance') {
    return {
      id,
      type: 'trial-balance',
      text: '',
      trialBalanceData: {
        title: 'Trial Balance',
        rows: [{ id: `${id}-row-1`, accountName: '' }],
        validateEquality: true,
      },
    };
  }
  if (command === 'insert-financial-statement') {
    return {
      id,
      type: 'financial-statement',
      text: '',
      financialStatementData: {
        statementType: 'profit-or-loss',
        title: 'Statement of Profit or Loss',
        period: '',
        rows: [
          { id: `${id}-row-1`, label: 'Revenue' },
          { id: `${id}-row-2`, label: 'Expenses' },
          { id: `${id}-row-3`, label: 'Profit or loss', emphasis: 'double-total' },
        ],
      },
    };
  }
  return undefined;
}
