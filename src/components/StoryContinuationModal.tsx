import React, { useState } from 'react';
import { Wand2, X, Sparkles, Send } from 'lucide-react';

interface StoryContinuationModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapterTitle: string;
  onApplyContinuation: (text: string) => void;
}

export const StoryContinuationModal: React.FC<StoryContinuationModalProps> = ({
  isOpen,
  onClose,
  chapterTitle,
  onApplyContinuation,
}) => {
  const [instruction, setInstruction] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewText, setPreviewText] = useState('');

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/continue-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterTitle,
          currentContent: 'The chapter continues with expanding narrative depth...',
          userInstruction: instruction || 'Continue the scene with rich detail and compelling story pacing.'
        })
      });
      const data = await res.json();
      setPreviewText(data.continuation || 'The narrative extends forward naturally...');
    } catch (e) {
      console.error(e);
      setPreviewText('Failed to generate continuation. Please check network connectivity.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-xl w-full shadow-2xl p-6 space-y-4 text-zinc-900 dark:text-zinc-100">
        
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm">AI Storyteller & Co-Author</h2>
              <p className="text-xs text-zinc-500">Continued story telling & scene extension</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <label className="font-bold text-xs text-zinc-700 dark:text-zinc-300 block mb-1">
            Author's Direction / Prompt for Extension
          </label>
          <input
            type="text"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="e.g., Introduce a surprise technological discovery or deepen the analytical narrative..."
            className="w-full p-2.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded focus:outline-hidden text-zinc-900 dark:text-zinc-100"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full py-2 px-4 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50"
        >
          <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? 'Co-Authoring with Gemini AI...' : 'Generate Story Continuation'}</span>
        </button>

        {previewText && (
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-serif leading-relaxed max-h-48 overflow-y-auto space-y-2">
            <div className="font-bold text-orange-600 text-[10px] uppercase tracking-wider font-sans">
              AI Continuation Draft
            </div>
            <p>{previewText}</p>

            <button
              onClick={() => {
                onApplyContinuation(previewText);
                onClose();
              }}
              className="mt-2 w-full py-1.5 px-3 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-bold text-xs flex items-center justify-center gap-1"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Insert Into Chapter</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
