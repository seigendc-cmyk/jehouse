import { createEmptyBookProject } from '../../src/data/createEmptyBookProject';
import { createMathData } from '../../src/lib/mathValidation';
import type {
  AccountingEntry,
  BookProject,
  ContentBlock,
  FinancialStatementRow,
  TrialBalanceRow,
} from '../../src/types';

const paragraph = (id: string, text: string): ContentBlock => ({
  id,
  type: 'paragraph',
  text,
  fontFamily: 'Georgia, serif',
  fontSize: 16,
  lineHeight: 1.6,
});

const heading = (id: string, text: string): ContentBlock => ({
  id,
  type: 'heading',
  text,
});

const math = (
  id: string,
  source: string,
  type: 'math-inline' | 'math-display' | 'math-aligned' = 'math-display',
  options: { equationNumber?: string; accessibilityText?: string } = {},
): ContentBlock => ({
  id,
  type,
  text: source,
  latexFormula: source,
  mathData: createMathData(
    source,
    type === 'math-inline' ? 'inline' : type === 'math-aligned' ? 'aligned' : 'display',
    options,
  ),
});

const journalEntry = (
  id: string,
  title: string,
  entries: AccountingEntry[],
  validateBalance = true,
): ContentBlock => ({
  id,
  type: 'journal-entry',
  text: title,
  journalEntryData: {
    title,
    entries,
    validateBalance,
    currencyOverride: 'ZAR',
  },
});

const trialBalance = (
  id: string,
  title: string,
  rows: TrialBalanceRow[],
): ContentBlock => ({
  id,
  type: 'trial-balance',
  text: title,
  trialBalanceData: {
    title,
    rows,
    validateEquality: true,
    currencyOverride: 'ZAR',
  },
});

const financialStatement = (
  id: string,
  statementType: 'profit-or-loss' | 'financial-position',
  title: string,
  rows: FinancialStatementRow[],
): ContentBlock => ({
  id,
  type: 'financial-statement',
  text: title,
  financialStatementData: {
    statementType,
    title,
    period: 'Year ended 31 December 2025',
    rows,
    currencyOverride: 'ZAR',
  },
});

const multiPageJournalEntries = (): AccountingEntry[] =>
  Array.from({ length: 32 }, (_, index) => {
    const number = index + 1;
    const amount = 100 + number * 7.5;
    return [
      {
        id: `qa-long-journal-${number}-debit`,
        date: `2025-12-${String((index % 28) + 1).padStart(2, '0')}`,
        details: `Inventory batch ${String(number).padStart(2, '0')}`,
        folio: `INV${String(number).padStart(2, '0')}`,
        debit: amount,
      },
      {
        id: `qa-long-journal-${number}-credit`,
        date: `2025-12-${String((index % 28) + 1).padStart(2, '0')}`,
        details: 'Trade payables',
        folio: `PAY${String(number).padStart(2, '0')}`,
        credit: amount,
      },
    ];
  }).flat();

