import React, { useState } from 'react';
import { 
  FileText, 
  Layers, 
  Plus, 
  Trash2, 
  SlidersHorizontal, 
  ShieldAlert, 
  Bookmark, 
  FileSpreadsheet, 
  HelpCircle,
  GripVertical,
  Tv,
  GraduationCap,
  GitCompare,
  CheckCheck,
  XCircle,
  Eye,
  EyeOff,
  Check,
  X,
  Sparkles,
  Building2,
  Image as ImageIcon,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { BookProject, Chapter, TrackedChange } from '../types';
import {
  localSaveStatusLabel,
  ProjectSaveState
} from '../persistence/localSaveCoordinator';

export type SidebarTab = 'editor' | 'cover' | 'frontmatter' | 'watermark' | 'exportSettings';

interface SidebarProps {
  project: BookProject;
  activeTab: SidebarTab;
  activeChapterId: string;
  onSelectTab: (tab: SidebarTab) => void;
  onPreloadTab?: (tab: SidebarTab) => void;
  onSelectChapter: (chapterId: string) => void;
  onAddChapter: () => void;
  onDeleteChapter: (chapterId: string) => void;
  onReorderChapters?: (newChapters: Chapter[]) => void;
  onOpenSeriesManager?: () => void;
  onOpenEducationalStudio?: () => void;
  onOpenCompanyProfile?: () => void;
  onOpenDesignStudio?: () => void;
  onOpenImageGallery?: () => void;
  isReviewModeActive?: boolean;
  showReviewMarkup?: boolean;
  onToggleReviewMode?: () => void;
  onToggleShowMarkup?: () => void;
  onAcceptAllChanges?: () => void;
  onRejectAllChanges?: () => void;
  onAcceptSingleChange?: (blockId: string, changeId?: string) => void;
  onRejectSingleChange?: (blockId: string, changeId?: string) => void;
  saveState: ProjectSaveState;
  isOnline: boolean;
  onRetrySave?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  project,
  activeTab,
  activeChapterId,
  onSelectTab,
  onPreloadTab,
  onSelectChapter,
  onAddChapter,
  onDeleteChapter,
  onReorderChapters,
  onOpenSeriesManager,
  onOpenEducationalStudio,
  onOpenCompanyProfile,
  onOpenDesignStudio,
  onOpenImageGallery,
  isReviewModeActive = false,
  showReviewMarkup = true,
  onToggleReviewMode,
  onToggleShowMarkup,
  onAcceptAllChanges,
  onRejectAllChanges,
  onAcceptSingleChange,
  onRejectSingleChange,
  saveState,
  isOnline,
  onRetrySave
}) => {
  // Drag and drop state for chapter reordering
  const [draggedChapterIndex, setDraggedChapterIndex] = useState<number | null>(null);
  const [dragOverChapterIndex, setDragOverChapterIndex] = useState<number | null>(null);
  // Calculate review mode stats
  const activeChapter = project.chapters.find((c) => c.id === activeChapterId);
  
  // Pending changes in active chapter
  const pendingBlockChanges: { blockId: string; change: TrackedChange }[] = [];
  activeChapter?.blocks.forEach((b) => {
    b.trackedChanges?.forEach((tc) => {
      if (tc.status === 'pending') {
        pendingBlockChanges.push({ blockId: b.id, change: tc });
      }
    });
  });

  const insertedBlocks = activeChapter?.blocks.filter((b) => b.isInsertedInReview) || [];
  const deletedBlocks = activeChapter?.blocks.filter((b) => b.isDeletedInReview) || [];

  const totalInsertions = pendingBlockChanges.filter((p) => p.change.type === 'insertion').length + insertedBlocks.length;
  const totalDeletions = pendingBlockChanges.filter((p) => p.change.type === 'deletion').length + deletedBlocks.length;
  const totalPending = totalInsertions + totalDeletions;

  return (
    <aside className="fixed top-[4.25rem] left-2.5 bottom-[2.5rem] w-60 bg-[#262626]/90 backdrop-blur-md text-gray-300 border border-[#444444] rounded-xl shadow-2xl flex flex-col z-30 select-none overflow-hidden transition-all ring-1 ring-white/10 font-sans">
      {/* Navigation Groups */}
      <div className="p-3 space-y-5 overflow-y-auto flex-1">
        
        {/* Review Mode & Track Changes Controls Section */}
        <div className="bg-[#1e1e1e] border border-orange-500/30 rounded-lg p-2.5 shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-orange-400">
              <GitCompare className="w-4 h-4 text-orange-500" />
              <span>Review Mode</span>
            </div>
            {isReviewModeActive ? (
              <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Track ON
              </span>
            ) : (
              <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 bg-gray-800 px-1.5 py-0.5 rounded">
                OFF
              </span>
            )}
          </div>

          {/* Toggle Button */}
          <button
            onClick={onToggleReviewMode}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-bold transition-all ${
              isReviewModeActive
                ? 'bg-orange-500 text-black shadow-md shadow-orange-500/20'
                : 'bg-[#333333] text-gray-300 hover:bg-[#444444]'
            }`}
          >
            <span>{isReviewModeActive ? 'Track Changes Active' : 'Enable Track Changes'}</span>
            <div className={`w-7 h-4 flex items-center rounded-full p-0.5 transition-colors ${isReviewModeActive ? 'bg-black/30 justify-end' : 'bg-gray-600 justify-start'}`}>
              <div className="w-3 h-3 rounded-full bg-white shadow-sm" />
            </div>
          </button>

          {/* Controls when Review Mode / Track Changes is Active */}
          {isReviewModeActive && (
            <div className="mt-2.5 pt-2 border-t border-gray-700/60 space-y-2 text-[11px]">
              
              {/* Show/Hide Markup Diff Toggle */}
              <button
                onClick={onToggleShowMarkup}
                className="w-full flex items-center justify-between px-2 py-1 bg-zinc-800/80 hover:bg-zinc-700 rounded text-gray-300 transition-colors"
                title="Toggle visual diff highlights"
              >
                <div className="flex items-center gap-1.5">
                  {showReviewMarkup ? <Eye className="w-3.5 h-3.5 text-cyan-400" /> : <EyeOff className="w-3.5 h-3.5 text-gray-500" />}
                  <span>{showReviewMarkup ? 'Showing Markup' : 'Showing Final View'}</span>
                </div>
                <span className="text-[10px] text-cyan-400 font-mono font-bold">{showReviewMarkup ? 'DIFF' : 'FINAL'}</span>
              </button>

              {/* Stats Summary */}
              <div className="flex items-center justify-between px-1 text-[10px] font-mono">
                <span className="text-gray-400">Pending Changes:</span>
                <div className="flex items-center gap-1">
                  <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1 rounded">+{totalInsertions}</span>
                  <span className="text-rose-400 font-bold bg-rose-500/10 px-1 rounded">-{totalDeletions}</span>
                </div>
              </div>

              {/* Accept / Reject All Buttons */}
              {totalPending > 0 && (
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <button
                    onClick={onAcceptAllChanges}
                    className="flex items-center justify-center gap-1 px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-[10px] transition-colors shadow"
                    title="Accept all pending changes in chapter"
                  >
                    <CheckCheck className="w-3 h-3" />
                    <span>Accept All</span>
                  </button>
                  <button
                    onClick={onRejectAllChanges}
                    className="flex items-center justify-center gap-1 px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded font-bold text-[10px] transition-colors shadow"
                    title="Reject all pending changes in chapter"
                  >
                    <XCircle className="w-3 h-3" />
                    <span>Reject All</span>
                  </button>
                </div>
              )}

              {/* Mini List of Pending Changes */}
              {pendingBlockChanges.length > 0 && (
                <div className="mt-2 space-y-1 max-h-32 overflow-y-auto pr-0.5 text-[10px]">
                  <div className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Chapter Revisions:</div>
                  {pendingBlockChanges.slice(0, 4).map(({ blockId, change }) => (
                    <div
                      key={change.id}
                      className="p-1.5 bg-zinc-900/80 rounded border border-gray-700/80 flex items-center justify-between gap-1"
                    >
                      <div className="truncate flex-1">
                        <span className={`font-bold mr-1 ${change.type === 'insertion' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {change.type === 'insertion' ? '+ Ins' : '- Del'}
                        </span>
                        <span className="text-gray-300 italic truncate font-sans">
                          "{change.text || change.originalText}"
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          onClick={() => onAcceptSingleChange && onAcceptSingleChange(blockId, change.id)}
                          className="p-0.5 hover:bg-emerald-500/30 text-emerald-400 rounded"
                          title="Accept change"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onRejectSingleChange && onRejectSingleChange(blockId, change.id)}
                          className="p-0.5 hover:bg-rose-500/30 text-rose-400 rounded"
                          title="Reject change"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {pendingBlockChanges.length > 4 && (
                    <div className="text-[9px] text-gray-500 text-center italic">
                      +{pendingBlockChanges.length - 4} more changes
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Project Structure */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-300 mb-2 px-2">
            Project Structure
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => onSelectTab('cover')}
              onMouseEnter={() => onPreloadTab?.('cover')}
              onFocus={() => onPreloadTab?.('cover')}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                activeTab === 'cover' 
                  ? 'bg-[#333333] text-[#FF6B00] font-bold' 
                  : 'hover:bg-[#333333] text-zinc-200 hover:text-white'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span>Book Cover Design</span>
            </button>

            {onOpenSeriesManager && (
              <button
                onClick={onOpenSeriesManager}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded text-xs font-medium transition-colors hover:bg-[#333333] text-zinc-200 hover:text-white group"
              >
                <div className="flex items-center gap-2.5">
                  <Tv className="w-3.5 h-3.5 text-orange-400" />
                  <span className="font-bold">Series & Seasons</span>
                </div>
                {project.series?.isSeries && (
                  <span className="text-[10px] font-mono font-bold bg-orange-500/20 text-orange-400 px-1.5 py-0.2 rounded border border-orange-500/30">
                    {project.series.seasons.length}S
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => onSelectTab('frontmatter')}
              onMouseEnter={() => onPreloadTab?.('frontmatter')}
              onFocus={() => onPreloadTab?.('frontmatter')}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                activeTab === 'frontmatter' 
                  ? 'bg-[#333333] text-[#FF6B00] font-bold' 
                  : 'hover:bg-[#333333] text-zinc-200 hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span>Front Matter / Preamble</span>
            </button>
          </nav>
        </div>

        {/* Chapters Section */}
        <div>
          <div className="flex items-center justify-between px-2 mb-1.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <span>Chapters ({project.chapters.length})</span>
              <span className="text-[9px] text-zinc-500 font-normal italic">(Drag to reorder)</span>
            </div>
            <button
              onClick={onAddChapter}
              className="p-1 rounded bg-[#333333] hover:bg-[#FF6B00] hover:text-black text-zinc-200 transition-colors"
              title="Add New Chapter"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <nav className="space-y-1">
            {project.chapters.map((ch, index) => {
              const isActive = activeTab === 'editor' && activeChapterId === ch.id;
              const isBeingDragged = draggedChapterIndex === index;
              const isDragOver = dragOverChapterIndex === index;

              return (
                <div
                  key={ch.id}
                  draggable
                  onDragStart={(e) => {
                    e.stopPropagation();
                    setDraggedChapterIndex(index);
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', index.toString());
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.dataTransfer.dropEffect = 'move';
                    if (dragOverChapterIndex !== index) {
                      setDragOverChapterIndex(index);
                    }
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (dragOverChapterIndex === index) {
                      setDragOverChapterIndex(null);
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (draggedChapterIndex !== null && draggedChapterIndex !== index) {
                      const reordered = [...project.chapters];
                      const [moved] = reordered.splice(draggedChapterIndex, 1);
                      reordered.splice(index, 0, moved);
                      const renumbered = reordered.map((item, idx) => ({
                        ...item,
                        number: idx + 1
                      }));
                      if (onReorderChapters) {
                        onReorderChapters(renumbered);
                      }
                    }
                    setDraggedChapterIndex(null);
                    setDragOverChapterIndex(null);
                  }}
                  onDragEnd={() => {
                    setDraggedChapterIndex(null);
                    setDragOverChapterIndex(null);
                  }}
                  className={`group relative flex items-center justify-between px-2 py-1.5 rounded text-xs transition-all cursor-pointer ${
                    isBeingDragged
                      ? 'opacity-40 bg-[#FF6B00]/10 border-2 border-dashed border-[#FF6B00]'
                      : isDragOver
                      ? 'border-t-2 border-[#FF6B00] bg-[#FF6B00]/20 text-white font-bold'
                      : isActive
                      ? 'bg-[#333333] text-[#FF6B00] font-bold'
                      : 'hover:bg-[#333333] text-zinc-200 hover:text-white'
                  }`}
                  onClick={() => {
                    onSelectChapter(ch.id);
                    onSelectTab('editor');
                  }}
                >
                  <div className="flex items-center gap-1.5 truncate pr-1 flex-1">
                    {/* Drag Grip Handle */}
                    <GripVertical className="w-3.5 h-3.5 text-zinc-500 group-hover:text-[#FF6B00] cursor-grab active:cursor-grabbing shrink-0 transition-colors" />

                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isActive ? 'bg-[#FF6B00] text-black' : 'bg-zinc-800 text-zinc-200'}`}>
                      {ch.number}
                    </span>
                    <span className="truncate">{ch.title}</span>
                  </div>

                  {/* Chapter Actions: Up / Down arrows & Delete */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {index > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const reordered = [...project.chapters];
                          const [moved] = reordered.splice(index, 1);
                          reordered.splice(index - 1, 0, moved);
                          const renumbered = reordered.map((item, idx) => ({ ...item, number: idx + 1 }));
                          if (onReorderChapters) onReorderChapters(renumbered);
                        }}
                        className="p-0.5 text-zinc-400 hover:text-[#FF6B00] transition-colors"
                        title="Move Chapter Up"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                    )}

                    {index < project.chapters.length - 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const reordered = [...project.chapters];
                          const [moved] = reordered.splice(index, 1);
                          reordered.splice(index + 1, 0, moved);
                          const renumbered = reordered.map((item, idx) => ({ ...item, number: idx + 1 }));
                          if (onReorderChapters) onReorderChapters(renumbered);
                        }}
                        className="p-0.5 text-zinc-400 hover:text-[#FF6B00] transition-colors"
                        title="Move Chapter Down"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    )}

                    {project.chapters.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete Chapter ${ch.number}: "${ch.title}"?`)) {
                            onDeleteChapter(ch.id);
                          }
                        }}
                        className="p-0.5 text-zinc-400 hover:text-rose-400 transition-colors ml-0.5"
                        title="Delete Chapter"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Scientific & Industrial Modules */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-300 mb-2 px-2">
            Scientific & Industrial
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => onSelectTab('watermark')}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                activeTab === 'watermark' 
                  ? 'bg-[#333333] text-[#FF6B00] font-bold' 
                  : 'hover:bg-[#333333] text-zinc-200 hover:text-white'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span>Watermark Overlay</span>
            </button>

            <button
              onClick={() => onSelectTab('exportSettings')}
              onMouseEnter={() => onPreloadTab?.('exportSettings')}
              onFocus={() => onPreloadTab?.('exportSettings')}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                activeTab === 'exportSettings' 
                  ? 'bg-[#333333] text-[#FF6B00] font-bold' 
                  : 'hover:bg-[#333333] text-zinc-200 hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span>Compilation Settings</span>
            </button>

            {onOpenImageGallery && (
              <button
                onClick={onOpenImageGallery}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded text-xs font-medium transition-colors hover:bg-[#333333] text-orange-400 hover:text-orange-300 cursor-pointer mt-1 border border-orange-500/30 bg-orange-500/10"
              >
                <ImageIcon className="w-3.5 h-3.5 text-orange-400" />
                <span className="font-bold">Image Gallery & Asset Library</span>
              </button>
            )}

            {onOpenEducationalStudio && (
              <button
                onClick={onOpenEducationalStudio}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded text-xs font-medium transition-colors hover:bg-[#333333] text-orange-400 hover:text-orange-300 cursor-pointer mt-1 border border-orange-500/20 bg-orange-500/5"
              >
                <GraduationCap className="w-3.5 h-3.5 text-orange-500" />
                <span className="font-bold">Academic & Coloring Studio</span>
              </button>
            )}

            {onOpenCompanyProfile && (
              <button
                onClick={onOpenCompanyProfile}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded text-xs font-medium transition-colors hover:bg-[#333333] text-blue-400 hover:text-blue-300 cursor-pointer mt-1 border border-blue-500/20 bg-blue-500/5"
              >
                <Building2 className="w-3.5 h-3.5 text-blue-500" />
                <span className="font-bold">Company Profile Studio</span>
              </button>
            )}

            {onOpenDesignStudio && (
              <button
                onClick={onOpenDesignStudio}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded text-xs font-medium transition-colors hover:bg-[#333333] text-purple-400 hover:text-purple-300 cursor-pointer mt-1 border border-purple-500/20 bg-purple-500/5"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                <span className="font-bold">Flyers, Catalogues & Cards</span>
              </button>
            )}
          </nav>
        </div>

      </div>

      {/* Authoritative local persistence status */}
      <div className="p-3 border-t border-[#333333] bg-[#1E1E1E]">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-gray-500 uppercase font-bold">Local storage</span>
          <span className={`h-2 w-2 rounded-full ${
            saveState.status === 'error' || saveState.status === 'conflict'
              ? 'bg-red-500'
              : saveState.status === 'dirty' || saveState.status === 'saving'
                ? 'bg-amber-500'
                : 'bg-emerald-500'
          }`} />
        </div>
        <div className="text-[11px] text-gray-400 flex items-center justify-between gap-2">
          <span>{localSaveStatusLabel(saveState, isOnline)}</span>
          {saveState.error?.retryable && onRetrySave ? (
            <button onClick={onRetrySave} className="text-orange-400 font-bold hover:text-orange-300">
              Retry
            </button>
          ) : null}
        </div>
        <div className="text-[10px] text-gray-500 mt-0.5">
          {saveState.lastSavedAt
            ? `${new Date(saveState.lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · Revision ${saveState.localRevision}`
            : `Not yet saved · Revision ${saveState.localRevision}`}
        </div>
      </div>
    </aside>
  );
};
