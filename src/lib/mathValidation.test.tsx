import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { EquationRenderer } from '../components/blocks/EquationRenderer';
import { createMathData, validateMathSource } from './mathValidation';

describe('safe local mathematics rendering', () => {
  const validSources = [
    '\\frac{a}{b}',
    '\\boxed{x=4}',
    '\\sqrt{x}',
    'x^2',
    'x_n',
    '\\begin{aligned}2x+3&=11\\\\2x&=8\\end{aligned}',
    '\\begin{matrix}a&b\\\\c&d\\end{matrix}',
    '\\sum_{i=1}^{n}i',
    '\\int_a^b f(x)\\,dx',
    '\\text{Gross Profit}=\\text{Sales}-\\text{Cost of Sales}'
  ];

  it.each(validSources)('validates %s', (source) => {
    expect(validateMathSource(source).status).toBe('valid');
  });

  it('returns a readable fallback for invalid source without throwing', () => {
    const data = createMathData('\\frac{a', 'display');
    const html = renderToStaticMarkup(<EquationRenderer data={data} />);
    expect(data.parseStatus).toBe('invalid');
    expect(html).toContain('Equation needs attention');
    expect(html).toContain('\\frac{a');
  });

  it('rejects unsafe macro and URL commands while preserving source', () => {
    const source = '\\href{javascript:alert(1)}{x}';
    const result = validateMathSource(source);
    expect(result.status).toBe('invalid');
    expect(result.unsupportedCommands).toContain('\\href');
    expect(source).toContain('javascript:');
  });

  it('renders semantic MathML and exposes editable LaTeX source metadata', () => {
    const html = renderToStaticMarkup(<EquationRenderer data={createMathData('\\frac{1}{2}', 'display', { accessibilityText: 'one half' })} />);
    expect(html).toContain('<math');
    expect(html).toContain('data-latex-source="\\frac{1}{2}"');
    expect(html).toContain('aria-label="one half"');
  });
});
