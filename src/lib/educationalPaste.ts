import {
  ContentBlock,
  JournalEntryData,
  TrialBalanceData
} from '../types';
import { createMathData, validateMathSource } from './mathValidation';
import { createListId, listFormatting } from './structuredLists';

export type PasteAmbiguityChoice = 'math-inline' | 'math-display' | 'code' | 'plain-text';

export interface PasteAmbiguity {
  id: string;
  source: string;
  line: number;
  reason: string;
  suggestedChoice: PasteAmbiguityChoice;
}

export interface PasteWarning {
  line?: number;
  message: string;
  blockId?: string;
}

export interface EducationalPasteResult {
  originalSource: string;
  blocks: ContentBlock[];
  ambiguities: PasteAmbiguity[];
  warnings: PasteWarning[];
  counts: {
    headings: number;
    paragraphs: number;
    inlineMath: number;
    displayMath: number;
    alignedMath: number;
    code: number;
    accounting: number;
    invalidMath: number;
  };
  requiresReview: boolean;
}

const STRONG_MATH_SIGNAL = /\\(?:frac|boxed|sqrt|text|left|right|begin|end|sum|int|lim|times|div|cdot|overline|underline|mathbf|mathrm|operatorname)\b/;
const ALGEBRA_SIGNAL = /(?:[A-Za-z0-9})\]])\s*(?:=|≠|≤|≥|<|>|\+|-|\\times|\\div|\\cdot)\s*(?:[A-Za-z0-9({[])/;
const SCRIPT_SIGNAL = /(?:[A-Za-z0-9)}\]])(?:\^[{A-Za-z0-9(]|_[{A-Za-z0-9(])/;
const CODE_SIGNAL = /(?:console\.|function\s*\(|=>|const\s+\w+|let\s+\w+|SELECT\s+.+FROM|<\/?[A-Za-z][^>]*>|;\s*$)/i;

export function classifyBacktickContent(source: string): {
  choice: PasteAmbiguityChoice;
  confidence: 'high' | 'low';
} {
  const value = source.trim();
  if (STRONG_MATH_SIGNAL.test(value) || SCRIPT_SIGNAL.test(value) || ALGEBRA_SIGNAL.test(value)) {
    return { choice: 'math-inline', confidence: 'high' };
  }
  if (CODE_SIGNAL.test(value)) return { choice: 'code', confidence: 'high' };
  if (/^[A-Za-z]$/.test(value)) return { choice: 'math-inline', confidence: 'high' };
  if (/^[A-Za-z]\w*$/.test(value)) return { choice: 'math-inline', confidence: 'low' };
  return { choice: 'code', confidence: 'low' };
}

function parseAmount(value: string): number | undefined {
  const normalized = value.replace(/[^\d.,()-]/g, '').replace(/,/g, '');
  if (!normalized) return undefined;
  const negative = normalized.startsWith('(') && normalized.endsWith(')');
  const parsed = Number(normalized.replace(/[()]/g, ''));
  return Number.isFinite(parsed) ? (negative ? -parsed : parsed) : undefined;
}

function parseMarkdownTable(lines: string[], start: number): { block?: ContentBlock; consumed: number } {
  if (start + 2 >= lines.length || !lines[start].includes('|') || !/^\s*\|?[\s:|-]+\|/.test(lines[start + 1])) {
    return { consumed: 0 };
  }
  const split = (line: string) => line.trim().replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim());
  const headers = split(lines[start]).map((header) => header.toLowerCase());
  let end = start + 2;
  while (end < lines.length && lines[end].includes('|') && lines[end].trim()) end += 1;
  const rows = lines.slice(start + 2, end).map(split);
  const makeId = () => `paste-${start + 1}-${Math.random().toString(36).slice(2, 8)}`;

  if (headers.includes('debit') && headers.includes('credit') && headers.some((header) => /date/.test(header))) {
    const detailsIndex = headers.findIndex((header) => /details|account|name/.test(header));
    const dateIndex = headers.findIndex((header) => /date/.test(header));
    const debitIndex = headers.indexOf('debit');
    const creditIndex = headers.indexOf('credit');
    const folioIndex = headers.findIndex((header) => /folio|ref/.test(header));
    const journal: JournalEntryData = {
      entries: rows.map((row, index) => ({
        id: `${makeId()}-${index}`,
        date: row[dateIndex] ?? '',
        details: row[detailsIndex] ?? '',
        folio: folioIndex >= 0 ? row[folioIndex] : undefined,
        debit: parseAmount(row[debitIndex] ?? ''),
        credit: parseAmount(row[creditIndex] ?? '')
      })),
      validateBalance: true
    };
    return {
      consumed: end - start,
      block: { id: makeId(), type: 'journal-entry', text: lines.slice(start, end).join('\n'), journalEntryData: journal }
    };
  }
  if (headers.includes('debit balance') || headers.includes('credit balance')) {
    const accountIndex = headers.findIndex((header) => /account/.test(header));
    const debitIndex = headers.findIndex((header) => /debit/.test(header));
    const creditIndex = headers.findIndex((header) => /credit/.test(header));
    const trial: TrialBalanceData = {
      rows: rows.map((row, index) => ({
        id: `${makeId()}-${index}`,
        accountName: row[accountIndex] ?? '',
        debit: parseAmount(row[debitIndex] ?? ''),
        credit: parseAmount(row[creditIndex] ?? '')
      })),
      validateEquality: true
    };
    return {
      consumed: end - start,
      block: { id: makeId(), type: 'trial-balance', text: lines.slice(start, end).join('\n'), trialBalanceData: trial }
    };
  }
  return {
    consumed: end - start,
    block: {
      id: makeId(),
      type: 'accounting-table',
      text: lines.slice(start, end).join('\n'),
      tableData: { headers: split(lines[start]), rows }
    }
  };
}

export function normalizeEducationalPaste(
  source: string,
  idFactory: () => string = () => `paste-${crypto.randomUUID()}`
): EducationalPasteResult {
  const blocks: ContentBlock[] = [];
  const ambiguities: PasteAmbiguity[] = [];
  const warnings: PasteWarning[] = [];
  const counts = { headings: 0, paragraphs: 0, inlineMath: 0, displayMath: 0, alignedMath: 0, code: 0, accounting: 0, invalidMath: 0 };
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  let activePasteList: { id: string; type: 'unordered' | 'ordered' } | undefined;

  const addMath = (raw: string, mathSource: string, mode: 'inline' | 'display' | 'aligned', line: number) => {
    const validation = validateMathSource(mathSource);
    const block: ContentBlock = {
      id: idFactory(),
      type: mode === 'inline' ? 'math-inline' : mode === 'aligned' ? 'math-aligned' : 'math-display',
      text: raw,
      latexFormula: mathSource,
      mathData: createMathData(mathSource, mode)
    };
    blocks.push(block);
    if (mode === 'inline') counts.inlineMath += 1;
    else if (mode === 'aligned') counts.alignedMath += 1;
    else counts.displayMath += 1;
    if (validation.status !== 'valid') {
      counts.invalidMath += 1;
      warnings.push({ line, blockId: block.id, message: validation.message ?? 'Invalid mathematical expression.' });
    }
  };

  for (let index = 0; index < lines.length;) {
    const rawLine = lines[index];
    const trimmed = rawLine.trim();
    if (!trimmed) {
      activePasteList = undefined;
      index += 1;
      continue;
    }
    const table = parseMarkdownTable(lines, index);
    if (table.block) {
      blocks.push(table.block);
      counts.accounting += 1;
      index += table.consumed;
      continue;
    }
    const heading = rawLine.match(/^\s*(#{1,4})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      const text = heading[2];
      const step = text.match(/^Step\s+(\d+)\s*:\s*(.*)$/i);
      const problem = text.match(/^Problem\s+(\d+)\s*:\s*(.*)$/i);
      blocks.push({
        id: idFactory(),
        type: step ? 'solution-step' : problem ? 'worked-example' : level <= 2 ? 'heading' : level === 3 ? 'subheading' : 'clause',
        text,
        semanticRole: step ? 'working' : problem ? 'problem' : undefined,
        stepNumber: step?.[1],
        problemNumber: problem?.[1]
      });
      counts.headings += 1;
      index += 1;
      continue;
    }
    const markdownList = rawLine.match(/^(\s*)([-+*]|\d+[.)])\s+(.+)$/);
    if (markdownList) {
      const type = /^\d/.test(markdownList[2]) ? 'ordered' : 'unordered';
      if (!activePasteList || activePasteList.type !== type) activePasteList = { id: createListId(), type };
      const level = Math.min(4, Math.floor(markdownList[1].replace(/\t/g, '  ').length / 2));
      const startAt = type === 'ordered' ? Number(markdownList[2].match(/^\d+/)?.[0] ?? 1) : undefined;
      blocks.push({ id: idFactory(), type: 'paragraph', text: markdownList[3], listFormatting: listFormatting(type, activePasteList.id, {
        level, ...(startAt !== undefined && startAt !== 1 ? { startAt, restart: true } : {})
      }) });
      counts.paragraphs += 1;
      index += 1;
      continue;
    }
    activePasteList = undefined;
    const wholeBacktick = trimmed.match(/^`([^`]+)`$/s);
    if (wholeBacktick) {
      const mathSource = wholeBacktick[1].trim();
      const classification = classifyBacktickContent(mathSource);
      if (classification.choice.startsWith('math') && classification.confidence === 'high') {
        addMath(rawLine, mathSource, /\\begin\{(?:aligned|align|matrix|cases)/.test(mathSource) ? 'aligned' : 'display', index + 1);
      } else if (classification.choice === 'code' && classification.confidence === 'high') {
        blocks.push({ id: idFactory(), type: 'code', text: rawLine, codeSnippet: mathSource });
        counts.code += 1;
      } else {
        const blockId = idFactory();
        blocks.push({ id: blockId, type: 'code', text: rawLine, codeSnippet: mathSource });
        counts.code += 1;
        ambiguities.push({
          id: blockId,
          source: mathSource,
          line: index + 1,
          reason: 'Backtick content does not contain enough evidence to distinguish mathematics from code.',
          suggestedChoice: classification.choice
        });
      }
      index += 1;
      continue;
    }

    const parts = rawLine.split(/(`[^`\n]+`)/g).filter(Boolean);
    if (parts.length > 1) {
      for (const part of parts) {
        const token = part.match(/^`([^`]+)`$/);
        if (!token) {
          blocks.push({ id: idFactory(), type: 'paragraph', text: part, semanticRole: /^(Therefore|Answer|Hence)\b/i.test(part.trim()) ? 'answer' : 'explanation' });
          counts.paragraphs += 1;
          continue;
        }
        const classification = classifyBacktickContent(token[1]);
        if (classification.choice === 'math-inline' && classification.confidence === 'high') addMath(part, token[1].trim(), 'inline', index + 1);
        else {
          const id = idFactory();
          const type = classification.choice === 'code' ? 'code' : 'paragraph';
          blocks.push({ id, type, text: part, codeSnippet: type === 'code' ? token[1] : undefined });
          if (type === 'code') counts.code += 1;
          else counts.paragraphs += 1;
          ambiguities.push({
            id,
            source: token[1],
            line: index + 1,
            reason: 'Inline backtick content has low mathematical confidence.',
            suggestedChoice: classification.choice
          });
        }
      }
    } else {
      blocks.push({
        id: idFactory(),
        type: 'paragraph',
        text: rawLine,
        semanticRole: /^(Therefore|Answer|Hence)\b/i.test(trimmed) ? 'answer' : /^(Note|Warning)\b/i.test(trimmed) ? 'note' : 'explanation'
      });
      counts.paragraphs += 1;
    }
    if (/^Solve for\s*[:.]?$/i.test(trimmed)) warnings.push({ line: index + 1, message: 'Possible missing variable after “Solve for”.' });
    if (/^The denominators are\s*[:.]?$/i.test(trimmed)) warnings.push({ line: index + 1, message: 'Possible missing values after “The denominators are”.' });
    if (/^Multiply every term by\s*[:.]?$/i.test(trimmed)) warnings.push({ line: index + 1, message: 'Possible missing multiplier after “Multiply every term by”.' });
    if (/^Divide both sides by\s*[:.]?$/i.test(trimmed)) warnings.push({ line: index + 1, message: 'Possible missing divisor after “Divide both sides by”.' });
    if (/<script\b|on\w+\s*=|javascript:/i.test(rawLine)) {
      warnings.push({ line: index + 1, message: 'Potentially unsafe pasted markup was preserved as inert text.' });
    }
    index += 1;
  }
  return {
    originalSource: source,
    blocks,
    ambiguities,
    warnings,
    counts,
    requiresReview: ambiguities.length > 0 || warnings.length > 0 || counts.accounting > 0 || blocks.length > 12
  };
}

export function applyAmbiguityChoice(block: ContentBlock, choice: PasteAmbiguityChoice): ContentBlock {
  const source = block.codeSnippet ?? block.text.replace(/^`|`$/g, '');
  if (choice === 'math-inline' || choice === 'math-display') {
    const mode = choice === 'math-inline' ? 'inline' : 'display';
    return { ...block, type: choice, latexFormula: source, mathData: createMathData(source, mode), codeSnippet: undefined };
  }
  if (choice === 'code') return { ...block, type: 'code', codeSnippet: source, mathData: undefined, latexFormula: undefined };
  return { ...block, type: 'paragraph', text: block.text, codeSnippet: undefined, mathData: undefined, latexFormula: undefined };
}
