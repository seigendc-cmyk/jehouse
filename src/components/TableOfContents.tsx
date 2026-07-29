import React from 'react';
import { Chapter, FrontMatter, TocStyle } from '../types';
import { calculateTocData } from '../lib/tocUtils';
import { ListTree, Edit2, Hash, Layers } from 'lucide-react';
import { getChapterDisplayLabel } from '../lib/documentDisplayLabel';

interface TableOfContentsProps {
  chapters: Chapter[];
  frontMatter: FrontMatter;
  onUpdateTocConfig?: (updatedConfig: NonNullable<FrontMatter['tocConfig']>) => void;
  interactive?: boolean; // if true, allows inline editing of page numbers
  className?: string;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  chapters,
  frontMatter,
  onUpdateTocConfig,
  interactive = false,
  className = '',
}) => {
  const tocConfig = frontMatter.tocConfig || {};
  const style: TocStyle = tocConfig.style || 'dotted';
  const showSubheadings = tocConfig.showSubheadings ?? true;
  const showSubtitles = tocConfig.showChapterSubtitles ?? true;
  const title = tocConfig.title || 'Table of Contents';

  const tocData = calculateTocData(chapters, frontMatter);

  const handlePageChange = (chapterId: string, val: string) => {
    const num = parseInt(val, 10);
    if (isNaN(num)) return;
    const currentCustom = { ...(tocConfig.customChapterPages || {}) };
    currentCustom[chapterId] = num;
    onUpdateTocConfig?.({
      ...tocConfig,
      customChapterPages: currentCustom,
    });
  };

  return (
    <div className={`w-full font-serif ${className}`}>
      {/* Title Header */}
      <div className="text-center mb-8 pb-3 border-b-2 border-zinc-800 dark:border-zinc-200">
        <h2 className="text-2xl font-serif font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
          {title}
        </h2>
        {showSubtitles && (
          <p className="text-xs font-serif italic text-zinc-500 dark:text-zinc-400 mt-1">
            Manuscript Chapter Index & Organization
          </p>
        )}
      </div>

      {/* Chapters List */}
      <div className="space-y-3">
        {tocData.chapters.map((ch) => (
          <div key={ch.id} className="space-y-1">
            {/* Main Chapter Entry Row */}
            <div className="flex items-baseline justify-between text-sm group">
              <div className="flex-1 pr-2 truncate">
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  {getChapterDisplayLabel(ch.number, ch.title)}
                </span>
                {showSubtitles && ch.subtitle && (
                  <span className="block text-xs italic font-normal text-zinc-500 dark:text-zinc-400 mt-0.5 pl-4 truncate">
                    {ch.subtitle}
                  </span>
                )}
              </div>

              {/* Leader Line style */}
              {style === 'dotted' && (
                <div className="flex-1 mx-2 border-b-2 border-dotted border-zinc-300 dark:border-zinc-700 self-baseline min-w-[20px]" />
              )}
              {style === 'academic' && (
                <div className="flex-1 mx-2 border-b border-zinc-400 dark:border-zinc-600 self-baseline min-w-[20px]" />
              )}
              {style === 'clean' && <div className="flex-1 min-w-[20px]" />}
              {style === 'modern' && (
                <div className="flex-1 mx-2 h-[1px] bg-gradient-to-r from-orange-500/40 via-zinc-300 dark:via-zinc-700 to-transparent self-center min-w-[20px]" />
              )}

              {/* Page Number Column */}
              <div className="shrink-0 font-mono text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                {interactive ? (
                  <div className="flex items-center gap-1 group/edit">
                    <span className="text-[10px] text-zinc-400">pg</span>
                    <input
                      type="number"
                      value={ch.pageNumber}
                      onChange={(e) => handlePageChange(ch.id, e.target.value)}
                      className="w-12 px-1 py-0.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-center text-xs font-bold font-mono focus:ring-2 focus:ring-orange-500/50 focus:outline-hidden"
                      title="Click to override page number"
                    />
                  </div>
                ) : (
                  <span>{ch.pageNumber}</span>
                )}
              </div>
            </div>

            {/* Subheadings inside Chapter */}
            {showSubheadings && ch.subheadings.length > 0 && (
              <div className="pl-6 space-y-1 border-l-2 border-orange-500/30 my-1">
                {ch.subheadings.map((sub) => (
                  <div key={sub.id} className="flex items-baseline justify-between text-xs text-zinc-600 dark:text-zinc-400">
                    <span className={`truncate pr-2 ${sub.type === 'heading' ? 'font-semibold text-zinc-800 dark:text-zinc-200' : 'italic'}`}>
                      {sub.text}
                    </span>
                    {style === 'dotted' && (
                      <div className="flex-1 mx-2 border-b border-dotted border-zinc-200 dark:border-zinc-800 self-baseline" />
                    )}
                    <span className="font-mono text-[11px] text-zinc-400 shrink-0">
                      {sub.pageNumber}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
