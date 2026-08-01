import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createEmptyBookProject } from '../../data/createEmptyBookProject';
import { runPublishingPreflight } from '../../lib/publishingPreflight';
import { createMathAccountingBlock } from './workspaceCommands';

const source = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

describe('mathematics and accounting workspace integration', () => {
  it('provides keyboard access and a focused, cancellable review-before-insert paste flow', () => {
    const navbar = source('components/Navbar.tsx');
    const editor = source('components/EditorCanvas.tsx');
    expect(navbar).toContain("event.altKey");
    expect(navbar).toContain("event.shiftKey");
    expect(navbar).toContain("'paste-worked-problem'");
    expect(editor).toContain('autoFocus');
    expect(editor).toContain('Detect Structure');
    expect(editor).toContain('Review Ambiguities');
    expect(editor).toContain('Paste as Plain Text');
    expect(editor).toContain('Accept All');
    expect(editor).toContain("setPendingPaste(null)");
    expect(editor).toContain("'structure'");
  });

  it('connects inspector edits, current-block validation and chapter issue navigation', () => {
    const app = source('App.tsx');
    const inspector = source('components/MathAccountingInspector.tsx');
    expect(app).toContain('handleMathAccountingCommand');
    expect(app).toContain('Chapter preflight issues');
    expect(app).toContain('setHistoryActiveBlockId(issue.blockId)');
    for (const label of [
      'LaTeX source', 'Display mode', 'Equation number', 'Label', 'Caption',
      'Accessibility description', 'Equation render preview', 'Currency',
      'Decimal precision', 'Negative-number style', 'Add row', 'Remove last row'
    ]) expect(inspector).toContain(label);
  });

  it('detects and navigates to an unbalanced trial balance without mutating it', () => {
    const project = createEmptyBookProject();
    const block = createMathAccountingBlock('insert-trial-balance', 'trial')!;
    block.trialBalanceData!.rows = [{ id: 'row', accountName: 'Cash', debit: 100, credit: 0 }];
    project.chapters[0].blocks.push(block);
    const report = runPublishingPreflight(project);
    expect(report.issues.find((issue) => issue.code === 'trial-balance-difference')).toMatchObject({
      chapterId: project.chapters[0].id,
      blockId: 'trial'
    });
    expect(block.trialBalanceData.rows[0].debit).toBe(100);
  });

  it('retains the existing horizontal ribbon and narrow inspector policy', () => {
    const css = source('index.css');
    expect(css).toContain('.pc-ribbon');
    expect(css).toContain('overflow-x: auto');
    expect(css).toContain('width: min(var(--pc-inspector-width), calc(100vw - 64px))');
  });
});
