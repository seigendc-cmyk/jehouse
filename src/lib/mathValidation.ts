import { MathBlockData } from '../types';

export const MAX_MATH_SOURCE_LENGTH = 10_000;
const UNSAFE_LATEX = /\\(?:def|edef|gdef|xdef|newcommand|renewcommand|providecommand|require|includegraphics|href|url|htmlClass|htmlId|htmlStyle|htmlData)\b/i;
const SUPPORTED_COMMANDS = new Set([
  'frac', 'dfrac', 'tfrac', 'boxed', 'sqrt', 'text', 'left', 'right', 'begin', 'end',
  'sum', 'prod', 'int', 'iint', 'iiint', 'oint', 'lim', 'times', 'div', 'cdot', 'overline',
  'underline', 'mathbf', 'mathrm', 'mathit', 'mathbb', 'mathcal', 'operatorname', 'quad', 'qquad',
  'implies', 'iff', 'le', 'leq', 'ge', 'geq', 'ne', 'neq', 'approx', 'equiv', 'pm', 'mp',
  'infty', 'partial', 'nabla', 'sin', 'cos', 'tan', 'log', 'ln', 'exp', 'vec', 'hat', 'bar',
  'alpha', 'beta', 'gamma', 'delta', 'theta', 'lambda', 'mu', 'pi', 'sigma', 'phi', 'omega',
  'Gamma', 'Delta', 'Theta', 'Lambda', 'Pi', 'Sigma', 'Phi', 'Omega', 'ldots', 'cdots', 'vdots',
  'ddots', 'cases', 'array', 'matrix', 'pmatrix', 'bmatrix', 'vmatrix', 'aligned', 'align',
  'textstyle', 'displaystyle', 'scriptstyle', 'scriptscriptstyle', 'space', ',', ';', '!', ' '
]);

export interface MathValidationResult {
  status: MathBlockData['parseStatus'];
  message?: string;
  unsupportedCommands: string[];
}

export function validateMathSource(source: string): MathValidationResult {
  const trimmed = source.trim();
  if (!trimmed) return { status: 'invalid', message: 'Equation source is empty.', unsupportedCommands: [] };
  if (trimmed.length > MAX_MATH_SOURCE_LENGTH) {
    return {
      status: 'invalid',
      message: `Equation exceeds the ${MAX_MATH_SOURCE_LENGTH.toLocaleString()} character safety limit.`,
      unsupportedCommands: []
    };
  }
  if (UNSAFE_LATEX.test(trimmed)) {
    const unsupportedCommands = Array.from(trimmed.matchAll(/\\[A-Za-z]+/g))
      .map(([command]) => command)
      .filter((command) => UNSAFE_LATEX.test(command));
    return {
      status: 'invalid',
      message: 'This equation contains a command disabled by the safe publishing profile.',
      unsupportedCommands: [...new Set(unsupportedCommands)]
    };
  }
  let depth = 0;
  let maximumDepth = 0;
  for (const character of trimmed) {
    if (character === '{') maximumDepth = Math.max(maximumDepth, ++depth);
    if (character === '}') depth -= 1;
    if (depth < 0) break;
  }
  if (depth !== 0) {
    return { status: 'invalid', message: 'Equation contains unbalanced braces.', unsupportedCommands: [] };
  }
  if (maximumDepth > 64) {
    return { status: 'invalid', message: 'Equation nesting exceeds the safe rendering limit.', unsupportedCommands: [] };
  }
  const unsupportedCommands = Array.from(trimmed.matchAll(/(?<!\\)\\([A-Za-z]+|[,;! ])/g))
    .map((match) => match[1])
    .filter((command) => !SUPPORTED_COMMANDS.has(command));
  if (unsupportedCommands.length > 0) {
    return {
      status: 'invalid',
      message: `Unsupported LaTeX command${unsupportedCommands.length === 1 ? '' : 's'}: ${[...new Set(unsupportedCommands)].map((command) => `\\${command}`).join(', ')}.`,
      unsupportedCommands: [...new Set(unsupportedCommands)].map((command) => `\\${command}`)
    };
  }
  return { status: 'valid', unsupportedCommands: [] };
}

export function createMathData(
  source: string,
  displayMode: MathBlockData['displayMode'],
  overrides: Partial<MathBlockData> = {}
): MathBlockData {
  const validation = validateMathSource(source);
  return {
    source,
    sourceFormat: 'latex',
    displayMode,
    parseStatus: validation.status,
    parseMessage: validation.message,
    ...overrides
  };
}

export function mathSourceForBlock(block: {
  mathData?: MathBlockData;
  latexFormula?: string;
  text: string;
}): string {
  return block.mathData?.source ?? block.latexFormula ?? block.text;
}
