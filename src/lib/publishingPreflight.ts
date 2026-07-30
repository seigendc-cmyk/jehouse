import { BookProject, ContentBlock } from '../types';
import { journalTotals, trialBalanceTotals } from './accounting';
import { mathSourceForBlock, validateMathSource } from './mathValidation';

export type PreflightSeverity = 'error' | 'warning';

export interface PublishingPreflightIssue {
  id: string;
  severity: PreflightSeverity;
  code: string;
  message: string;
  chapterId?: string;
  blockId?: string;
}

export interface PublishingPreflightReport {
  valid: boolean;
  checkedAt: string;
  validEquations: number;
  invalidEquations: number;
  issues: PublishingPreflightIssue[];
}

export const isMathBlock = (block: ContentBlock): boolean =>
  ['latex', 'math-inline', 'math-display', 'math-aligned', 'formula'].includes(block.type);

export function runPublishingPreflight(project: BookProject): PublishingPreflightReport {
  const issues: PublishingPreflightIssue[] = [];
  let validEquations = 0;
  let invalidEquations = 0;
  const add = (issue: Omit<PublishingPreflightIssue, 'id'>) =>
    issues.push({ id: `preflight-${issues.length + 1}`, ...issue });

  for (const chapter of project.chapters) {
    for (const block of chapter.blocks) {
      if (isMathBlock(block)) {
        const validation = validateMathSource(mathSourceForBlock(block));
        if (validation.status === 'valid') validEquations += 1;
        else {
          invalidEquations += 1;
          add({
            severity: 'error',
            code: 'invalid-math',
            message: validation.message ?? 'Equation is invalid.',
            chapterId: chapter.id,
            blockId: block.id
          });
        }
        if (!block.mathData?.accessibilityText) {
          add({
            severity: 'warning',
            code: 'missing-math-accessibility',
            message: 'Equation has no author-provided accessibility description.',
            chapterId: chapter.id,
            blockId: block.id
          });
        }
      }
      if (block.type === 'journal-entry' && block.journalEntryData?.validateBalance) {
        const totals = journalTotals(block.journalEntryData);
        if (!totals.balanced) add({
          severity: 'error',
          code: 'journal-imbalance',
          message: `Journal debit and credit totals differ by ${totals.difference}.`,
          chapterId: chapter.id,
          blockId: block.id
        });
      }
      if (block.type === 'trial-balance' && block.trialBalanceData?.validateEquality) {
        const totals = trialBalanceTotals(block.trialBalanceData);
        if (!totals.balanced) add({
          severity: 'error',
          code: 'trial-balance-difference',
          message: `Trial balance differs by ${totals.difference}.`,
          chapterId: chapter.id,
          blockId: block.id
        });
      }
    }
  }
  return {
    valid: !issues.some((issue) => issue.severity === 'error'),
    checkedAt: new Date().toISOString(),
    validEquations,
    invalidEquations,
    issues
  };
}
