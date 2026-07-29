import React, { useState } from 'react';
import { 
  CartoonBookProject, 
  ArtStyle, 
  TargetAudience, 
  CartoonPage, 
  CartoonPanel 
} from '../types';
import { 
  generateCartoonScriptWithAI, 
  generatePanelImageWithAI 
} from '../cartoonAiService';
import { CartoonPageViewer } from './CartoonPageViewer';
import { CharacterSheetEditor } from './CharacterSheetEditor';
import { 
  Sparkles, 
  Wand2, 
  BookOpen, 
  Palette, 
  Users, 
  Download, 
  FileText, 
  ArrowRight, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw, 
  Layers, 
  Import, 
  Check, 
  Layout, 
  Zap, 
  Eye 
} from 'lucide-react';
import { BookProject, Chapter, ContentBlock } from '../../types';
import { exportToWordDocx } from '../../lib/exportUtils';

interface CartoonBookGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportToBookStudio?: (importedChapter: Chapter) => void;
}

export const CartoonBookGeneratorModal: React.FC<CartoonBookGeneratorModalProps> = ({
  isOpen,
  onClose,
  onImportToBookStudio
}) => {
  // Wizard State
  const [promptConcept, setPromptConcept] = useState('A cheerful robot dog named Sparky who learns how to bake cupcakes on Mars.');
  const [artStyle, setArtStyle] = useState<ArtStyle>('disney_3d');
  const [targetAudience, setTargetAudience] = useState<TargetAudience>('kids_6_8');
  const [pageCount, setPageCount] = useState<number>(3);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Active Project State
  const [cartoonProject, setCartoonProject] = useState<CartoonBookProject | null>(null);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'editor' | 'characters' | 'export'>('editor');
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);

  const handleGenerateCartoonBook = async () => {
    setIsGenerating(true);
    setImportSuccessMsg(null);
    try {
      const project = await generateCartoonScriptWithAI({
        promptConcept,
        artStyle,
        targetAudience,
        pageCount,
        mainCharactersCount: 2
      });
      setCartoonProject(project);
      setActivePageIndex(0);
      setActiveTab('editor');
    } catch (err) {
      console.error('Error generating cartoon book:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateCurrentPage = (updatedPage: CartoonPage) => {
    if (!cartoonProject) return;
    const updatedPages = cartoonProject.pages.map((p, idx) => {
      if (idx === activePageIndex) return updatedPage;
      return p;
    });
    setCartoonProject({ ...cartoonProject, pages: updatedPages });
  };

  /**
   * Import cartoon story pages into PressCraft book studio as a rich chapter with illustrated blocks
   */
  const handleImportToMainStudio = () => {
    if (!cartoonProject || !onImportToBookStudio) return;

    const chapterBlocks: ContentBlock[] = [];

    // Add intro quote or callout block
    chapterBlocks.push({
      id: `blk-intro-${Date.now()}`,
      type: 'callout',
      text: `AI Cartoon Graphic Storybook: ${cartoonProject.title} (${cartoonProject.artStyle.toUpperCase()} Style)`
    });

    cartoonProject.pages.forEach((page) => {
      chapterBlocks.push({
        id: `blk-pg-${page.pageNumber}-heading`,
        type: 'heading',
        text: `Page ${page.pageNumber}: ${page.pageTitle}`
      });

      if (page.narrativeText) {
        chapterBlocks.push({
          id: `blk-pg-${page.pageNumber}-narration`,
          type: 'paragraph',
          text: page.narrativeText
        });
      }

      page.panels.forEach((panel) => {
        // Image illustration block
        chapterBlocks.push({
          id: `blk-panel-${panel.id}-img`,
          type: 'paragraph',
          text: `[Cartoon Panel ${panel.panelNumber}]: ${panel.visualPrompt}`
        });

        panel.speechBubbles.forEach((bubble) => {
          chapterBlocks.push({
            id: `blk-bubble-${bubble.id}`,
            type: 'clause',
            text: `${bubble.speakerName.toUpperCase()}: "${bubble.text}"`
          });
        });

        if (panel.sfxText) {
          chapterBlocks.push({
            id: `blk-sfx-${panel.id}`,
            type: 'subheading',
            text: `💥 ${panel.sfxText}`
          });
        }
      });
    });

    const newChapter: Chapter = {
      id: `ch-cartoon-${Date.now()}`,
      number: 99, // Will be appended to end
      title: cartoonProject.title,
      blocks: chapterBlocks,
      wordCount: chapterBlocks.reduce((acc, b) => acc + (b.text?.split(/\s+/).length || 0), 0)
    };

    onImportToBookStudio(newChapter);
    setImportSuccessMsg(`Successfully imported "${cartoonProject.title}" into PressCraft Book Studio!`);
    setTimeout(() => setImportSuccessMsg(null), 4000);
  };

  /**
   * Export cartoon project as Word (.docx)
   */
  const handleExportToWordDocx = () => {
    if (!cartoonProject) return;

    // Convert cartoon book project to BookProject format for exporter
    const dummyBookProject: BookProject = {
      id: cartoonProject.id,
      title: cartoonProject.title,
      subtitle: cartoonProject.subtitle,
      author: 'AI Cartoonist',
      category: 'Fiction & Literature',
      cover: {
        title: cartoonProject.title,
        subtitle: cartoonProject.subtitle || '',
        author: 'AI Cartoonist',
        publisher: 'PressCraft Cartoon Press',
        coverBgColor: '#FF6B00',
        textColor: '#FFFFFF',
        accentColor: '#F59E0B',
        spineWidthMm: 12,
        backBlurb: 'An exciting AI-generated cartoon storybook.',
        layoutStyle: 'modern-minimal'
      },
      frontMatter: {
        includeTitlePage: true,
        includeCopyright: true,
        copyrightText: '© 2026 PressCraft Cartoon Press. All rights reserved.',
        isbn: '978-1-234567-89-0',
        publisher: 'PressCraft Cartoon Press',
        includeDedication: false,
        dedicationText: '',
        includeForeword: false,
        forewordAuthor: '',
        forewordContent: '',
        includeExecutiveSummary: false,
        executiveSummaryContent: '',
        includeTOC: true
      },
      exportSettings: {
        includeCover: true,
        includeFrontMatter: true,
        includeExecSummary: false,
        includeTOC: true,
        includeQuizzes: false,
        includeWatermark: false,
        includeFootnotes: false,
        trimSize: '8.5x11',
        fontPairing: 'Modern Sans',
        showRunningHeader: true,
        showPageNumbers: true,
        enableHyphenation: true,
        autoHyphenation: true
      },
      watermark: {
        enabled: false,
        text: 'DRAFT',
        opacity: 0.15,
        rotation: -45,
        fontSize: 72
      },
      cloudSynced: false,
      lastSaved: new Date().toISOString(),
      chapters: cartoonProject.pages.map((pg) => ({
        id: `pg-${pg.pageNumber}`,
        number: pg.pageNumber,
        title: pg.pageTitle,
        wordCount: 150,
        blocks: pg.panels.flatMap((p) => [
          {
            id: `blk-p-${p.id}`,
            type: 'subheading' as const,
            text: `Panel ${p.panelNumber}`
          },
          ...p.speechBubbles.map((b) => ({
            id: `blk-b-${b.id}`,
            type: 'quote' as const,
            text: `${b.speakerName}: "${b.text}"`
          })),
          {
            id: `blk-prompt-${p.id}`,
            type: 'paragraph' as const,
            text: p.visualPrompt
          }
        ])
      }))
    };

    exportToWordDocx(dummyBookProject);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-3 sm:p-6 overflow-hidden select-none">
      <div className="bg-[#181818] border border-[#333333] rounded-2xl max-w-6xl w-full h-[92vh] shadow-2xl flex flex-col overflow-hidden text-gray-100">
        
        {/* Modal Header Bar */}
        <div className="flex items-center justify-between border-b border-[#2A2A2A] px-6 py-4 bg-[#141414] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-[#FF6B00] to-amber-400 text-black shadow-lg">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                AI Cartoon & Comic Book Generator
                <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded-full font-mono font-bold">
                  v2.0 AI Module
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                Transform ideas into fully illustrated cartoon storybooks with custom AI panels, dialogue bubbles, and character cast sheets.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#2A2A2A] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Studio Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* AI Concept & Wizard Configuration Box */}
          <div className="bg-[#212121] border border-[#333] rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#2D2D2D] pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Wand2 className="w-4 h-4" />
                1. Cartoon Concept & Art Style Setup
              </span>
              <span className="text-xs text-gray-400 font-mono">
                Gemini 3.6 Flash & Image WASM Engine
              </span>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                Cartoon Story Prompt / Concept:
              </label>
              <textarea
                value={promptConcept}
                onChange={(e) => setPromptConcept(e.target.value)}
                rows={2}
                placeholder="Describe your cartoon story idea (e.g. A brave little rocket ship exploring a candy galaxy)..."
                className="w-full p-3 bg-[#141414] border border-[#333] rounded-xl text-xs text-white focus:outline-hidden focus:border-[#FF6B00] resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-1">
                  Art Style:
                </label>
                <select
                  value={artStyle}
                  onChange={(e) => setArtStyle(e.target.value as ArtStyle)}
                  className="w-full p-2.5 bg-[#141414] border border-[#333] rounded-xl text-xs text-amber-400 font-mono focus:outline-hidden focus:border-[#FF6B00] cursor-pointer"
                >
                  <option value="disney_3d">Disney/Pixar 3D Rendered</option>
                  <option value="classic_2d">Classic 2D Hand-Drawn Cartoon</option>
                  <option value="anime_manga">Vibrant Anime/Manga</option>
                  <option value="comic_book_pop">Pop-Art Retro Comic Book</option>
                  <option value="chibi_cute">Cute Chibi Cartoon</option>
                  <option value="watercolor_storybook">Watercolor Storybook</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-1">
                  Target Audience:
                </label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value as TargetAudience)}
                  className="w-full p-2.5 bg-[#141414] border border-[#333] rounded-xl text-xs text-blue-400 font-mono focus:outline-hidden focus:border-[#FF6B00] cursor-pointer"
                >
                  <option value="kids_3_5">Early Readers (Ages 3-5)</option>
                  <option value="kids_6_8">Children's Fiction (Ages 6-8)</option>
                  <option value="teens">Graphic Novel (Teens)</option>
                  <option value="all_ages">All Ages Family Comic</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-1">
                  Story Pages:
                </label>
                <select
                  value={pageCount}
                  onChange={(e) => setPageCount(Number(e.target.value))}
                  className="w-full p-2.5 bg-[#141414] border border-[#333] rounded-xl text-xs text-emerald-400 font-mono focus:outline-hidden focus:border-[#FF6B00] cursor-pointer"
                >
                  <option value={2}>2 Pages Short Strip</option>
                  <option value={3}>3 Pages Standard Story</option>
                  <option value={4}>4 Pages Deluxe Issue</option>
                  <option value={6}>6 Pages Full Graphic Book</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleGenerateCartoonBook}
                disabled={isGenerating || !promptConcept.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF6B00] to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-xl cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Writing & Drawing AI Cartoon...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate AI Cartoon Book</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generated Cartoon Project Studio Area */}
          {cartoonProject && (
            <div className="space-y-5 border-t border-[#2A2A2A] pt-5">
              
              {/* Studio Toolbar & Navigation Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#141414] p-3 rounded-xl border border-[#2D2D2D]">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('editor')}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                      activeTab === 'editor'
                        ? 'bg-[#FF6B00] text-black'
                        : 'bg-[#222] text-gray-300 hover:bg-[#333]'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Comic Page Canvas
                  </button>

                  <button
                    onClick={() => setActiveTab('characters')}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                      activeTab === 'characters'
                        ? 'bg-[#FF6B00] text-black'
                        : 'bg-[#222] text-gray-300 hover:bg-[#333]'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    Cast Character Sheets ({cartoonProject.characters.length})
                  </button>
                </div>

                {/* Import to Studio & Export Actions */}
                <div className="flex items-center gap-2">
                  {onImportToBookStudio && (
                    <button
                      onClick={handleImportToMainStudio}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-md"
                      title="Import as a Chapter into PressCraft Main Editor"
                    >
                      <Import className="w-3.5 h-3.5" />
                      <span>Import into Book Studio</span>
                    </button>
                  )}

                  <button
                    onClick={handleExportToWordDocx}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-md"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Export .docx</span>
                  </button>
                </div>
              </div>

              {/* Success Notification Alert */}
              {importSuccessMsg && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{importSuccessMsg}</span>
                </div>
              )}

              {/* TAB 1: Comic Page Canvas & Page Navigator */}
              {activeTab === 'editor' && (
                <div className="space-y-4">
                  {/* Page Pager controls */}
                  <div className="flex items-center justify-between bg-[#1F1F1F] px-4 py-2.5 rounded-xl border border-[#333]">
                    <button
                      onClick={() => setActivePageIndex(Math.max(0, activePageIndex - 1))}
                      disabled={activePageIndex === 0}
                      className="flex items-center gap-1 px-3 py-1 bg-[#2D2D2D] hover:bg-[#383838] disabled:opacity-30 text-white text-xs font-bold rounded cursor-pointer transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous Page
                    </button>

                    <div className="text-xs font-mono font-bold text-amber-400">
                      Page {activePageIndex + 1} of {cartoonProject.pages.length}
                    </div>

                    <button
                      onClick={() => setActivePageIndex(Math.min(cartoonProject.pages.length - 1, activePageIndex + 1))}
                      disabled={activePageIndex === cartoonProject.pages.length - 1}
                      className="flex items-center gap-1 px-3 py-1 bg-[#2D2D2D] hover:bg-[#383838] disabled:opacity-30 text-white text-xs font-bold rounded cursor-pointer transition-colors"
                    >
                      Next Page
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Page Viewer */}
                  {cartoonProject.pages[activePageIndex] && (
                    <CartoonPageViewer
                      page={cartoonProject.pages[activePageIndex]}
                      artStyle={cartoonProject.artStyle}
                      onUpdatePage={handleUpdateCurrentPage}
                      isEditable={true}
                    />
                  )}
                </div>
              )}

              {/* TAB 2: Character Cast Sheets */}
              {activeTab === 'characters' && (
                <CharacterSheetEditor
                  characters={cartoonProject.characters}
                  onUpdateCharacters={(updatedChars) => setCartoonProject({ ...cartoonProject, characters: updatedChars })}
                />
              )}

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="border-t border-[#2A2A2A] px-6 py-3 bg-[#141414] flex items-center justify-between text-xs text-gray-400 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Cartoon Studio Module • Independent Directory `/src/cartoonBook/`</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-bold rounded-lg transition-colors cursor-pointer"
          >
            Close Studio
          </button>
        </div>

      </div>
    </div>
  );
};
