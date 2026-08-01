import type { Chapter, ContentBlock } from '../../types';
import { createMathData } from '../../lib/mathValidation';

export type WorkbookTemplateId =
  | 'mathematics-workbook'
  | 'accounting-workbook'
  | 'teacher-mathematics'
  | 'teacher-accounting';

const math = (
  id: string,
  source: string,
  mode: 'inline' | 'display' | 'aligned' = 'display',
  accessibilityText?: string,
): ContentBlock => ({
  id,
  type: mode === 'inline' ? 'math-inline' : mode === 'aligned' ? 'math-aligned' : 'math-display',
  text: source,
  latexFormula: source,
  mathData: createMathData(source, mode, { accessibilityText }),
});

export function createWorkbookTemplateChapters(
  template: WorkbookTemplateId,
  idFactory: (prefix: string) => string,
): Chapter[] {
  if (template === 'mathematics-workbook' || template === 'teacher-mathematics') {
    const teacher = template === 'teacher-mathematics';
    return [
      {
        id: idFactory('chapter'),
        number: 1,
        title: 'Number, Algebra and Worked Methods',
        subtitle: teacher ? 'Teacher edition with worked guidance' : 'Practice and reflection',
        wordCount: 0,
        blocks: [
          { id: idFactory('block'), type: 'heading', text: 'Learning objectives' },
          {
            id: idFactory('block'),
            type: 'paragraph',
            text: 'State the intended skills and prerequisite knowledge for this unit.',
            semanticRole: 'instruction',
          },
          { id: idFactory('block'), type: 'worked-example', text: 'Worked example 1', problemNumber: '1', semanticRole: 'problem' },
          math(idFactory('block'), '\\frac{3x-2}{4}+\\frac{x+1}{2}=6', 'display', 'An algebraic equation containing two fractions'),
          { id: idFactory('block'), type: 'solution-step', text: 'Step 1 — identify a common denominator', stepNumber: '1', semanticRole: 'working' },
          math(idFactory('block'), '\\begin{aligned} 3x-2+2(x+1) &= 24 \\\\ 5x &= 24 \\end{aligned}', 'aligned', 'Two aligned algebraic working steps'),
          math(idFactory('block'), '\\boxed{x = \\frac{24}{5}}', 'display', 'Boxed answer x equals twenty four fifths'),
          { id: idFactory('block'), type: 'heading', text: teacher ? 'Teaching notes and marking guidance' : 'Independent practice' },
          {
            id: idFactory('block'),
            type: 'paragraph',
            text: teacher
              ? 'Record misconceptions, alternative methods and the marks awarded for each valid step.'
              : 'Add practice questions here. Keep each original expression editable as structured mathematics.',
            semanticRole: teacher ? 'note' : 'instruction',
          },
        ],
      },
    ];
  }

  const teacher = template === 'teacher-accounting';
  return [
    {
      id: idFactory('chapter'),
      number: 1,
      title: 'Double-entry and Financial Statements',
      subtitle: teacher ? 'Teacher edition with validation guidance' : 'Structured accounting practice',
      wordCount: 0,
      blocks: [
        { id: idFactory('block'), type: 'heading', text: 'Learning objectives' },
        {
          id: idFactory('block'),
          type: 'paragraph',
          text: 'Define the reporting period, currency and source documents before entering learner data.',
          semanticRole: 'instruction',
        },
        {
          id: idFactory('block'),
          type: 'journal-entry',
          text: '',
          journalEntryData: {
            title: 'General Journal Practice',
            entries: [{ id: idFactory('row'), date: '', details: '' }],
            validateBalance: true,
          },
        },
        {
          id: idFactory('block'),
          type: 'ledger',
          text: 'Ledger Practice',
          ledgerData: [{ date: '', account: '', debit: '', credit: '', notes: '' }],
        },
        {
          id: idFactory('block'),
          type: 'trial-balance',
          text: '',
          trialBalanceData: {
            title: 'Trial Balance Practice',
            rows: [{ id: idFactory('row'), accountName: '' }],
            validateEquality: true,
          },
        },
        {
          id: idFactory('block'),
          type: 'financial-statement',
          text: '',
          financialStatementData: {
            statementType: 'profit-or-loss',
            title: 'Statement of Profit or Loss',
            period: '',
            rows: [
              { id: idFactory('row'), label: 'Revenue' },
              { id: idFactory('row'), label: 'Expenses' },
              { id: idFactory('row'), label: 'Profit or loss', emphasis: 'double-total' },
            ],
          },
        },
        {
          id: idFactory('block'),
          type: 'paragraph',
          text: teacher
            ? 'Use the validation warnings to discuss imbalance causes. Replace all blank rows with the exercise data before assessment.'
            : 'Complete the journal, post to the ledger, prepare the trial balance and then draft the statement.',
          semanticRole: teacher ? 'note' : 'instruction',
        },
      ],
    },
  ];
}