export function createMathAccountingQaFixture(): BookProject {
  const project = createEmptyBookProject({
    title: 'Mathematics and Accounting Production QA',
    subtitle: 'Deterministic offline and print acceptance fixture',
    author: 'PressCraft QA',
    category: 'Academic & Textbook',
  });

  project.id = 'qa-math-accounting-production-fixture-v1';
  project.lastSaved = '2026-07-30T00:00:00.000Z';
  project.cover = {
    ...project.cover,
    title: project.title,
    subtitle: project.subtitle,
    author: project.author,
    publisher: 'PressCraft Quality Engineering',
    backBlurb: 'A deterministic fixture for mathematics, accounting, print, and offline acceptance.',
    artworkUrl: undefined,
  };
  project.frontMatter = {
    ...project.frontMatter,
    includeCopyright: true,
    copyrightText: 'QA fixture. No remote assets or services are required.',
    isbn: '978-0-00000-000-0',
    publisher: 'PressCraft Quality Engineering',
    includeTOC: true,
  };
  project.exportSettings = {
    ...project.exportSettings,
    includeCover: true,
    includeFrontMatter: true,
    includeTOC: true,
    trimSize: 'A4',
    pageOrientation: 'portrait',
    fontPairing: 'Classic Serif',
    googleSerifFont: undefined,
    googleSansFont: undefined,
    marginPreset: 'standard',
  };
  project.mathPublishing = {
    renderer: 'katex',
    rendererVersion: '0.18.1',
    invalidMathPolicy: 'visible-warning',
    allowedCommandsProfile: 'safe-default',
  };
  project.accountingFormat = {
    currency: 'ZAR',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    negativeStyle: 'parentheses',
    zeroDisplay: 'dash',
    currencySymbolPosition: 'before',
    dateFormat: 'YYYY-MM-DD',
  };
  project.assets = [];

  project.chapters = [
    {
      id: 'qa-chapter-mathematics',
      number: 1,
      title: 'Mathematics Typesetting',
      subtitle: 'Sharp, semantic and accessible equations',
      wordCount: 128,
      blocks: [
        heading('qa-math-heading-basics', 'Core equation forms'),
        paragraph('qa-math-inline-prose', 'Inline algebra accompanies the variable equation below without relying on a remote renderer.'),
        math('qa-math-inline', 'ax^2 + bx + c = 0', 'math-inline', {
          accessibilityText: 'a x squared plus b x plus c equals zero',
        }),
        math('qa-math-display', 'E = mc^2', 'math-display', {
          equationNumber: '1.1',
          accessibilityText: 'Energy equals mass times the speed of light squared',
        }),
        math('qa-math-nested-fraction', '\\frac{1}{1+\\frac{1}{1+\\frac{1}{x}}}', 'math-display', {
          accessibilityText: 'A continued nested fraction in x',
        }),
        math('qa-math-root', '\\sqrt{x^2 + y^2}', 'math-display', {
          accessibilityText: 'Square root of x squared plus y squared',
        }),
        math('qa-math-powers-subscripts', 'a_n = a_1 r^{n-1}', 'math-display', {
          accessibilityText: 'The nth geometric term equals the first term times r to the n minus one',
        }),
        math('qa-math-boxed', '\\boxed{x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}}', 'math-display', {
          equationNumber: '1.2',
          accessibilityText: 'Boxed quadratic formula',
        }),
        math(
          'qa-math-aligned',
          '\\begin{aligned} 2x + 7 &= 19 \\\\ 2x &= 12 \\\\ x &= 6 \\end{aligned}',
          'math-aligned',
          { accessibilityText: 'Three aligned steps solving two x plus seven equals nineteen' },
        ),
        math('qa-math-summation', '\\sum_{k=1}^{n} k = \\frac{n(n+1)}{2}', 'math-display', {
          equationNumber: '1.3',
          accessibilityText: 'Sum of the first n positive integers',
        }),
        math('qa-math-integral', '\\int_{0}^{\\infty} e^{-x^2}\\,dx = \\frac{\\sqrt{\\pi}}{2}', 'math-display', {
          accessibilityText: 'Gaussian integral from zero to infinity',
        }),
        math('qa-math-matrix', '\\begin{bmatrix} 1 & 2 & 3 \\\\ 0 & 1 & 4 \\\\ 5 & 6 & 0 \\end{bmatrix}', 'math-display', {
          accessibilityText: 'Three by three matrix',
        }),
        heading('qa-math-heading-width', 'Long-equation width policy'),
        math(
          'qa-math-long-width',
          '\\displaystyle \\frac{\\left(x_1+x_2+x_3+x_4+x_5+x_6+x_7+x_8+x_9+x_{10}\\right)^2}{\\sqrt{a_1^2+a_2^2+a_3^2+a_4^2+a_5^2+a_6^2+a_7^2+a_8^2+a_9^2+a_{10}^2}} = \\sum_{k=1}^{10}\\frac{x_k^2}{a_k}',
          'math-display',
          { accessibilityText: 'A long equation used to verify the approved page-width overflow policy' },
        ),
        paragraph(
          'qa-math-boundary-filler',
          'Boundary control paragraph. '.repeat(48).trim(),
        ),
        {
          id: 'qa-math-worked-example',
          type: 'worked-example',
          text: 'Worked example near a page boundary',
          semanticRole: 'problem',
          problemNumber: '1',
        },
        math('qa-math-boundary-equation', '\\frac{3}{4}x - 5 = 16', 'math-display', {
          accessibilityText: 'Three quarters x minus five equals sixteen',
        }),
        {
          id: 'qa-math-solution-step',
          type: 'solution-step',
          text: 'Step 1 — isolate the variable term',
          semanticRole: 'working',
          stepNumber: '1',
        },
        math('qa-math-boundary-result', '\\boxed{x = 28}', 'math-display', {
          accessibilityText: 'Boxed answer x equals twenty eight',
        }),
        math('qa-math-invalid', '\\frac{1}{', 'math-display', {
          accessibilityText: 'Intentionally invalid fraction used to verify visible fallback',
        }),
      ],
    },
    {
      id: 'qa-chapter-accounting',
      number: 2,
      title: 'Accounting Statements',
      subtitle: 'Balanced books, warnings, totals and multi-page tables',
      wordCount: 96,
      blocks: [
        heading('qa-accounting-heading-journals', 'Journal entries'),
        journalEntry('qa-journal-balanced', 'Balanced General Journal', [
          { id: 'qa-jb-1', date: '2025-01-02', details: 'Bank', folio: 'B1', debit: 12500 },
          { id: 'qa-jb-2', date: '2025-01-02', details: 'Owner capital', folio: 'C1', credit: 12500 },
        ]),
        journalEntry('qa-journal-unbalanced', 'Unbalanced Journal — Warning Expected', [
          { id: 'qa-ju-1', date: '2025-01-05', details: 'Equipment', folio: 'E1', debit: 8500 },
          { id: 'qa-ju-2', date: '2025-01-05', details: 'Bank', folio: 'B1', credit: 8000 },
        ]),
        heading('qa-accounting-heading-taccount', 'T-account — Bank'),
        {
          id: 'qa-accounting-t-account',
          type: 'ledger',
          text: 'T-account — Bank',
          ledgerData: [
            { date: '2025-01-02', account: 'Capital', debit: '12,500.00', credit: '', notes: 'Opening investment' },
            { date: '2025-01-05', account: 'Equipment', debit: '', credit: '8,000.00', notes: 'Asset purchase' },
            { date: '2025-01-31', account: 'Balance c/d', debit: '', credit: '4,500.00', notes: 'Closing balance' },
          ],
        },
        heading('qa-accounting-heading-trial', 'Trial balances'),
        trialBalance('qa-trial-balanced', 'Balanced Trial Balance', [
          { id: 'qa-tb-1', accountName: 'Bank', debit: 4500 },
          { id: 'qa-tb-2', accountName: 'Equipment', debit: 8000 },
          { id: 'qa-tb-3', accountName: 'Capital', credit: 12500 },
        ]),
        trialBalance('qa-trial-unbalanced', 'Unbalanced Trial Balance — Warning Expected', [
          { id: 'qa-tu-1', accountName: 'Bank', debit: 4500 },
          { id: 'qa-tu-2', accountName: 'Equipment', debit: 8000 },
          { id: 'qa-tu-3', accountName: 'Capital', credit: 12000 },
        ]),
        financialStatement('qa-profit-loss', 'profit-or-loss', 'Statement of Profit or Loss', [
          { id: 'qa-pl-1', label: 'Revenue', amount: 187500 },
          { id: 'qa-pl-2', label: 'Cost of sales', amount: -121875 },
          { id: 'qa-pl-3', label: 'Gross profit', amount: 65625, emphasis: 'subtotal' },
          { id: 'qa-pl-4', label: 'Operating expenses', amount: -28750 },
          { id: 'qa-pl-5', label: 'Profit for the year', amount: 36875, emphasis: 'double-total' },
        ]),
        {
          id: 'qa-percentage-table',
          type: 'accounting-table',
          text: 'Performance ratios',
          tableData: {
            title: 'Performance Ratios',
            headers: ['Measure', 'Current year', 'Prior year'],
            rows: [
              ['Gross profit margin', '35.00%', '32.50%'],
              ['Net profit margin', '19.67%', '17.20%'],
              ['Return on assets', '12.40%', '10.90%'],
            ],
          },
        },
        financialStatement('qa-financial-position', 'financial-position', 'Statement of Financial Position', [
          { id: 'qa-fp-1', label: 'Assets', emphasis: 'total' },
          { id: 'qa-fp-2', label: 'Property, plant and equipment', amount: 245000, level: 1 },
          { id: 'qa-fp-3', label: 'Inventory', amount: 87500, level: 1 },
          { id: 'qa-fp-4', label: 'Allowance for obsolete inventory', amount: -2500, level: 2 },
          { id: 'qa-fp-5', label: 'Total assets', amount: 330000, emphasis: 'double-total' },
          { id: 'qa-fp-6', label: 'Equity and liabilities', emphasis: 'total' },
          { id: 'qa-fp-7', label: 'Owner equity', amount: 225000, level: 1 },
          { id: 'qa-fp-8', label: 'Trade payables', amount: 105000, level: 1 },
          { id: 'qa-fp-9', label: 'Total equity and liabilities', amount: 330000, emphasis: 'double-total' },
        ]),
        heading('qa-accounting-heading-multipage', 'Multi-page journal continuity'),
        journalEntry(
          'qa-journal-multipage',
          'Multi-page Inventory Journal',
          multiPageJournalEntries(),
        ),
      ],
    },
    {
      id: 'qa-chapter-offline',
      number: 3,
      title: 'Offline Reader Checks',
      subtitle: 'Navigation, search, reload and missing assets',
      wordCount: 46,
      blocks: [
        heading('qa-offline-heading', 'Offline navigation target'),
        paragraph(
          'qa-offline-search-target',
          'Quasar reconciliation is the deterministic search phrase for the offline data-pack acceptance test.',
        ),
        paragraph(
          'qa-offline-accessibility-note',
          'Every representative equation in this fixture includes an accessibility description.',
        ),
        {
          id: 'qa-offline-missing-asset',
          type: 'image',
          text: 'Intentionally missing local QA asset',
          imageUrl: '/qa-assets/intentionally-missing-diagram.png',
          imageCaption: 'Missing asset fallback fixture',
        },
      ],
    },
  ];

  return project;
}

