import React from 'react';
import { Chapter, FrontMatter } from '../types';
import { generateIndexOfTerms } from '../lib/indexUtils';
import { Trash2, Tag, BookMarked } from 'lucide-react';

interface IndexOfTermsProps {
  chapters: Chapter[];
  frontMatter: FrontMatter;
  onRemoveTerm?: (termToRemove: string) => void;
  interactive?: boolean;
  className?: string;
}

export const IndexOfTerms: React.FC<IndexOfTermsProps> = ({
  chapters,
  frontMatter,
  onRemoveTerm,
  interactive = false,
  className = '',
}) => {
  const indexConfig = frontMatter.indexConfig || {};
  const title = indexConfig.title || 'Index of Terms & Keywords';
  const style = indexConfig.style || 'columns-2';

  const letterGroups = generateIndexOfTerms(chapters, frontMatter);

  const columnClass =
    style === 'columns-3'
      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
      : style === 'compact'
      ? 'grid grid-cols-1 sm:grid-cols-2 gap-4'
      : 'grid grid-cols-1 md:grid-cols-2 gap-6';

  if (letterGroups.length === 0) {
    return (
      <div className={`text-center py-8 text-zinc-500 font-serif ${className}`}>
        <p className="text-sm font-semibold">No terms indexed yet.</p>
        <p className="text-xs text-zinc-400 mt-1">Add keywords or enable auto-scan to generate the index of terms.</p>
      </div>
    );
  }

  return (
    <div className={`w-full font-serif ${className}`}>
      {/* Title Header */}
      <div className="text-center mb-8 pb-3 border-b-2 border-zinc-800 dark:border-zinc-200">
        <h2 className="text-2xl font-serif font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center justify-center gap-2">
          <BookMarked className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          {title}
        </h2>
        <p className="text-xs font-serif italic text-zinc-500 dark:text-zinc-400 mt-1">
          Alphabetical index of key terminology & page references across chapters
        </p>
      </div>

      {/* Index Columns Layout */}
      <div className={columnClass}>
        {letterGroups.map((group) => (
          <div key={group.letter} className="space-y-2 break-inside-avoid">
            {/* Initial Letter Badge Header */}
            <div className="flex items-center gap-2 border-b-2 border-orange-500/40 pb-1 mb-2">
              <span className="text-lg font-extrabold font-serif text-orange-600 dark:text-orange-400">
                {group.letter}
              </span>
              <span className="h-[1px] flex-1 bg-zinc-200 dark:bg-zinc-800" />
            </div>

            {/* Terms inside Letter Group */}
            <ul className="space-y-2 text-xs">
              {group.terms.map((item) => (
                <li
                  key={item.term}
                  className="flex items-baseline justify-between group hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40 p-1 rounded transition-colors"
                >
                  <div className="flex items-center gap-1.5 flex-1 pr-2 truncate">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                      {item.term}
                    </span>
                    {interactive && onRemoveTerm && (
                      <button
                        onClick={() => onRemoveTerm(item.term)}
                        className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition-opacity p-0.5"
                        title={`Remove "${item.term}" from index`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Dotted Leader Line */}
                  <div className="flex-1 mx-2 border-b border-dotted border-zinc-300 dark:border-zinc-700 self-baseline min-w-[12px]" />

                  {/* Page Numbers */}
                  <div className="shrink-0 font-mono text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                    {item.pages.join(', ')}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};
