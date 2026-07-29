import React from 'react';
import { Tag } from 'lucide-react';
import { CaptionData } from '../../types';

interface CaptionBlockProps {
  data?: CaptionData;
  onChange: (updated: CaptionData) => void;
}

export const CaptionBlock: React.FC<CaptionBlockProps> = ({ data, onChange }) => {
  const caption: CaptionData = data || {
    type: 'Figure',
    number: '1.1',
    text: 'Schematic illustration of high-density algorithmic ledger processing nodes.',
  };

  const updateType = (type: 'Figure' | 'Table' | 'Graph' | 'Equation' | 'Listing') => {
    onChange({ ...caption, type });
  };

  const updateNumber = (number: string) => {
    onChange({ ...caption, number });
  };

  const updateText = (text: string) => {
    onChange({ ...caption, text });
  };

  return (
    <div className="bg-zinc-50 dark:bg-[#1A1A1A] border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-3 space-y-2 select-none">
      
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Tag className="w-3.5 h-3.5 text-[#FF6B00]" />
        
        {/* Caption Prefix Type */}
        <select
          value={caption.type}
          onChange={(e) => updateType(e.target.value as any)}
          className="bg-white dark:bg-[#262626] border border-zinc-300 dark:border-[#444] text-zinc-800 dark:text-zinc-200 rounded px-2 py-0.5 text-xs font-bold focus:outline-hidden cursor-pointer"
        >
          <option value="Figure">Figure</option>
          <option value="Table">Table</option>
          <option value="Graph">Graph</option>
          <option value="Equation">Equation</option>
          <option value="Listing">Listing</option>
        </select>

        {/* Caption Numbering */}
        <input
          type="text"
          value={caption.number || ''}
          onChange={(e) => updateNumber(e.target.value)}
          className="w-16 bg-white dark:bg-[#262626] border border-zinc-300 dark:border-[#444] text-zinc-800 dark:text-zinc-200 rounded px-2 py-0.5 text-xs text-center font-mono font-bold"
          placeholder="1.1"
        />

        <span className="text-zinc-400 font-bold">:</span>
      </div>

      {/* Caption Text Input */}
      <textarea
        value={caption.text}
        onChange={(e) => updateText(e.target.value)}
        rows={2}
        className="w-full bg-transparent border-none focus:outline-hidden italic text-xs text-zinc-700 dark:text-zinc-300 font-serif leading-relaxed resize-y"
        placeholder="Type figure or table caption description here..."
      />

    </div>
  );
};
