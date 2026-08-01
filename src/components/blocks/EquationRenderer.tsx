import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { MathBlockData } from '../../types';
import { createMathData, validateMathSource } from '../../lib/mathValidation';

const renderCache = new Map<string, string>();

export function EquationRenderer({
  formula,
  data,
  displayMode
}: {
  formula?: string;
  data?: MathBlockData;
  displayMode?: boolean;
}) {
  const resolved = data ?? createMathData(formula || 'E = mc^2', displayMode === false ? 'inline' : 'display');
  const validation = validateMathSource(resolved.source);
  const cacheKey = `${resolved.displayMode}:${resolved.source}`;
  const markup = useMemo(() => {
    if (validation.status === 'invalid') return null;
    const cached = renderCache.get(cacheKey);
    if (cached) return cached;
    try {
      const rendered = katex.renderToString(resolved.source, {
        displayMode: resolved.displayMode !== 'inline',
        throwOnError: true,
        strict: 'warn',
        trust: false,
        maxExpand: 1_000,
        output: 'htmlAndMathml'
      });
      if (renderCache.size > 250) renderCache.delete(renderCache.keys().next().value ?? '');
      renderCache.set(cacheKey, rendered);
      return rendered;
    } catch {
      return null;
    }
  }, [cacheKey, resolved.displayMode, resolved.source, validation.status]);

  if (!markup) {
    return (
      <span className="block rounded border border-amber-400/60 bg-amber-50 p-2 font-mono text-sm text-amber-900" role="alert">
        <span className="block text-xs font-semibold">Equation needs attention</span>
        <span>{resolved.source}</span>
        <span className="block text-xs">{validation.message}</span>
      </span>
    );
  }
  return (
    <span
      className={resolved.displayMode === 'inline' ? 'inline-math' : 'block-math'}
      tabIndex={0}
      role="math"
      aria-label={resolved.accessibilityText || resolved.source}
      data-latex-source={resolved.source}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}
