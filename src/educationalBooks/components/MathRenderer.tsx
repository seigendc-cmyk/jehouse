import React, { useMemo } from 'react';
import katex from 'katex';

interface MathRendererProps {
  math: string;
  displayMode?: boolean;
  className?: string;
}

export const MathRenderer: React.FC<MathRendererProps> = ({
  math,
  displayMode = true,
  className = '',
}) => {
  const html = useMemo(() => {
    if (!math) return '';
    try {
      // If text contains mixed latex delimiters or plain latex
      const cleanedMath = math.trim();
      return katex.renderToString(cleanedMath, {
        throwOnError: false,
        displayMode: displayMode,
        output: 'html',
      });
    } catch (err) {
      console.warn('KaTeX rendering error:', err);
      return `<span class="font-mono">${math}</span>`;
    }
  }, [math, displayMode]);

  return (
    <span
      className={`katex-math-item inline-block ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
