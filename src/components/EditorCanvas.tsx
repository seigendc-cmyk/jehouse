import React, { useState, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify, 
  Indent, 
  Outdent, 
  Heading1, 
  Heading2, 
  Heading3, 
  Type, 
  Image as ImageIcon, 
  Calculator, 
  Code2, 
  Table2, 
  HelpCircle, 
  Quote, 
  AlertCircle, 
  Plus, 
  Minus,
  Trash2, 
  Sparkles, 
  Wand2, 
  Eye, 
  FileCode,
  BookOpen,
  Ruler,
  Grid,
  BarChart2,
  Table as TableIcon,
  Tag,
  Scissors,
  FileText,
  ChevronUp,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Upload,
  UploadCloud,
  X,
  Copy,
  Clipboard,
  ClipboardCheck,
  CopyPlus,
  Check,
  CheckCircle2
} from 'lucide-react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { Chapter, ContentBlock, BlockType, WatermarkConfig, TrimSize, PageOrientation, HeaderFooterConfig, TrackedChange } from '../types';
import { HorizontalRuler, VerticalRuler, RulerUnit } from './Rulers';
import { SpreadsheetBlock } from './blocks/SpreadsheetBlock';
import { GraphBlock } from './blocks/GraphBlock';
import { TableBlock } from './blocks/TableBlock';
import { CaptionBlock } from './blocks/CaptionBlock';
import { GitCompare, CheckCheck, XCircle, EyeOff } from 'lucide-react';

interface EditorCanvasProps {
  chapter: Chapter;
  watermark: WatermarkConfig;
  trimSize?: TrimSize;
  pageOrientation?: PageOrientation;
  headerFooter?: HeaderFooterConfig;
  isReviewModeActive?: boolean;
  showReviewMarkup?: boolean;
  onToggleReviewMode?: () => void;
  onToggleShowMarkup?: () => void;
  onAcceptAllChanges?: () => void;
  onRejectAllChanges?: () => void;
  onAcceptSingleChange?: (blockId: string, changeId?: string) => void;
  onRejectSingleChange?: (blockId: string, changeId?: string) => void;
  onUpdateChapter: (updated: Chapter) => void;
  onUpdateTrimSize?: (trimSize: TrimSize) => void;
  onUpdatePageOrientation?: (orientation: PageOrientation) => void;
  onUpdateHeaderFooter?: (hf: HeaderFooterConfig) => void;
  onTriggerProofread: () => void;
  onTriggerStoryContinuation: () => void;
  onOpenImageGallery?: () => void;
}

const FONT_FAMILIES = [
  { label: 'Georgia (Serif)', value: 'Georgia, serif' },
  { label: 'EB Garamond (Classic)', value: '"EB Garamond", serif' },
  { label: 'Lora (Literary)', value: 'Lora, serif' },
  { label: 'Playfair (Editorial)', value: '"Playfair Display", serif' },
  { label: 'Cinzel (Display)', value: 'Cinzel, serif' },
  { label: 'Inter (Modern Sans)', value: 'system-ui, sans-serif' },
  { label: 'JetBrains (Code)', value: '"JetBrains Mono", monospace' },
  { label: 'Courier (Typewriter)', value: '"Courier Prime", monospace' },
];

const TRIM_SIZES: { label: string; value: TrimSize }[] = [
  { label: '6" × 9" US Trade', value: '6x9' },
  { label: '8.5" × 11" Letter', value: '8.5x11' },
  { label: 'A4 (210×297 mm)', value: 'A4' },
  { label: 'A5 (148×210 mm)', value: 'A5' },
  { label: '5" × 8" Pocket', value: '5x8' },
  { label: '8.5" × 14" Legal', value: 'Legal' },
];

