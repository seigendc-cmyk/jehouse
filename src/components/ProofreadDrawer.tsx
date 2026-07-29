import React from 'react';
import { Sparkles, Check, X, AlertCircle, RefreshCw } from 'lucide-react';
import { ProofreadIssue } from '../types';

interface ProofreadDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  issues: ProofreadIssue[];
  onApplyCorrection: (issue: ProofreadIssue) => void;
  onRunProofread: () => void;
}

export const ProofreadDrawer: React.FC<ProofreadDrawerProps> = ({
  isOpen,
  onClose,
  isLoading,
  issues,
  onApplyCorrection,
  onRunProofread,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col transition-all select-none">
      
      {/* Header */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/80">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-orange-500" />
          <div>
            <h2 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">AI Spell Check & Proofreader</h2>
            <p className="text-[11px] text-zinc-500">Grammar, spelling, and style analysis</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Drawer Body */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
            {issues.length} Issues Identified
          </span>
          <button
            onClick={onRunProofread}
            disabled={isLoading}
            className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 font-semibold hover:underline disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Re-analyze</span>
          </button>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-zinc-500 space-y-2">
            <Sparkles className="w-8 h-8 text-orange-500 animate-bounce mx-auto" />
            <p>Analyzing text with Gemini AI engine...</p>
          </div>
        ) : issues.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-500 space-y-2">
            <Check className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="font-bold text-zinc-800 dark:text-zinc-200">Pristine Quality!</p>
            <p>No spelling or grammar issues found in active text block.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {issues.map((issue, idx) => (
              <div
                key={idx}
                className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-lg border border-zinc-200 dark:border-zinc-700/80 text-xs space-y-2"
              >
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                  <span>{issue.type} issue</span>
                </div>

                <div className="font-serif">
                  <span className="line-through text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-1 rounded mr-1">
                    {issue.originalText}
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-1 rounded">
                    {issue.correction}
                  </span>
                </div>

                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {issue.explanation}
                </p>

                <button
                  onClick={() => onApplyCorrection(issue)}
                  className="w-full mt-1 py-1 px-2 rounded bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs flex items-center justify-center gap-1 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Apply Correction</span>
                </button>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};
