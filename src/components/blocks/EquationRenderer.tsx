import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export function EquationRenderer({ formula }: { formula: string }) {
  try {
    const markup = katex.renderToString(formula || 'E = mc^2', {
      displayMode: true,
      throwOnError: false
    });
    return <div dangerouslySetInnerHTML={{ __html: markup }} />;
  } catch {
    return <span className="font-mono text-red-500">{formula}</span>;
  }
}