export const EditorCanvas: React.FC<EditorCanvasProps> = ({
  chapter,
  watermark,
  trimSize = '6x9',
  pageOrientation = 'portrait',
  headerFooter,
  isReviewModeActive = false,
  showReviewMarkup = true,
  onToggleReviewMode,
  onToggleShowMarkup,
  onAcceptAllChanges,
  onRejectAllChanges,
  onAcceptSingleChange,
  onRejectSingleChange,
  onUpdateChapter,
  onUpdateTrimSize,
  onUpdatePageOrientation,
  onUpdateHeaderFooter,
  onTriggerProofread,
  onTriggerStoryContinuation,
  onOpenImageGallery,
}) => {
  const [activeBlockId, setActiveBlockId] = useState<string | null>(chapter.blocks[0]?.id || null);
  const [showRulers, setShowRulers] = useState<boolean>(true);
  const [rulerUnit, setRulerUnit] = useState<RulerUnit>('cm');
  const [localOrientation, setLocalOrientation] = useState<PageOrientation>(pageOrientation);

  useEffect(() => {
    setLocalOrientation(pageOrientation);
  }, [pageOrientation]);

  const currentOrientation = pageOrientation || localOrientation;

  const handleToggleOrientation = (newOrientation: PageOrientation) => {
    setLocalOrientation(newOrientation);
    if (onUpdatePageOrientation) {
      onUpdatePageOrientation(newOrientation);
    }
  };

  // Copy/Paste State
  const [clipboardBlock, setClipboardBlock] = useState<ContentBlock | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Recalculate word count whenever blocks update
  useEffect(() => {
    const totalWords = chapter.blocks.reduce((acc, block) => {
      const words = block.text.trim().split(/\s+/).filter(Boolean).length;
      return acc + words;
    }, 0);

    if (totalWords !== chapter.wordCount) {
      onUpdateChapter({ ...chapter, wordCount: totalWords });
    }
  }, [chapter.blocks]);

  // Copy Block handler
  const copyBlock = (id: string) => {
    const target = chapter.blocks.find((b) => b.id === id);
    if (!target) return;
    setClipboardBlock(target);
    try {
      const serialized = JSON.stringify({ presscraft_block: true, block: target });
      navigator.clipboard.writeText(serialized);
    } catch (e) {
      // Ignore restriction
    }
    showToast(`Copied ${target.type.toUpperCase()} block to clipboard`);
  };

  // Duplicate Block handler
  const duplicateBlock = (id: string) => {
    const targetIdx = chapter.blocks.findIndex((b) => b.id === id);
    if (targetIdx < 0) return;
    const target = chapter.blocks[targetIdx];
    const duplicated: ContentBlock = JSON.parse(JSON.stringify(target));
    duplicated.id = `b-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    const updatedBlocks = [...chapter.blocks];
    updatedBlocks.splice(targetIdx + 1, 0, duplicated);
    onUpdateChapter({ ...chapter, blocks: updatedBlocks });
    setActiveBlockId(duplicated.id);
    showToast(`Duplicated ${target.type.toUpperCase()} block`);
  };

  // Paste Block handler
  const pasteBlock = async (afterId?: string) => {
    let blockToPaste = clipboardBlock;

    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText) {
        try {
          const parsed = JSON.parse(clipboardText);
          if (parsed && parsed.presscraft_block && parsed.block) {
            blockToPaste = parsed.block;
          } else if (clipboardText.trim()) {
            blockToPaste = {
              id: `b-${Date.now()}`,
              type: 'paragraph',
              text: clipboardText,
              fontStyle: 'serif'
            };
          }
        } catch (err) {
          if (clipboardText.trim()) {
            blockToPaste = {
              id: `b-${Date.now()}`,
              type: 'paragraph',
              text: clipboardText,
              fontStyle: 'serif'
            };
          }
        }
      }
    } catch (e) {
      // Memory fallback
    }

    if (!blockToPaste) {
      showToast('Clipboard is empty! Copy a block first.');
      return;
    }

    const newBlock: ContentBlock = JSON.parse(JSON.stringify(blockToPaste));
    newBlock.id = `b-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    const targetId = afterId || activeBlockId || chapter.blocks[chapter.blocks.length - 1]?.id;
    const targetIdx = chapter.blocks.findIndex((b) => b.id === targetId);
    
    const updatedBlocks = [...chapter.blocks];
    if (targetIdx >= 0) {
      updatedBlocks.splice(targetIdx + 1, 0, newBlock);
    } else {
      updatedBlocks.push(newBlock);
    }

    onUpdateChapter({ ...chapter, blocks: updatedBlocks });
    setActiveBlockId(newBlock.id);
    showToast(`Pasted ${newBlock.type.toUpperCase()} block`);
  };

  // Copy Entire Chapter handler
  const copyChapterContent = () => {
    try {
      const chapterText = chapter.blocks.map(b => `${b.type.toUpperCase()}:\n${b.text}`).join('\n\n');
      navigator.clipboard.writeText(chapterText);
      showToast(`Copied entire Chapter ${chapter.number} text to system clipboard`);
    } catch (e) {
      showToast(`Copied Chapter ${chapter.number} content`);
    }
  };

  // Global Keyboard Shortcuts (Cmd/Ctrl + C, Cmd/Ctrl + V, Cmd/Ctrl + D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isTyping = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA');

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'c' && !isTyping && activeBlockId) {
        // Copy active block when not typing inside input
        copyBlock(activeBlockId);
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'v' && !isTyping) {
        e.preventDefault();
        pasteBlock();
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd' && !isTyping && activeBlockId) {
        e.preventDefault();
        duplicateBlock(activeBlockId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeBlockId, clipboardBlock, chapter.blocks]);

  // Update a single content block with Track Changes support
  const updateBlock = (id: string, partial: Partial<ContentBlock>) => {
    const updatedBlocks = chapter.blocks.map((b) => {
      if (b.id !== id) return b;

      if (isReviewModeActive && partial.text !== undefined && partial.text !== b.text) {
        const changeId = `tc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const existingChanges = b.trackedChanges || [];
        const newTrackedChange: TrackedChange = {
          id: changeId,
          type: partial.text.length >= b.text.length ? 'insertion' : 'deletion',
          text: partial.text,
          originalText: b.text,
          author: 'Editor',
          timestamp: nowStr,
          blockId: id,
          chapterId: chapter.id,
          status: 'pending'
        };

        return {
          ...b,
          ...partial,
          trackedChanges: [...existingChanges, newTrackedChange]
        };
      }

      return { ...b, ...partial };
    });

    onUpdateChapter({ ...chapter, blocks: updatedBlocks });
  };

  // Add a new content block after target ID with Review Mode tracking flag
  const addBlock = (afterId: string, type: BlockType = 'paragraph') => {
    const newBlock: ContentBlock = {
      id: `b-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      text: type === 'paragraph' ? '' : type === 'heading' ? 'New Section Heading' : 'New Content Block',
      align: 'left',
      indentLevel: 0,
      fontStyle: 'serif',
      isInsertedInReview: isReviewModeActive ? true : undefined
    };

    const targetIdx = chapter.blocks.findIndex((b) => b.id === afterId);
    const updatedBlocks = [...chapter.blocks];
    if (targetIdx >= 0) {
      updatedBlocks.splice(targetIdx + 1, 0, newBlock);
    } else {
      updatedBlocks.push(newBlock);
    }

    onUpdateChapter({ ...chapter, blocks: updatedBlocks });
    setActiveBlockId(newBlock.id);
  };

  // Delete block with Review Mode tracking support
  const deleteBlock = (id: string) => {
    if (chapter.blocks.length <= 1) return; // Keep at least one block

    if (isReviewModeActive) {
      const updatedBlocks = chapter.blocks.map((b) =>
        b.id === id ? { ...b, isDeletedInReview: true } : b
      );
      onUpdateChapter({ ...chapter, blocks: updatedBlocks });
    } else {
      const updatedBlocks = chapter.blocks.filter((b) => b.id !== id);
      onUpdateChapter({ ...chapter, blocks: updatedBlocks });
    }
  };

  // Move block UP in position order
  const moveBlockUp = (id: string) => {
    const idx = chapter.blocks.findIndex((b) => b.id === id);
    if (idx <= 0) return; // Already at top
    const updatedBlocks = [...chapter.blocks];
    const [moved] = updatedBlocks.splice(idx, 1);
    updatedBlocks.splice(idx - 1, 0, moved);
    onUpdateChapter({ ...chapter, blocks: updatedBlocks });
  };

  // Move block DOWN in position order
  const moveBlockDown = (id: string) => {
    const idx = chapter.blocks.findIndex((b) => b.id === id);
    if (idx < 0 || idx >= chapter.blocks.length - 1) return; // Already at bottom
    const updatedBlocks = [...chapter.blocks];
    const [moved] = updatedBlocks.splice(idx, 1);
    updatedBlocks.splice(idx + 1, 0, moved);
    onUpdateChapter({ ...chapter, blocks: updatedBlocks });
  };

  // Helper renderer for LaTeX formula
  const renderLaTeX = (formula: string) => {
    try {
      return { __html: katex.renderToString(formula || 'E = mc^2', { displayMode: true, throwOnError: false }) };
    } catch (e) {
      return { __html: `<span class="text-red-500 font-mono">${formula}</span>` };
    }
  };

  const activeBlock = chapter.blocks.find((b) => b.id === activeBlockId) || chapter.blocks[0];

  const defaultSizeForType = (type: BlockType): number => {
    switch (type) {
      case 'heading': return 26;
      case 'subheading': return 20;
      case 'clause': return 15;
      case 'quote': return 16;
      default: return 16;
    }
  };

  const getPaperWidthClass = (size: TrimSize | string = '6x9', orientation: PageOrientation = 'portrait') => {
    if (orientation === 'landscape') {
      switch (size) {
        case '6x9': return 'max-w-4xl';
        case '8.5x11': return 'max-w-6xl';
        case 'A4': return 'max-w-6xl';
        case 'A5': return 'max-w-3xl';
        case '5x8': return 'max-w-3xl';
        case 'Legal': return 'max-w-7xl';
        default: return 'max-w-4xl';
      }
    } else {
      switch (size) {
        case '6x9': return 'max-w-2xl';
        case '8.5x11': return 'max-w-4xl';
        case 'A4': return 'max-w-3xl';
        case 'A5': return 'max-w-xl';
        case '5x8': return 'max-w-lg';
        case 'Legal': return 'max-w-5xl';
        default: return 'max-w-2xl';
      }
    }
  };

  const getTargetPageHeight = (size: TrimSize | string = '6x9', orientation: PageOrientation = 'portrait'): number => {
    if (orientation === 'landscape') {
      switch (size) {
        case '6x9': return 460;
        case '8.5x11': return 620;
        case 'A4': return 600;
        case 'A5': return 420;
        case '5x8': return 380;
        case 'Legal': return 620;
        default: return 460;
      }
    } else {
      switch (size) {
        case '6x9': return 750;
        case '8.5x11': return 980;
        case 'A4': return 940;
        case 'A5': return 650;
        case '5x8': return 650;
        case 'Legal': return 1200;
        default: return 750;
      }
    }
  };

  // Auto Page Breakdown logic for active orientation
  const targetPageHeight = getTargetPageHeight(trimSize, currentOrientation);

  const estimateBlockHeight = (block: ContentBlock): number => {
    if (block.type === 'pagebreak') return 9999;
    if (block.type === 'heading') return 75;
    if (block.type === 'subheading') return 55;
    if (block.type === 'image' || block.type === 'graph' || block.type === 'spreadsheet' || block.type === 'table') return 290;
    if (block.type === 'code' || block.type === 'latex') return 130;
    if (block.type === 'quiz') return 210;

    const textLen = (block.text || '').length;
    const charsPerLine = currentOrientation === 'landscape' ? 110 : 75;
    const lineCount = Math.max(1, Math.ceil(textLen / charsPerLine));
    return lineCount * 28 + 20;
  };

  const paginatedPages: ContentBlock[][] = [];
  let currentPageBlocks: ContentBlock[] = [];
  let currentHeight = 0;

  chapter.blocks.forEach((block) => {
    if (block.type === 'pagebreak') {
      if (currentPageBlocks.length > 0) {
        paginatedPages.push(currentPageBlocks);
        currentPageBlocks = [];
        currentHeight = 0;
      }
      paginatedPages.push([block]);
      currentPageBlocks = [];
      currentHeight = 0;
      return;
    }

    const h = estimateBlockHeight(block);
    if (currentHeight + h > targetPageHeight && currentPageBlocks.length > 0) {
      paginatedPages.push(currentPageBlocks);
      currentPageBlocks = [block];
      currentHeight = h;
    } else {
      currentPageBlocks.push(block);
      currentHeight += h;
    }
  });

  if (currentPageBlocks.length > 0) {
    paginatedPages.push(currentPageBlocks);
  }
  if (paginatedPages.length === 0) {
    paginatedPages.push([]);
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F5F5F5] dark:bg-[#1A1A1A] overflow-hidden relative font-sans">
      
      {/* Chapter Title & Sub-bar */}
      <div className="bg-[#222222] text-[#E5E5E5] border-b border-[#333333] px-6 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-xs font-bold bg-[#FF6B00] text-black px-2 py-0.5 rounded uppercase tracking-wider">
            Chapter {chapter.number}
          </span>
          <input
            type="text"
            value={chapter.title}
            onChange={(e) => onUpdateChapter({ ...chapter, title: e.target.value })}
            className="text-base font-bold text-white bg-transparent border-none focus:outline-hidden hover:bg-[#333333] px-2 py-0.5 rounded flex-1 font-serif"
            placeholder="Chapter Title..."
          />
        </div>

        <div className="text-xs text-gray-400 flex items-center gap-4">
          <span>Words: <strong className="text-gray-200">{chapter.wordCount}</strong></span>
          <span>Reading time: ~{Math.ceil(chapter.wordCount / 250)} min</span>
        </div>
      </div>

      {/* Formatting & Insert Toolbar */}
      <div className="bg-[#222222] border-b border-[#333333] px-4 py-1.5 flex flex-wrap items-center gap-1.5 text-xs select-none sticky top-0 z-20 shadow-xs">
        
        {/* Block Type Selector */}
        {activeBlock && (
          <select
            value={activeBlock.type}
            onChange={(e) => updateBlock(activeBlock.id, { type: e.target.value as BlockType })}
            className="bg-[#1A1A1A] border border-[#444] text-gray-200 rounded px-2 py-1 text-xs font-medium focus:outline-hidden cursor-pointer"
          >
            <option value="paragraph">Paragraph</option>
            <option value="heading">Heading (H1)</option>
            <option value="subheading">Subheading (H2)</option>
            <option value="clause">Clause / Section</option>
            <option value="item">ListItem</option>
            <option value="quote">Block Quote</option>
            <option value="callout">Callout Box</option>
            <option value="spreadsheet">Spreadsheet Matrix</option>
            <option value="graph">Interactive Graph / Chart</option>
            <option value="table">Scientific Data Table</option>
            <option value="caption">Figure / Table Caption</option>
            <option value="pagebreak">Page Break / New Page</option>
            <option value="latex">LaTeX Formula</option>
            <option value="code">Code Snippet</option>
            <option value="ledger">Financial Ledger</option>
            <option value="quiz">Interactive Quiz</option>
            <option value="image">Image Attachment</option>
          </select>
        )}

        <div className="h-4 w-px bg-[#444] mx-1" />

        {/* Font Family Selector */}
        {activeBlock && (
          <select
            value={activeBlock.fontFamily || 'Georgia, serif'}
            onChange={(e) => updateBlock(activeBlock.id, { fontFamily: e.target.value })}
            className="bg-[#1A1A1A] border border-[#444] text-gray-200 rounded px-2 py-1 text-xs font-medium focus:outline-hidden cursor-pointer max-w-[130px]"
            title="Font Family"
          >
            {FONT_FAMILIES.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        )}

        {/* Font Size Increase / Decrease Controls */}
        {activeBlock && (
          <div className="flex items-center gap-1 bg-[#1A1A1A] border border-[#444] rounded px-1.5 py-0.5">
            <button
              onClick={() => {
                const current = activeBlock.fontSize || defaultSizeForType(activeBlock.type);
                updateBlock(activeBlock.id, { fontSize: Math.max(10, current - 2) });
              }}
              className="px-1 text-gray-300 hover:text-white font-bold text-xs cursor-pointer"
              title="Decrease Font Size"
            >
              A-
            </button>
            <select
              value={activeBlock.fontSize || defaultSizeForType(activeBlock.type)}
              onChange={(e) => updateBlock(activeBlock.id, { fontSize: Number(e.target.value) })}
              className="bg-transparent border-none text-orange-400 font-mono text-xs font-bold text-center focus:outline-hidden cursor-pointer w-10"
              title="Font Size (px)"
            >
              {[12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 48, 60, 72].map((s) => (
                <option key={s} value={s} className="bg-[#1A1A1A] text-gray-200">{s}px</option>
              ))}
            </select>
            <button
              onClick={() => {
                const current = activeBlock.fontSize || defaultSizeForType(activeBlock.type);
                updateBlock(activeBlock.id, { fontSize: Math.min(72, current + 2) });
              }}
              className="px-1 text-gray-300 hover:text-white font-bold text-xs cursor-pointer"
              title="Increase Font Size"
            >
              A+
            </button>
          </div>
        )}

        <div className="h-4 w-px bg-[#444] mx-1" />

        {/* Text Style formatting */}
        {activeBlock && (
          <>
            <button
              onClick={() => updateBlock(activeBlock.id, { bold: !activeBlock.bold })}
              className={`p-1 rounded transition-colors ${activeBlock.bold ? 'bg-[#FF6B00] text-black font-bold' : 'hover:bg-[#333333] text-gray-300'}`}
              title="Bold"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => updateBlock(activeBlock.id, { italic: !activeBlock.italic })}
              className={`p-1 rounded transition-colors ${activeBlock.italic ? 'bg-[#FF6B00] text-black font-bold' : 'hover:bg-[#333333] text-gray-300'}`}
              title="Italics"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => updateBlock(activeBlock.id, { underline: !activeBlock.underline })}
              className={`p-1 rounded transition-colors ${activeBlock.underline ? 'bg-[#FF6B00] text-black font-bold' : 'hover:bg-[#333333] text-gray-300'}`}
              title="Underline"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>

            <div className="h-4 w-px bg-[#444] mx-1" />

            {/* Alignment */}
            <button
              onClick={() => updateBlock(activeBlock.id, { align: 'left' })}
              className={`p-1 rounded transition-colors ${activeBlock.align === 'left' ? 'bg-[#FF6B00] text-black font-bold' : 'hover:bg-[#333333] text-gray-300'}`}
              title="Align Left"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => updateBlock(activeBlock.id, { align: 'center' })}
              className={`p-1 rounded transition-colors ${activeBlock.align === 'center' ? 'bg-[#FF6B00] text-black font-bold' : 'hover:bg-[#333333] text-gray-300'}`}
              title="Align Center"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => updateBlock(activeBlock.id, { align: 'justify' })}
              className={`p-1 rounded transition-colors ${activeBlock.align === 'justify' ? 'bg-[#FF6B00] text-black font-bold' : 'hover:bg-[#333333] text-gray-300'}`}
              title="Justify Text"
            >
              <AlignJustify className="w-3.5 h-3.5" />
            </button>

            {/* Indent controls */}
            <button
              onClick={() => updateBlock(activeBlock.id, { indentLevel: Math.max(0, (activeBlock.indentLevel || 0) - 1) })}
              className="p-1 rounded hover:bg-[#333333] text-gray-300 cursor-pointer"
              title="Outdent"
            >
              <Outdent className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => updateBlock(activeBlock.id, { indentLevel: Math.min(3, (activeBlock.indentLevel || 0) + 1) })}
              className="p-1 rounded hover:bg-[#333333] text-gray-300 cursor-pointer"
              title="Indent"
            >
              <Indent className="w-3.5 h-3.5" />
            </button>

            <div className="h-4 w-px bg-[#444] mx-1" />

            {/* Block Move Up / Move Down Reorder Controls */}
            <button
              onClick={() => moveBlockUp(activeBlock.id)}
              disabled={chapter.blocks.findIndex(b => b.id === activeBlock.id) <= 0}
              className="p-1 rounded hover:bg-[#333333] text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Move Content Block Up"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => moveBlockDown(activeBlock.id)}
              disabled={chapter.blocks.findIndex(b => b.id === activeBlock.id) >= chapter.blocks.length - 1}
              className="p-1 rounded hover:bg-[#333333] text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Move Content Block Down"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>

            {/* Copy, Duplicate & Paste Block Buttons */}
            <div className="h-4 w-px bg-[#444] mx-1" />

            <button
              onClick={() => copyBlock(activeBlock.id)}
              className="p-1 rounded hover:bg-[#333333] text-gray-300 cursor-pointer flex items-center gap-1"
              title="Copy Active Block (Ctrl+C)"
            >
              <Copy className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span className="hidden xl:inline text-[10px]">Copy</span>
            </button>

            <button
              onClick={() => duplicateBlock(activeBlock.id)}
              className="p-1 rounded hover:bg-[#333333] text-gray-300 cursor-pointer flex items-center gap-1"
              title="Duplicate Active Block (Ctrl+D)"
            >
              <CopyPlus className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden xl:inline text-[10px]">Duplicate</span>
            </button>

            <button
              onClick={() => pasteBlock(activeBlock.id)}
              className="p-1 rounded hover:bg-[#333333] text-gray-300 cursor-pointer flex items-center gap-1"
              title="Paste Block Below (Ctrl+V)"
            >
              <Clipboard className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden xl:inline text-[10px]">Paste</span>
            </button>
          </>
        )}

        <div className="h-4 w-px bg-[#444] mx-1" />

        {/* Paper Size Switcher */}
        <div className="flex items-center gap-1 bg-[#1A1A1A] border border-[#444] rounded px-1.5 py-0.5">
          <span className="text-[10px] text-gray-400 font-semibold uppercase">Paper:</span>
          <select
            value={trimSize}
            onChange={(e) => onUpdateTrimSize?.(e.target.value as TrimSize)}
            className="bg-transparent text-gray-200 text-xs font-medium focus:outline-hidden cursor-pointer"
            title="Paper / Trim Size"
          >
            {TRIM_SIZES.map((ts) => (
              <option key={ts.value} value={ts.value} className="bg-[#1A1A1A] text-gray-200">{ts.label}</option>
            ))}
          </select>
        </div>

        {/* Page Orientation Switcher */}
        <div className="flex items-center gap-0.5 bg-[#1A1A1A] border border-[#444] rounded p-0.5">
          <button
            onClick={() => handleToggleOrientation('portrait')}
            className={`px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
              currentOrientation === 'portrait'
                ? 'bg-[#FF6B00] text-black font-bold shadow-2xs'
                : 'text-gray-300 hover:text-white hover:bg-[#333]'
            }`}
            title="Portrait Page Orientation (Vertical)"
          >
            <span className="text-[11px]">📱 Portrait</span>
          </button>
          <button
            onClick={() => handleToggleOrientation('landscape')}
            className={`px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
              currentOrientation === 'landscape'
                ? 'bg-[#FF6B00] text-black font-bold shadow-2xs'
                : 'text-gray-300 hover:text-white hover:bg-[#333]'
            }`}
            title="Landscape Page Orientation (Horizontal - Auto Breaks Pages)"
          >
            <span className="text-[11px]">🖥️ Landscape</span>
          </button>
        </div>

        {/* Header & Footer Toggle Button */}
        <button
          onClick={() => {
            if (headerFooter && onUpdateHeaderFooter) {
              onUpdateHeaderFooter({ ...headerFooter, enabled: !headerFooter.enabled });
            }
          }}
          className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors border cursor-pointer ${
            headerFooter?.enabled 
              ? 'bg-[#FF6B00] text-black font-bold border-[#FF6B00]' 
              : 'bg-[#1A1A1A] hover:bg-[#333] text-gray-300 border-[#333333]'
          }`}
          title="Toggle Running Headers & Footers"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Header/Footer</span>
        </button>

        {/* Ruler Toggle Button */}
        <button
          onClick={() => setShowRulers(!showRulers)}
          className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors border cursor-pointer ${
            showRulers 
              ? 'bg-[#FF6B00] text-black font-bold border-[#FF6B00]' 
              : 'bg-[#1A1A1A] hover:bg-[#333] text-gray-300 border-[#333333]'
          }`}
          title="Toggle Measurement Rulers"
        >
          <Ruler className="w-3.5 h-3.5" />
          <span>Rulers</span>
        </button>

        {showRulers && (
          <div className="flex items-center gap-1 bg-[#1A1A1A] border border-[#444] rounded px-1.5 py-0.5">
            <span className="text-[10px] text-gray-400 font-semibold uppercase">Unit:</span>
            <select
              value={rulerUnit}
              onChange={(e) => setRulerUnit(e.target.value as RulerUnit)}
              className="bg-transparent text-gray-200 text-xs font-bold focus:outline-hidden cursor-pointer"
              title="Ruler Measurement Unit"
            >
              <option value="cm" className="bg-[#1A1A1A] text-gray-200">cm (Centimeters)</option>
              <option value="mm" className="bg-[#1A1A1A] text-gray-200">mm (Millimeters)</option>
              <option value="in" className="bg-[#1A1A1A] text-gray-200">in (Inches)</option>
            </select>
          </div>
        )}

        <div className="h-4 w-px bg-[#444] mx-1" />

        {/* Quick Add Page Break */}
        <button
          onClick={() => activeBlockId && addBlock(activeBlockId, 'pagebreak')}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#1A1A1A] hover:bg-[#FF6B00] hover:text-black text-gray-300 border border-[#333333] transition-colors cursor-pointer"
          title="Insert Page Break (New Page)"
        >
          <Scissors className="w-3 h-3 text-rose-400" />
          <span>+ Page Break</span>
        </button>

        {/* Insert Elements Quick Actions */}
        <button
          onClick={() => activeBlockId && addBlock(activeBlockId, 'spreadsheet')}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#1A1A1A] hover:bg-[#FF6B00] hover:text-black text-gray-300 border border-[#333333] transition-colors cursor-pointer"
          title="Insert Interactive Spreadsheet Grid"
        >
          <Grid className="w-3 h-3 text-emerald-400" />
          <span>Sheet</span>
        </button>

        <button
          onClick={() => activeBlockId && addBlock(activeBlockId, 'graph')}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#1A1A1A] hover:bg-[#FF6B00] hover:text-black text-gray-300 border border-[#333333] transition-colors cursor-pointer"
          title="Insert Graph / Chart"
        >
          <BarChart2 className="w-3 h-3 text-orange-400" />
          <span>Graph</span>
        </button>

        <button
          onClick={() => activeBlockId && addBlock(activeBlockId, 'table')}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#1A1A1A] hover:bg-[#FF6B00] hover:text-black text-gray-300 border border-[#333333] transition-colors cursor-pointer"
          title="Insert Data Table"
        >
          <TableIcon className="w-3 h-3 text-blue-400" />
          <span>Table</span>
        </button>

        <button
          onClick={() => activeBlockId && addBlock(activeBlockId, 'caption')}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#1A1A1A] hover:bg-[#FF6B00] hover:text-black text-gray-300 border border-[#333333] transition-colors cursor-pointer"
          title="Insert Figure / Table Caption"
        >
          <Tag className="w-3 h-3 text-amber-400" />
          <span>Caption</span>
        </button>

        <button
          onClick={() => activeBlockId && addBlock(activeBlockId, 'latex')}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#1A1A1A] hover:bg-[#FF6B00] hover:text-black text-gray-300 border border-[#333333] transition-colors cursor-pointer"
          title="Insert LaTeX Formula"
        >
          <Calculator className="w-3 h-3 text-sky-400" />
          <span>Math</span>
        </button>

        <button
          onClick={() => activeBlockId && addBlock(activeBlockId, 'code')}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#1A1A1A] hover:bg-[#FF6B00] hover:text-black text-gray-300 border border-[#333333] transition-colors cursor-pointer"
          title="Insert Code Snippet"
        >
          <Code2 className="w-3 h-3 text-purple-400" />
          <span>Code</span>
        </button>

        <button
          onClick={() => activeBlockId && addBlock(activeBlockId, 'quiz')}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#1A1A1A] hover:bg-[#FF6B00] hover:text-black text-gray-300 border border-[#333333] transition-colors cursor-pointer"
          title="Insert Quiz / Assessment"
        >
          <HelpCircle className="w-3 h-3 text-amber-400" />
          <span>Quiz</span>
        </button>

        <button
          onClick={() => activeBlockId && addBlock(activeBlockId, 'image')}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#1A1A1A] hover:bg-[#FF6B00] hover:text-black text-gray-300 border border-[#333333] transition-colors cursor-pointer"
          title="Insert Image / Illustration Block from Local Device or URL"
        >
          <ImageIcon className="w-3 h-3 text-purple-400" />
          <span>Image</span>
        </button>

        {/* AI Creative Assistants */}
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={onTriggerStoryContinuation}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-linear-to-r from-orange-500 to-amber-500 text-black font-bold text-xs hover:brightness-110 transition-all shadow-xs cursor-pointer"
            title="AI Smart Prose Continuation"
          >
            <Wand2 className="w-3 h-3" />
            <span>AI Continue</span>
          </button>

          <button
            onClick={onTriggerProofread}
            className="flex items-center gap-1 px-2 py-1 rounded bg-[#333333] hover:bg-[#444444] text-gray-200 text-xs transition-colors cursor-pointer"
            title="Run AI Proofreader & Copyeditor"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Proofread</span>
          </button>
        </div>

      </div>

      {/* Writing Space (Main Paper Sheet Canvas) */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center relative">
        
        {/* Paper Sheet Container with Optional Measurement Rulers */}
        <div className={`w-full ${getPaperWidthClass(trimSize, currentOrientation)} flex flex-col relative transition-all duration-300`}>
          
          {/* Review Mode Banner */}
          {isReviewModeActive && (
            <div className="mb-4 bg-zinc-900 text-zinc-100 border-2 border-orange-500 rounded-xl p-3.5 shadow-xl flex flex-wrap items-center justify-between gap-3 select-none">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/20 text-orange-400 rounded-lg border border-orange-500/30">
                  <GitCompare className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-orange-400 uppercase tracking-wide">
                      Review Mode & Track Changes Active
                    </span>
                    <span className="bg-emerald-500/20 text-emerald-400 font-bold font-mono text-[11px] px-2 py-0.5 rounded border border-emerald-500/30">
                      {(() => {
                        const pendingInChap = chapter.blocks.reduce((acc, b) => {
                          const tcCount = (b.trackedChanges || []).filter((tc) => tc.status === 'pending').length;
                          const incCount = b.isInsertedInReview ? 1 : 0;
                          const delCount = b.isDeletedInReview ? 1 : 0;
                          return acc + tcCount + incCount + delCount;
                        }, 0);
                        return `${pendingInChap} Pending Edit${pendingInChap === 1 ? '' : 's'}`;
                      })()}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    All typing, block additions, and block deletions are recorded with visual markup highlights.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onToggleShowMarkup}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-cyan-300 border border-zinc-700 transition-colors cursor-pointer"
                  title="Toggle visual markup diffs on canvas"
                >
                  {showReviewMarkup ? <Eye className="w-3.5 h-3.5 text-cyan-400" /> : <EyeOff className="w-3.5 h-3.5 text-zinc-400" />}
                  <span>{showReviewMarkup ? 'Showing Diffs' : 'Final Preview (Clean)'}</span>
                </button>

                <button
                  onClick={onAcceptAllChanges}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  title="Accept all pending edits in this chapter"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Accept All</span>
                </button>

                <button
                  onClick={onRejectAllChanges}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  title="Reject all pending edits in this chapter"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject All</span>
                </button>
              </div>
            </div>
          )}

          {/* Horizontal Ruler on top below header */}
          {showRulers && (
            <HorizontalRuler
              trimSize={trimSize}
              pageOrientation={currentOrientation}
              unit={rulerUnit}
              onUnitChange={setRulerUnit}
            />
          )}

          <div className="flex w-full relative">
            
            {/* Vertical Ruler on left side */}
            {showRulers && (
              <VerticalRuler
                trimSize={trimSize}
                pageOrientation={currentOrientation}
                unit={rulerUnit}
                onUnitChange={setRulerUnit}
              />
            )}

            {/* Paper Sheet Representation */}
            <div className={`flex-1 bg-white dark:bg-zinc-900 shadow-xl border border-zinc-200/80 dark:border-zinc-800/80 p-8 sm:p-14 min-h-[85vh] relative text-zinc-900 dark:text-zinc-100 transition-colors ${showRulers ? 'rounded-br-lg' : 'rounded-lg'}`}>
              
              {/* Running Header */}
              {headerFooter?.enabled && (
                <div className="border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-6 flex items-center justify-between text-xs text-zinc-500 font-serif select-none">
                  <input
                    type="text"
                    value={headerFooter.headerLeftText || ''}
                    onChange={(e) => onUpdateHeaderFooter?.({ ...headerFooter, headerLeftText: e.target.value })}
                    className="bg-transparent border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-orange-500 text-zinc-500 dark:text-zinc-400 text-xs w-1/3 focus:outline-hidden"
                    placeholder="Header Left (Book Title)..."
                  />
                  <input
                    type="text"
                    value={headerFooter.headerCenterText || ''}
                    onChange={(e) => onUpdateHeaderFooter?.({ ...headerFooter, headerCenterText: e.target.value })}
                    className="bg-transparent border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-orange-500 text-center text-zinc-500 dark:text-zinc-400 text-xs w-1/3 focus:outline-hidden font-bold"
                    placeholder="Header Center (Chapter)..."
                  />
                  <input
                    type="text"
                    value={headerFooter.headerRightText || ''}
                    onChange={(e) => onUpdateHeaderFooter?.({ ...headerFooter, headerRightText: e.target.value })}
                    className="bg-transparent border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-orange-500 text-right text-zinc-500 dark:text-zinc-400 text-xs w-1/3 focus:outline-hidden"
                    placeholder="Header Right (Author)..."
                  />
                </div>
              )}

              {/* Watermark & Scene Background Overlay */}
              {watermark.enabled && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0 select-none">
                  {watermark.imageUrl && (watermark.type === 'image' || watermark.type === 'both') && (
                    <img
                      src={watermark.imageUrl}
                      alt="Watermark Overlay"
                      className="absolute inset-0 w-full h-full object-contain pointer-events-none transition-all"
                      style={{
                        opacity: watermark.opacity,
                        transform: `scale(${watermark.imageScale || 1.0})`,
                        objectFit: watermark.imagePosition === 'stretch' ? 'cover' : 'contain',
                      }}
                    />
                  )}
                  {(watermark.type === 'text' || watermark.type === 'both' || !watermark.type) && watermark.text && (
                    <div
                      className="font-black uppercase tracking-widest text-center"
                      style={{
                        opacity: watermark.opacity,
                        transform: `rotate(${watermark.rotation}deg)`,
                        fontSize: `${watermark.fontSize}px`,
                        color: 'currentColor',
                      }}
                    >
                      {watermark.text}
                    </div>
                  )}
                </div>
              )}

              {/* Season & Episode Badge Banner */}
              {(chapter.seasonNumber || chapter.episodeNumber) && (
                <div className="mb-4 flex items-center justify-between bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/80 rounded-lg px-3.5 py-2 text-xs font-bold text-orange-900 dark:text-orange-200 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="uppercase font-extrabold tracking-wider bg-orange-500 text-black px-2 py-0.5 rounded text-[10px] shadow-2xs">
                      Season {chapter.seasonNumber || 1} • Episode {chapter.episodeNumber || 1}
                    </span>
                    {chapter.episodeTitle && <span className="italic text-orange-700 dark:text-orange-300">{chapter.episodeTitle}</span>}
                  </div>
                </div>
              )}

              {/* Chapter Content Blocks */}
              <div className="relative z-10 space-y-4">
                {chapter.blocks.map((block) => {
                  const isActive = activeBlockId === block.id;

                  return (
                    <div
                      key={block.id}
                      onClick={() => setActiveBlockId(block.id)}
                      className={`group relative rounded p-2 transition-all ${
                        block.isDeletedInReview && showReviewMarkup
                          ? 'ring-2 ring-rose-500 bg-rose-50/20 dark:bg-rose-950/20 opacity-75 line-through'
                          : block.isInsertedInReview && showReviewMarkup
                          ? 'ring-2 ring-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20'
                          : isActive 
                          ? 'ring-2 ring-orange-500/50 bg-orange-50/20 dark:bg-orange-950/20' 
                          : 'hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30'
                      }`}
                    >
                      {/* Block-Level Review Markup Banners */}
                      {showReviewMarkup && block.isInsertedInReview && (
                        <div className="flex items-center justify-between bg-emerald-500/15 border border-emerald-500/40 rounded px-2.5 py-1 mb-2 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                          <span className="flex items-center gap-1.5">
                            <Plus className="w-3.5 h-3.5" />
                            <span>NEW INSERTED BLOCK (Pending Review)</span>
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onAcceptSingleChange && onAcceptSingleChange(block.id);
                              }}
                              className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold transition-colors cursor-pointer"
                            >
                              Accept ✓
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onRejectSingleChange && onRejectSingleChange(block.id);
                              }}
                              className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-[10px] font-bold transition-colors cursor-pointer"
                            >
                              Reject ✗
                            </button>
                          </div>
                        </div>
                      )}

                      {showReviewMarkup && block.isDeletedInReview && (
                        <div className="flex items-center justify-between bg-rose-500/15 border border-rose-500/40 rounded px-2.5 py-1 mb-2 text-[11px] font-bold text-rose-700 dark:text-rose-300">
                          <span className="flex items-center gap-1.5">
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>DELETED BLOCK (Pending Review)</span>
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onAcceptSingleChange && onAcceptSingleChange(block.id);
                              }}
                              className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-[10px] font-bold transition-colors cursor-pointer"
                            >
                              Accept Delete ✓
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onRejectSingleChange && onRejectSingleChange(block.id);
                              }}
                              className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold transition-colors cursor-pointer"
                            >
                              Restore Block ✗
                            </button>
                          </div>
                        </div>
                      )}
                      {/* Block Move, Delete & Add Handles */}
                      <div className="absolute -left-14 top-2 opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity bg-zinc-100 dark:bg-zinc-800/90 border border-zinc-300 dark:border-zinc-700 rounded p-0.5 shadow-md z-20">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveBlockUp(block.id);
                          }}
                          disabled={chapter.blocks.findIndex(b => b.id === block.id) <= 0}
                          className="p-1 rounded hover:bg-orange-500 hover:text-white text-zinc-600 dark:text-zinc-300 disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer"
                          title="Move Block Up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveBlockDown(block.id);
                          }}
                          disabled={chapter.blocks.findIndex(b => b.id === block.id) >= chapter.blocks.length - 1}
                          className="p-1 rounded hover:bg-orange-500 hover:text-white text-zinc-600 dark:text-zinc-300 disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer"
                          title="Move Block Down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addBlock(block.id, 'paragraph');
                          }}
                          className="p-1 rounded hover:bg-emerald-500 hover:text-white text-zinc-600 dark:text-zinc-300 cursor-pointer"
                          title="Add Block Below"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyBlock(block.id);
                          }}
                          className="p-1 rounded hover:bg-[#FF6B00] hover:text-black text-zinc-600 dark:text-zinc-300 cursor-pointer"
                          title="Copy Block"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateBlock(block.id);
                          }}
                          className="p-1 rounded hover:bg-blue-500 hover:text-white text-zinc-600 dark:text-zinc-300 cursor-pointer"
                          title="Duplicate Block"
                        >
                          <CopyPlus className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            pasteBlock(block.id);
                          }}
                          className="p-1 rounded hover:bg-emerald-500 hover:text-white text-zinc-600 dark:text-zinc-300 cursor-pointer"
                          title="Paste Block Below"
                        >
                          <Clipboard className="w-3.5 h-3.5" />
                        </button>

                        {chapter.blocks.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteBlock(block.id);
                            }}
                            className="p-1 rounded hover:bg-rose-500 hover:text-white text-zinc-600 dark:text-zinc-300 cursor-pointer"
                            title="Delete Block"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Block Content Renderers */}
                      
                      {/* Heading Block */}
                      {block.type === 'heading' && (
                        <input
                          type="text"
                          value={block.text}
                          onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                          style={{
                            fontFamily: block.fontFamily || 'Georgia, serif',
                            fontSize: `${block.fontSize || 26}px`,
                            fontWeight: block.bold ? 900 : 800,
                            fontStyle: block.italic ? 'italic' : 'normal',
                            textAlign: block.align || 'left'
                          }}
                          className="w-full tracking-tight text-zinc-900 dark:text-zinc-100 bg-transparent border-none focus:outline-hidden"
                          placeholder="Heading 1..."
                        />
                      )}

                      {/* Subheading Block */}
                      {block.type === 'subheading' && (
                        <input
                          type="text"
                          value={block.text}
                          onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                          style={{
                            fontFamily: block.fontFamily || 'Georgia, serif',
                            fontSize: `${block.fontSize || 20}px`,
                            fontWeight: block.bold ? 800 : 700,
                            fontStyle: block.italic ? 'italic' : 'normal',
                            textAlign: block.align || 'left'
                          }}
                          className="w-full text-zinc-800 dark:text-zinc-200 bg-transparent border-none focus:outline-hidden"
                          placeholder="Subheading 2..."
                        />
                      )}

                      {/* Clause / Section */}
                      {block.type === 'clause' && (
                        <input
                          type="text"
                          value={block.text}
                          onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                          style={{
                            fontFamily: block.fontFamily || 'Georgia, serif',
                            fontSize: `${block.fontSize || 15}px`,
                            textAlign: block.align || 'left'
                          }}
                          className="w-full font-bold text-orange-600 dark:text-orange-400 bg-transparent border-none focus:outline-hidden uppercase tracking-wider"
                          placeholder="Clause Title..."
                        />
                      )}

                      {/* Standard Paragraph */}
                      {block.type === 'paragraph' && (
                        <textarea
                          value={block.text}
                          onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                          rows={Math.max(2, Math.ceil(block.text.length / 80))}
                          style={{
                            fontFamily: block.fontFamily || 'Georgia, serif',
                            fontSize: `${block.fontSize || 16}px`,
                            paddingLeft: `${(block.indentLevel || 0) * 1.5}rem`,
                            textAlign: block.align || 'left',
                            fontWeight: block.bold ? 'bold' : 'normal',
                            fontStyle: block.italic ? 'italic' : 'normal',
                            textDecoration: `${block.underline ? 'underline ' : ''}${block.strikethrough ? 'line-through' : ''}`,
                          }}
                          className="w-full bg-transparent border-none focus:outline-hidden resize-none leading-relaxed text-zinc-800 dark:text-zinc-200 font-serif"
                          placeholder="Type paragraph text here..."
                        />
                      )}

                      {/* Page Break Block */}
                      {block.type === 'pagebreak' && (
                        <div className="my-6 py-2 relative select-none">
                          <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t-2 border-dashed border-orange-500/50 dark:border-orange-500/60" />
                          </div>
                          <div className="relative flex justify-between items-center px-4 text-xs font-mono">
                            <span className="bg-white dark:bg-zinc-900 px-3 py-1 border border-orange-500/50 rounded-full text-orange-600 dark:text-orange-400 font-bold flex items-center gap-1.5 shadow-xs">
                              <Scissors className="w-3.5 h-3.5" /> PAGE BREAK • NEW PAGE
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addBlock(block.id, 'paragraph');
                              }}
                              className="bg-white dark:bg-zinc-900 px-2.5 py-1 border border-zinc-300 dark:border-zinc-700 hover:border-orange-500 text-zinc-600 dark:text-zinc-300 rounded text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Plus className="w-3 h-3 text-orange-500" /> Insert Paragraph On New Page
                            </button>
                          </div>

                          {/* Continuing Chapter Heading Header */}
                          <div className="mt-4 p-2.5 bg-orange-500/10 dark:bg-orange-950/30 border-l-4 border-orange-500 rounded-r-lg text-xs font-serif font-bold text-zinc-800 dark:text-zinc-200 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] bg-orange-500 text-black px-1.5 py-0.5 rounded font-sans uppercase tracking-wider font-extrabold">Continuing Top Header</span>
                              <span>Chapter {chapter.number}: {chapter.title}</span>
                            </div>
                            <span className="text-[11px] font-mono font-normal text-orange-600 dark:text-orange-400 italic">(Continued)</span>
                          </div>
                        </div>
                      )}

                      {/* Spreadsheet Block */}
                      {block.type === 'spreadsheet' && (
                        <SpreadsheetBlock
                          data={block.spreadsheetData}
                          onChange={(spreadsheetData) => updateBlock(block.id, { spreadsheetData })}
                        />
                      )}

                      {/* Graph / Chart Block */}
                      {block.type === 'graph' && (
                        <GraphBlock
                          data={block.graphData}
                          onChange={(graphData) => updateBlock(block.id, { graphData })}
                        />
                      )}

                      {/* Scientific Table Block */}
                      {block.type === 'table' && (
                        <TableBlock
                          data={block.tableData}
                          onChange={(tableData) => updateBlock(block.id, { tableData })}
                        />
                      )}

                      {/* Caption Block */}
                      {block.type === 'caption' && (
                        <CaptionBlock
                          data={block.captionData}
                          onChange={(captionData) => updateBlock(block.id, { captionData })}
                        />
                      )}

                      {/* LaTeX Block */}
                      {block.type === 'latex' && (
                        <div className="bg-zinc-50 dark:bg-zinc-800/60 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 space-y-3">
                          <div className="flex items-center justify-between text-xs font-semibold text-orange-600 dark:text-orange-400">
                            <span className="flex items-center gap-1"><Calculator className="w-3.5 h-3.5" /> LaTeX Math Formula</span>
                          </div>
                          <input
                            type="text"
                            value={block.latexFormula || ''}
                            onChange={(e) => updateBlock(block.id, { latexFormula: e.target.value })}
                            className="w-full font-mono text-xs p-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded focus:outline-hidden"
                            placeholder="e.g. \\int_{a}^{b} f(x) dx = F(b) - F(a)"
                          />
                          <div className="p-3 bg-white dark:bg-zinc-900 rounded border border-zinc-200 dark:border-zinc-800 text-center overflow-x-auto">
                            <div dangerouslySetInnerHTML={renderLaTeX(block.latexFormula || 'E = mc^2')} />
                          </div>
                        </div>
                      )}

                      {/* Code Snippet Block */}
                      {block.type === 'code' && (
                        <div className="bg-zinc-950 text-zinc-100 rounded-lg p-4 font-mono text-xs space-y-2 border border-zinc-800">
                          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                            <span className="text-orange-400 font-bold uppercase text-[10px] tracking-wider">Code Snippet</span>
                            <input
                              type="text"
                              value={block.codeLanguage || 'typescript'}
                              onChange={(e) => updateBlock(block.id, { codeLanguage: e.target.value })}
                              className="bg-zinc-900 text-zinc-400 text-[10px] px-2 py-0.5 rounded border border-zinc-800"
                              placeholder="language..."
                            />
                          </div>
                          <textarea
                            value={block.codeSnippet || block.text}
                            onChange={(e) => updateBlock(block.id, { codeSnippet: e.target.value, text: e.target.value })}
                            rows={6}
                            className="w-full bg-transparent border-none focus:outline-hidden font-mono text-xs text-zinc-200 resize-y"
                            placeholder="Paste code snippet here..."
                          />
                        </div>
                      )}

                      {/* Financial Ledger Block */}
                      {block.type === 'ledger' && block.ledgerData && (
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 space-y-2 text-xs">
                          <div className="font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1.5">
                            <Table2 className="w-4 h-4" /> Financial Ledger Table
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                                  <th className="p-2 border border-zinc-200 dark:border-zinc-700">Date</th>
                                  <th className="p-2 border border-zinc-200 dark:border-zinc-700">Account</th>
                                  <th className="p-2 border border-zinc-200 dark:border-zinc-700">Debit</th>
                                  <th className="p-2 border border-zinc-200 dark:border-zinc-700">Credit</th>
                                </tr>
                              </thead>
                              <tbody>
                                {block.ledgerData.map((row, rIdx) => (
                                  <tr key={rIdx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                                    <td className="p-1.5 border border-zinc-200 dark:border-zinc-800">{row.date}</td>
                                    <td className="p-1.5 border border-zinc-200 dark:border-zinc-800">{row.account}</td>
                                    <td className="p-1.5 border border-zinc-200 dark:border-zinc-800 text-emerald-600 dark:text-emerald-400 font-mono">{row.debit}</td>
                                    <td className="p-1.5 border border-zinc-200 dark:border-zinc-800 text-rose-600 dark:text-rose-400 font-mono">{row.credit}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Quiz Block */}
                      {block.type === 'quiz' && block.quizQuestions && (
                        <div className="bg-orange-50/60 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/60 rounded-lg p-4 space-y-3">
                          <div className="font-bold text-orange-700 dark:text-orange-300 text-xs flex items-center justify-between">
                            <span className="flex items-center gap-1.5"><HelpCircle className="w-4 h-4" /> Multiple Choice Quiz</span>
                            <span className="text-[10px] bg-orange-200 dark:bg-orange-900 px-2 py-0.5 rounded text-orange-900 dark:text-orange-100">Educational Assessment</span>
                          </div>
                          {block.quizQuestions.map((q, qIdx) => (
                            <div key={q.id} className="bg-white dark:bg-zinc-900 p-3 rounded border border-orange-100 dark:border-orange-900/40 text-xs space-y-2">
                              <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                                {qIdx + 1}. {q.question}
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-2">
                                {q.options.map((opt, oIdx) => (
                                  <div 
                                    key={oIdx} 
                                    className={`p-2 rounded border transition-colors cursor-pointer text-xs ${
                                      oIdx === q.correctIndex 
                                        ? 'bg-emerald-50 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 font-medium' 
                                        : 'bg-zinc-50 border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                                    }`}
                                  >
                                    {String.fromCharCode(65 + oIdx)}. {opt}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Image Attachment, Scene Watermark & Flexible Positioning */}
                      {block.type === 'image' && (
                        <div className={`my-4 transition-all ${
                          block.imageWrap === 'left'
                            ? 'sm:float-left sm:mr-6 sm:mb-4 sm:max-w-[50%] z-10'
                            : block.imageWrap === 'right'
                            ? 'sm:float-right sm:ml-6 sm:mb-4 sm:max-w-[50%] z-10'
                            : block.imageWrap === 'background-watermark'
                            ? 'relative p-6 my-6 rounded-2xl border-2 border-dashed border-orange-500/40 bg-orange-50/10 dark:bg-orange-950/10 overflow-hidden'
                            : 'w-full'
                        }`}>
                          <div className="space-y-3 bg-zinc-50/80 dark:bg-zinc-900/90 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700/80 shadow-xs">
                            
                            {/* Top Bar / Controls Header */}
                            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-700/80 pb-2.5">
                              <span className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
                                <ImageIcon className="w-4 h-4" /> Scene Image & Positioning Studio
                              </span>

                              <div className="flex items-center gap-2">
                                {block.imageUrl && (
                                  <button
                                    onClick={() => updateBlock(block.id, { imageUrl: '' })}
                                    className="text-[11px] text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1 cursor-pointer"
                                  >
                                    <X className="w-3.5 h-3.5" /> Remove Image
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Position & Wrap Mode Selector Buttons */}
                            {block.imageUrl && (
                              <div className="space-y-2 bg-white dark:bg-zinc-950 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-[11px]">
                                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                                  <span>Text Wrap & Positioning:</span>
                                  <span className="font-bold text-orange-500 uppercase">{block.imageWrap || 'center'}</span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-6 gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => updateBlock(block.id, { imageWrap: 'left', imageWidth: block.imageWidth || '40%' })}
                                    className={`p-1.5 rounded border text-[11px] font-bold flex flex-col items-center gap-0.5 cursor-pointer transition-colors ${
                                      block.imageWrap === 'left'
                                        ? 'bg-orange-500 text-black border-orange-500'
                                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                                    }`}
                                    title="Float Left: Text wraps around the right side of the image"
                                  >
                                    <span>← Float Left</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => updateBlock(block.id, { imageWrap: 'center' })}
                                    className={`p-1.5 rounded border text-[11px] font-bold flex flex-col items-center gap-0.5 cursor-pointer transition-colors ${
                                      (!block.imageWrap || block.imageWrap === 'center')
                                        ? 'bg-orange-500 text-black border-orange-500'
                                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                                    }`}
                                    title="Centered Block"
                                  >
                                    <span>Center Block</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => updateBlock(block.id, { imageWrap: 'right', imageWidth: block.imageWidth || '40%' })}
                                    className={`p-1.5 rounded border text-[11px] font-bold flex flex-col items-center gap-0.5 cursor-pointer transition-colors ${
                                      block.imageWrap === 'right'
                                        ? 'bg-orange-500 text-black border-orange-500'
                                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                                    }`}
                                    title="Float Right: Text wraps around the left side of the image"
                                  >
                                    <span>Float Right →</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => updateBlock(block.id, { imageWrap: 'full', imageWidth: '100%' })}
                                    className={`p-1.5 rounded border text-[11px] font-bold flex flex-col items-center gap-0.5 cursor-pointer transition-colors ${
                                      block.imageWrap === 'full'
                                        ? 'bg-orange-500 text-black border-orange-500'
                                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                                    }`}
                                    title="Full Width Page Spread"
                                  >
                                    <span>↔ Full Bleed</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => updateBlock(block.id, { imageWrap: 'background-watermark', imageOpacity: block.imageOpacity || 0.2 })}
                                    className={`p-1.5 rounded border text-[11px] font-bold flex flex-col items-center gap-0.5 cursor-pointer transition-colors ${
                                      block.imageWrap === 'background-watermark'
                                        ? 'bg-orange-500 text-black border-orange-500'
                                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                                    }`}
                                    title="Behind Content (Scene Watermark)"
                                  >
                                    <span>🌊 Scene Overlay</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => updateBlock(block.id, { imageWrap: 'hero-header', imageWidth: '100%' })}
                                    className={`p-1.5 rounded border text-[11px] font-bold flex flex-col items-center gap-0.5 cursor-pointer transition-colors ${
                                      block.imageWrap === 'hero-header'
                                        ? 'bg-orange-500 text-black border-orange-500'
                                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                                    }`}
                                    title="Hero Banner Header"
                                  >
                                    <span>🌟 Hero Header</span>
                                  </button>
                                </div>

                                {/* Fine Tuning Sliders & Options */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                                  
                                  {/* Width Size */}
                                  <div>
                                    <label className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold block mb-1">
                                      Width Size ({block.imageWidth || '100%'})
                                    </label>
                                    <div className="flex items-center gap-1">
                                      {['25%', '33%', '50%', '75%', '100%'].map((w) => (
                                        <button
                                          key={w}
                                          type="button"
                                          onClick={() => updateBlock(block.id, { imageWidth: w })}
                                          className={`flex-1 py-1 text-[10px] rounded font-mono font-bold cursor-pointer ${
                                            (block.imageWidth || '100%') === w
                                              ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/40'
                                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                                          }`}
                                        >
                                          {w}
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Opacity */}
                                  <div>
                                    <label className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold block mb-1">
                                      Image Opacity ({Math.round((block.imageOpacity ?? 1) * 100)}%)
                                    </label>
                                    <input
                                      type="range"
                                      min="0.1"
                                      max="1.0"
                                      step="0.05"
                                      value={block.imageOpacity ?? 1.0}
                                      onChange={(e) => updateBlock(block.id, { imageOpacity: parseFloat(e.target.value) })}
                                      className="w-full accent-orange-600"
                                    />
                                  </div>

                                  {/* Frame Style */}
                                  <div>
                                    <label className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold block mb-1">
                                      Frame Effect Style
                                    </label>
                                    <select
                                      value={block.imageFrameStyle || 'none'}
                                      onChange={(e) => updateBlock(block.id, { imageFrameStyle: e.target.value as any })}
                                      className="w-full p-1 text-[11px] bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded font-semibold text-zinc-800 dark:text-zinc-200"
                                    >
                                      <option value="none">Clean Edge</option>
                                      <option value="shadow">Deep Shadow</option>
                                      <option value="polaroid">Polaroid Frame</option>
                                      <option value="vintage">Vintage Sepia</option>
                                      <option value="vignette">Dark Vignette</option>
                                      <option value="rounded">Rounded Pill</option>
                                    </select>
                                  </div>

                                </div>
                              </div>
                            )}

                            {/* Image Preview Container with Applied Frame Style & Opacity */}
                            {block.imageUrl ? (
                              <div className="space-y-3">
                                <div 
                                  className={`relative group mx-auto transition-all overflow-hidden ${
                                    block.imageFrameStyle === 'polaroid'
                                      ? 'p-4 bg-white dark:bg-zinc-100 shadow-xl rounded border-2 border-zinc-300 dark:border-zinc-200 transform -rotate-1'
                                      : block.imageFrameStyle === 'vintage'
                                      ? 'sepia contrast-125 border-4 border-amber-800/40 rounded-lg shadow-md'
                                      : block.imageFrameStyle === 'vignette'
                                      ? 'rounded-xl shadow-2xl ring-4 ring-black/80'
                                      : block.imageFrameStyle === 'shadow'
                                      ? 'rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-700'
                                      : block.imageFrameStyle === 'rounded'
                                      ? 'rounded-3xl border border-zinc-200 dark:border-zinc-700'
                                      : 'rounded-lg border border-zinc-200 dark:border-zinc-700'
                                  }`}
                                  style={{
                                    width: block.imageWidth || '100%',
                                    opacity: block.imageOpacity ?? 1.0,
                                  }}
                                >
                                  <img 
                                    src={block.imageUrl} 
                                    alt={block.imageCaption || "Book Illustration"} 
                                    className="max-h-[460px] w-full mx-auto object-contain bg-white dark:bg-zinc-900" 
                                    referrerPolicy="no-referrer"
                                  />

                                  {/* Watermark/Scene Badge Indicator */}
                                  {block.imageWrap === 'background-watermark' && (
                                    <div className="absolute top-2 left-2 bg-orange-600 text-black font-mono font-bold text-[10px] px-2 py-0.5 rounded shadow-sm">
                                      Scene Watermark Overlay
                                    </div>
                                  )}

                                  <div className="mt-3 flex items-center justify-center gap-2">
                                    <label className="px-3 py-1.5 bg-zinc-200 dark:bg-zinc-700 hover:bg-orange-500 hover:text-black text-zinc-800 dark:text-zinc-200 font-bold text-xs rounded transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs">
                                      <Upload className="w-3.5 h-3.5" />
                                      <span>Replace Image</span>
                                      <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden" 
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            const reader = new FileReader();
                                            reader.onload = (evt) => {
                                              if (evt.target?.result) {
                                                updateBlock(block.id, { imageUrl: evt.target.result as string });
                                              }
                                            };
                                            reader.readAsDataURL(file);
                                          }
                                        }}
                                      />
                                    </label>
                                    {onOpenImageGallery && (
                                      <button
                                        type="button"
                                        onClick={onOpenImageGallery}
                                        className="px-3 py-1.5 bg-[#FF6B00] hover:bg-orange-600 text-black font-bold text-xs rounded transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                                      >
                                        <ImageIcon className="w-3.5 h-3.5" />
                                        <span>Asset Gallery</span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              /* Local Device File Dropzone & Upload Button */
                              <div 
                                className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-orange-500 dark:hover:border-orange-500 rounded-xl p-6 bg-white dark:bg-zinc-900/80 transition-all flex flex-col items-center justify-center gap-3 cursor-pointer group"
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  const file = e.dataTransfer.files?.[0];
                                  if (file && file.type.startsWith('image/')) {
                                    const reader = new FileReader();
                                    reader.onload = (evt) => {
                                      if (evt.target?.result) {
                                        updateBlock(block.id, { imageUrl: evt.target.result as string });
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              >
                                <div className="w-12 h-12 rounded-full bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-200 dark:border-orange-800 group-hover:scale-110 transition-transform">
                                  <UploadCloud className="w-6 h-6" />
                                </div>

                                <div className="space-y-1 text-center">
                                  <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                                    Drag & drop any image or illustration from your local device
                                  </p>
                                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                    Supports PNG, JPG, JPEG, SVG, WebP, GIF & vector graphics
                                  </p>
                                </div>

                                <div className="flex items-center gap-3 my-1 w-full max-w-xs">
                                  <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
                                  <span className="text-[10px] uppercase font-bold text-zinc-400">or</span>
                                  <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
                                </div>

                                <div className="flex flex-wrap items-center justify-center gap-2">
                                  <label className="px-4 py-2 bg-[#FF6B00] hover:bg-orange-600 text-black font-extrabold text-xs rounded-lg shadow-md transition-colors cursor-pointer flex items-center gap-2">
                                    <Upload className="w-4 h-4" />
                                    <span>Browse & Upload File</span>
                                    <input 
                                      type="file" 
                                      accept="image/*" 
                                      className="hidden" 
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          const reader = new FileReader();
                                          reader.onload = (evt) => {
                                            if (evt.target?.result) {
                                              updateBlock(block.id, { imageUrl: evt.target.result as string });
                                            }
                                          };
                                          reader.readAsDataURL(file);
                                        }
                                      }}
                                    />
                                  </label>
                                  {onOpenImageGallery && (
                                    <button
                                      type="button"
                                      onClick={onOpenImageGallery}
                                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-extrabold text-xs rounded-lg border border-zinc-700 shadow-md transition-colors cursor-pointer flex items-center gap-2"
                                    >
                                      <ImageIcon className="w-4 h-4 text-orange-400" />
                                      <span>Select from Asset Library</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Alternative Image URL Input */}
                            <div className="pt-2 flex items-center gap-2">
                              <span className="text-[11px] text-zinc-400 font-semibold whitespace-nowrap">Image URL:</span>
                              <input
                                type="text"
                                value={block.imageUrl || ''}
                                onChange={(e) => updateBlock(block.id, { imageUrl: e.target.value })}
                                className="flex-1 text-xs p-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded focus:outline-hidden font-mono"
                                placeholder="Or paste external image web link (https://...)"
                              />
                            </div>

                            {/* Figure Caption Input */}
                            <div className="pt-1">
                              <input
                                type="text"
                                value={block.imageCaption || ''}
                                onChange={(e) => updateBlock(block.id, { imageCaption: e.target.value })}
                                className="w-full text-xs italic text-center text-zinc-600 dark:text-zinc-300 bg-transparent border-b border-dashed border-zinc-300 dark:border-zinc-700 focus:border-orange-500 focus:outline-hidden p-1"
                                placeholder="Add Figure / Illustration Caption (e.g., Figure 2.1: Experimental Setup)..."
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Callout / Quote */}
                      {block.type === 'quote' && (
                        <blockquote className="border-l-4 border-orange-500 pl-4 py-2 italic font-serif text-zinc-700 dark:text-zinc-300 bg-orange-50/20 dark:bg-orange-950/10 rounded-r">
                          <textarea
                            value={block.text}
                            onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                            style={{
                              fontFamily: block.fontFamily || 'Georgia, serif',
                              fontSize: `${block.fontSize || 16}px`
                            }}
                            className="w-full bg-transparent border-none focus:outline-hidden resize-none italic"
                            rows={2}
                          />
                        </blockquote>
                      )}

                      {/* Footnote Metadata Anchor */}
                      <div className="mt-1 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <input
                          type="text"
                          value={block.footnoteText || ''}
                          onChange={(e) => updateBlock(block.id, { footnoteText: e.target.value })}
                          className="text-[11px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded border border-zinc-300 dark:border-zinc-700 w-full"
                          placeholder="Add footnote citation reference..."
                        />
                      </div>

                      {/* Tracked Text Revisions Feed on Block */}
                      {showReviewMarkup && block.trackedChanges && block.trackedChanges.some(tc => tc.status === 'pending') && (
                        <div className="mt-2 p-2 bg-zinc-900 text-zinc-100 rounded-lg border border-orange-500/40 text-xs font-sans space-y-1 select-none">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-orange-400 flex items-center justify-between">
                            <span>Tracked Revisions ({block.trackedChanges.filter(tc => tc.status === 'pending').length})</span>
                            <span className="text-zinc-500 font-mono text-[9px]">Author: Editor</span>
                          </div>
                          {block.trackedChanges.filter(tc => tc.status === 'pending').map((tc) => (
                            <div key={tc.id} className="flex items-center justify-between gap-2 p-1.5 bg-zinc-800/90 rounded border border-zinc-700 text-[11px]">
                              <div className="flex-1 truncate">
                                {tc.type === 'insertion' ? (
                                  <span className="bg-emerald-500/20 text-emerald-300 px-1 py-0.5 rounded font-mono font-bold border-b border-emerald-500 mr-1.5">
                                    + Inserted:
                                  </span>
                                ) : (
                                  <span className="bg-rose-500/20 text-rose-300 px-1 py-0.5 rounded font-mono font-bold line-through border-b border-rose-500 mr-1.5">
                                    - Deleted:
                                  </span>
                                )}
                                <span className="italic font-serif">"{tc.text || tc.originalText}"</span>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onAcceptSingleChange && onAcceptSingleChange(block.id, tc.id);
                                  }}
                                  className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded cursor-pointer"
                                  title="Accept this change"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onRejectSingleChange && onRejectSingleChange(block.id, tc.id);
                                  }}
                                  className="p-1 bg-rose-600 hover:bg-rose-500 text-white rounded cursor-pointer"
                                  title="Reject this change"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>

              {/* Running Footer */}
              {headerFooter?.enabled && (
                <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3 mt-10 flex items-center justify-between text-xs text-zinc-500 font-serif select-none">
                  <input
                    type="text"
                    value={headerFooter.footerLeftText || ''}
                    onChange={(e) => onUpdateHeaderFooter?.({ ...headerFooter, footerLeftText: e.target.value })}
                    className="bg-transparent border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-orange-500 text-zinc-500 dark:text-zinc-400 text-xs w-1/3 focus:outline-hidden"
                    placeholder="Footer Left (Publisher)..."
                  />
                  <input
                    type="text"
                    value={headerFooter.footerCenterText || ''}
                    onChange={(e) => onUpdateHeaderFooter?.({ ...headerFooter, footerCenterText: e.target.value })}
                    className="bg-transparent border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-orange-500 text-center text-zinc-500 dark:text-zinc-400 text-xs w-1/3 focus:outline-hidden font-mono font-bold"
                    placeholder="Page {page}"
                  />
                  <input
                    type="text"
                    value={headerFooter.footerRightText || ''}
                    onChange={(e) => onUpdateHeaderFooter?.({ ...headerFooter, footerRightText: e.target.value })}
                    className="bg-transparent border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-orange-500 text-right text-zinc-500 dark:text-zinc-400 text-xs w-1/3 focus:outline-hidden"
                    placeholder="Footer Right (ISBN)..."
                  />
                </div>
              )}

            </div>

          </div>

        </div>

      </div>

      {/* Floating Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-12 right-6 z-50 bg-[#262626] border border-[#FF6B00] text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};
