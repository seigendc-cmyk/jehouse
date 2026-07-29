import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Cloud, 
  CloudOff, 
  Sun, 
  Moon, 
  Sunset,
  Palette,
  Sparkles, 
  Wand2, 
  Maximize2, 
  Download, 
  Type,
  Printer,
  Tv,
  HardDrive,
  Database,
  FileSpreadsheet,
  ChevronDown,
  Bookmark,
  Layers,
  FileText,
  Sliders,
  Check,
  GraduationCap,
  Building2,
  Image as ImageIcon,
  BookMarked,
  DownloadCloud,
  FolderOpen,
  Plus
} from 'lucide-react';
import { BookCategory, BookProject, UITheme } from '../types';
import { SidebarTab } from './Sidebar';

interface NavbarProps {
  project: BookProject;
  activeTab?: SidebarTab;
  onSelectTab?: (tab: SidebarTab) => void;
  onUpdateProject: (updated: Partial<BookProject>) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  uiTheme?: UITheme;
  onSelectUITheme?: (theme: UITheme) => void;
  autoAmbient: boolean;
  onToggleAutoAmbient: () => void;
  onOpenFocusMode: () => void;
  onOpenProofread: () => void;
  onOpenStoryContinuation: () => void;
  onOpenExportModal: () => void;
  onOpenPrintPreview: () => void;
  onOpenSeriesManager: () => void;
  onOpenCloudSync: () => void;
  onSaveToLocalDisk: () => void;
  onOpenSQLiteConsole?: () => void;
  onOpenCartoonGenerator?: () => void;
  onOpenProposalStudio?: () => void;
  onOpenEducationalStudio?: () => void;
  onOpenCompanyProfile?: () => void;
  onOpenDesignStudio?: () => void;
  onOpenGoogleFontsModal?: () => void;
  onOpenImageGallery?: () => void;
  onOpenProjectManager?: () => void;
  isOnline?: boolean;
  deferredPwaPrompt?: any;
  onInstallPwa?: () => void;
}


const CATEGORIES: BookCategory[] = [
  'Fiction & Literature',
  'Non-Fiction & Biography',
  'Academic & Textbook',
  'Business & Executive',
  'Science, Tech & Math',
  'Poetry & Arts'
];

export const Navbar: React.FC<NavbarProps> = ({
  project,
  activeTab = 'editor',
  onSelectTab,
  onUpdateProject,
  darkMode,
  onToggleDarkMode,
  uiTheme = 'sahara_dusk',
  onSelectUITheme,
  autoAmbient,
  onToggleAutoAmbient,
  onOpenFocusMode,
  onOpenProofread,
  onOpenStoryContinuation,
  onOpenExportModal,
  onOpenPrintPreview,
  onOpenSeriesManager,
  onOpenCloudSync,
  onSaveToLocalDisk,
  onOpenSQLiteConsole,
  onOpenCartoonGenerator,
  onOpenProposalStudio,
  onOpenEducationalStudio,
  onOpenCompanyProfile,
  onOpenDesignStudio,
  onOpenGoogleFontsModal,
  onOpenImageGallery,
  onOpenProjectManager,
  isOnline = true,
  deferredPwaPrompt,
  onInstallPwa
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(project.title);
  const [activeMenu, setActiveMenu] = useState<'file' | 'edit' | 'view' | 'studio' | 'theme' | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  // Close menus on click outside or ESC
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveMenu(null);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleInput.trim()) {
      onUpdateProject({ title: titleInput.trim() });
    } else {
      setTitleInput(project.title);
    }
  };

  const toggleMenu = (menu: 'file' | 'edit' | 'view' | 'studio' | 'theme') => {
    setActiveMenu((prev) => (prev === menu ? null : menu));
  };

  return (
    <header className="fixed top-2 left-2.5 right-2.5 h-14 border border-[#383838] bg-[#222222]/95 backdrop-blur-md rounded-xl px-3 sm:px-4 flex items-center justify-between text-[#E5E5E5] z-40 shadow-2xl ring-1 ring-white/10 select-none">
      
      {/* LEFT: Branding & Title & Traditional Dropdown Menus */}
      <div className="flex items-center gap-3" ref={menuRef}>
        
        {/* Brand Badge */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-[#FF6B00] flex items-center justify-center text-black font-black text-xs tracking-wider shadow-sm shrink-0">
            BP
          </div>
          <div className="hidden sm:block">
            {isEditingTitle ? (
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
                autoFocus
                className="font-bold text-white bg-[#111] px-2 py-0.5 rounded border border-[#FF6B00] text-xs focus:outline-hidden"
              />
            ) : (
              <h1 
                onClick={() => setIsEditingTitle(true)}
                className="font-bold text-white hover:text-[#FF6B00] cursor-pointer text-xs sm:text-sm flex items-center gap-1 transition-colors uppercase max-w-[180px] sm:max-w-[220px] truncate"
                title="Click to edit book title"
              >
                {project.title}
              </h1>
            )}
          </div>

          {onOpenProjectManager && (
            <button
              onClick={onOpenProjectManager}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 border border-orange-500/40 text-xs font-bold transition cursor-pointer"
              title="Open Book Manager, Archives & Start New Book"
            >
              <BookMarked className="w-3.5 h-3.5" />
              <span className="hidden md:inline">My Books</span>
            </button>
          )}
        </div>


        <div className="h-4 w-[1px] bg-zinc-700 hidden md:block" />

        {/* Traditional Desktop Dropdown Menu Bar */}
        <nav className="flex items-center gap-1 text-xs font-medium relative">
          
          {/* FILE MENU */}
          <div className="relative">
            <button
              onClick={() => toggleMenu('file')}
              className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer ${
                activeMenu === 'file' ? 'bg-[#333] text-[#FF6B00] font-bold' : 'hover:bg-[#333] text-zinc-300'
              }`}
            >
              <span>File</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>

            {activeMenu === 'file' && (
              <div className="absolute top-full left-0 mt-1 w-60 bg-[#262626] border border-[#444] rounded-lg shadow-2xl py-1 z-50 text-xs">
                {onOpenProjectManager && (
                  <button
                    onClick={() => { onOpenProjectManager(); setActiveMenu(null); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-[#333] text-orange-400 font-bold cursor-pointer"
                  >
                    <BookMarked className="w-3.5 h-3.5 text-orange-500" />
                    <span>Manage Books & Archives</span>
                  </button>
                )}
                <div className="my-1 border-t border-[#3a3a3a]" />
                <button
                  onClick={() => { onSaveToLocalDisk(); setActiveMenu(null); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-[#333] text-zinc-200 cursor-pointer"
                >
                  <HardDrive className="w-3.5 h-3.5 text-[#FF6B00]" />
                  <span>Save Project to Local Disk</span>
                </button>

                <button
                  onClick={() => { onOpenCloudSync(); setActiveMenu(null); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-[#333] text-zinc-200 cursor-pointer"
                >
                  <Cloud className="w-3.5 h-3.5 text-blue-400" />
                  <span>Cloud Sync & Account Settings</span>
                </button>
                {onOpenSQLiteConsole && (
                  <button
                    onClick={() => { onOpenSQLiteConsole(); setActiveMenu(null); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-[#333] text-zinc-200 cursor-pointer"
                  >
                    <Database className="w-3.5 h-3.5 text-emerald-400" />
                    <span>SQLite Database Console</span>
                  </button>
                )}
                <div className="my-1 border-t border-[#3a3a3a]" />
                <button
                  onClick={() => { onOpenExportModal(); setActiveMenu(null); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-[#333] text-zinc-200 font-semibold cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Publish & Export (PDF, DOCX, EPUB)</span>
                </button>
              </div>
            )}
          </div>

          {/* EDIT & AI MENU */}
          <div className="relative">
            <button
              onClick={() => toggleMenu('edit')}
              className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer ${
                activeMenu === 'edit' ? 'bg-[#333] text-[#FF6B00] font-bold' : 'hover:bg-[#333] text-zinc-300'
              }`}
            >
              <span>Edit & AI</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>

            {activeMenu === 'edit' && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-[#262626] border border-[#444] rounded-lg shadow-2xl py-1 z-50 text-xs">
                <button
                  onClick={() => { onOpenProofread(); setActiveMenu(null); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-[#333] text-zinc-200 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#FF6B00]" />
                  <span>AI Spellcheck & Proofread</span>
                </button>
                <button
                  onClick={() => { onOpenStoryContinuation(); setActiveMenu(null); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-[#333] text-zinc-200 cursor-pointer"
                >
                  <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>AI Co-Author / Story Assist</span>
                </button>
                {onOpenGoogleFontsModal && (
                  <button
                    onClick={() => { onOpenGoogleFontsModal(); setActiveMenu(null); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-[#333] text-zinc-200 cursor-pointer"
                  >
                    <Type className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Google Fonts Typography Studio</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* VIEW MENU */}
          <div className="relative">
            <button
              onClick={() => toggleMenu('view')}
              className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer ${
                activeMenu === 'view' ? 'bg-[#333] text-[#FF6B00] font-bold' : 'hover:bg-[#333] text-zinc-300'
              }`}
            >
              <span>View</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>

            {activeMenu === 'view' && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-[#262626] border border-[#444] rounded-lg shadow-2xl py-1 z-50 text-xs">
                <button
                  onClick={() => { onOpenPrintPreview(); setActiveMenu(null); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-[#333] text-zinc-200 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-[#FF6B00]" />
                  <span>Print & Page Layout Preview</span>
                </button>
                <button
                  onClick={() => { onOpenFocusMode(); setActiveMenu(null); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-[#333] text-zinc-200 cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>Focus Mode (Distraction-Free)</span>
                </button>
                <div className="my-1 border-t border-[#3a3a3a]" />
                
                <div className="px-3 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Workspace Themes</div>
                <button
                  onClick={() => { onSelectUITheme?.('sahara_dusk'); setActiveMenu(null); }}
                  className={`w-full flex items-center justify-between px-3 py-2 hover:bg-[#333] cursor-pointer ${
                    uiTheme === 'sahara_dusk' ? 'text-orange-400 font-bold bg-[#331815]' : 'text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Sunset className="w-3.5 h-3.5 text-orange-500" />
                    <span>Sahara Red Dusk (Default)</span>
                  </div>
                  {uiTheme === 'sahara_dusk' && <Check className="w-3 h-3 text-orange-400" />}
                </button>

                <button
                  onClick={() => { onSelectUITheme?.('classic_dark'); setActiveMenu(null); }}
                  className={`w-full flex items-center justify-between px-3 py-2 hover:bg-[#333] cursor-pointer ${
                    uiTheme === 'classic_dark' ? 'text-orange-400 font-bold bg-[#333]' : 'text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Moon className="w-3.5 h-3.5 text-zinc-300" />
                    <span>Midnight Charcoal</span>
                  </div>
                  {uiTheme === 'classic_dark' && <Check className="w-3 h-3 text-orange-400" />}
                </button>

                <button
                  onClick={() => { onSelectUITheme?.('warm_light'); setActiveMenu(null); }}
                  className={`w-full flex items-center justify-between px-3 py-2 hover:bg-[#333] cursor-pointer ${
                    uiTheme === 'warm_light' ? 'text-orange-400 font-bold bg-[#333]' : 'text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>Warm Ivory Light</span>
                  </div>
                  {uiTheme === 'warm_light' && <Check className="w-3 h-3 text-orange-400" />}
                </button>

                <div className="my-1 border-t border-[#3a3a3a]" />
                <button
                  onClick={() => { onToggleAutoAmbient(); setActiveMenu(null); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-[#333] text-zinc-200 cursor-pointer"
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Auto Ambient Lighting ({autoAmbient ? 'On' : 'Off'})</span>
                </button>
              </div>
            )}
          </div>

          {/* STUDIO MODULES MENU */}
          <div className="relative">
            <button
              onClick={() => toggleMenu('studio')}
              className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer ${
                activeMenu === 'studio' ? 'bg-[#333] text-[#FF6B00] font-bold' : 'hover:bg-[#333] text-zinc-300'
              }`}
            >
              <span>Modules</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>

            {activeMenu === 'studio' && (
              <div className="absolute top-full left-0 mt-1 w-60 bg-[#262626] border border-[#444] rounded-lg shadow-2xl py-1 z-50 text-xs">
                <button
                  onClick={() => { onOpenSeriesManager(); setActiveMenu(null); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-[#333] text-zinc-200 cursor-pointer"
                >
                  <Tv className="w-3.5 h-3.5 text-orange-400" />
                  <span>Series, Seasons & Episodes</span>
                </button>
                {onOpenCartoonGenerator && (
                  <button
                    onClick={() => { onOpenCartoonGenerator(); setActiveMenu(null); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-[#333] text-zinc-200 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>AI Cartoon & Comic Book Generator</span>
                  </button>
                )}
                {onOpenProposalStudio && (
                  <button
                    onClick={() => { onOpenProposalStudio(); setActiveMenu(null); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-[#333] text-zinc-200 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Proposal Studio & Financial Models</span>
                  </button>
                )}
                {onOpenEducationalStudio && (
                  <button
                    onClick={() => { onOpenEducationalStudio(); setActiveMenu(null); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-[#333] text-zinc-200 cursor-pointer"
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-orange-400" />
                    <span>Academic & Coloring Book Studio</span>
                  </button>
                )}
                {onOpenCompanyProfile && (
                  <button
                    onClick={() => { onOpenCompanyProfile(); setActiveMenu(null); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-[#333] text-zinc-200 cursor-pointer"
                  >
                    <Building2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Company Profile Studio</span>
                  </button>
                )}
                {onOpenDesignStudio && (
                  <button
                    onClick={() => { onOpenDesignStudio(); setActiveMenu(null); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-[#333] text-zinc-200 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-purple-400" />
                    <span>Flyers, Catalogues & Invitations Studio</span>
                  </button>
                )}
                {onOpenImageGallery && (
                  <button
                    onClick={() => { onOpenImageGallery(); setActiveMenu(null); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-[#333] text-zinc-200 cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-orange-400" />
                    <span>Image Gallery & Asset Library</span>
                  </button>
                )}
              </div>
            )}
          </div>

        </nav>
      </div>

      {/* CENTER: Clean Tab Navigation Bar */}
      {onSelectTab && (
        <div className="hidden lg:flex items-center bg-[#181818] border border-[#383838] p-1 rounded-lg gap-1 text-xs">
          <button
            onClick={() => onSelectTab('editor')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all font-semibold cursor-pointer ${
              activeTab === 'editor'
                ? 'bg-[#FF6B00] text-black shadow-sm'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#282828]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Manuscript</span>
          </button>

          <button
            onClick={() => onSelectTab('cover')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all font-semibold cursor-pointer ${
              activeTab === 'cover'
                ? 'bg-[#FF6B00] text-black shadow-sm'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#282828]'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Book Cover</span>
          </button>

          <button
            onClick={() => onSelectTab('frontmatter')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all font-semibold cursor-pointer ${
              activeTab === 'frontmatter'
                ? 'bg-[#FF6B00] text-black shadow-sm'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#282828]'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Front Matter</span>
          </button>

          <button
            onClick={() => onSelectTab('watermark')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all font-semibold cursor-pointer ${
              activeTab === 'watermark'
                ? 'bg-[#FF6B00] text-black shadow-sm'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#282828]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Watermark</span>
          </button>
        </div>
      )}

      {/* RIGHT: Status Indicator & Primary Action Buttons */}
      <div className="flex items-center gap-2">
        
        {/* Theme Selector Badge Button */}
        <div className="relative">
          <button
            onClick={() => toggleMenu('theme')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#2d1310] dark:bg-[#2a2a2a] hover:border-orange-500/60 text-orange-200 transition-colors border border-orange-500/30 cursor-pointer shadow-xs"
            title="Switch Workspace Color Aesthetic Theme"
          >
            {uiTheme === 'sahara_dusk' ? (
              <Sunset className="w-3.5 h-3.5 text-orange-400" />
            ) : uiTheme === 'classic_dark' ? (
              <Moon className="w-3.5 h-3.5 text-zinc-300" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="hidden md:inline font-bold">
              {uiTheme === 'sahara_dusk' ? 'Sahara Dusk' : uiTheme === 'classic_dark' ? 'Midnight' : 'Light'}
            </span>
            <ChevronDown className="w-3 h-3 text-orange-400/80" />
          </button>

          {activeMenu === 'theme' && (
            <div className="absolute top-full right-0 mt-1 w-56 bg-[#2b1310] dark:bg-[#262626] border border-[#56241e] dark:border-[#444] rounded-xl shadow-2xl py-1.5 z-50 text-xs">
              <div className="px-3 py-1 text-[10px] font-bold text-orange-400/80 uppercase tracking-wider">Aesthetic Palette</div>
              <button
                onClick={() => { onSelectUITheme?.('sahara_dusk'); setActiveMenu(null); }}
                className={`w-full flex items-center justify-between px-3 py-2 hover:bg-[#3f1a16] cursor-pointer ${
                  uiTheme === 'sahara_dusk' ? 'text-orange-400 font-bold bg-[#3f1a16]' : 'text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sunset className="w-3.5 h-3.5 text-orange-500" />
                  <span>Sahara Red Dusk (Default)</span>
                </div>
                {uiTheme === 'sahara_dusk' && <Check className="w-3 h-3 text-orange-400" />}
              </button>

              <button
                onClick={() => { onSelectUITheme?.('classic_dark'); setActiveMenu(null); }}
                className={`w-full flex items-center justify-between px-3 py-2 hover:bg-[#333] cursor-pointer ${
                  uiTheme === 'classic_dark' ? 'text-orange-400 font-bold bg-[#333]' : 'text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Moon className="w-3.5 h-3.5 text-zinc-300" />
                  <span>Midnight Charcoal</span>
                </div>
                {uiTheme === 'classic_dark' && <Check className="w-3 h-3 text-orange-400" />}
              </button>

              <button
                onClick={() => { onSelectUITheme?.('warm_light'); setActiveMenu(null); }}
                className={`w-full flex items-center justify-between px-3 py-2 hover:bg-[#333] cursor-pointer ${
                  uiTheme === 'warm_light' ? 'text-orange-400 font-bold bg-[#333]' : 'text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Warm Ivory Light</span>
                </div>
                {uiTheme === 'warm_light' && <Check className="w-3 h-3 text-orange-400" />}
              </button>
            </div>
          )}
        </div>

        {/* PWA Install Button (If install prompt ready) */}
        {deferredPwaPrompt && onInstallPwa && (
          <button
            onClick={onInstallPwa}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white transition-all border border-orange-400 shadow-md animate-pulse cursor-pointer"
            title="Install PressCraft Studio as a PWA App"
          >
            <DownloadCloud className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Install App</span>
          </button>
        )}

        {/* Sync / Online Status Indicator */}
        <button
          onClick={onOpenCloudSync}
          className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium bg-[#1a1a1a] border border-[#333] hover:border-zinc-500 transition-colors cursor-pointer"
          title={isOnline ? "Online & Firestore Persistent Sync Ready" : "Offline Mode - Saved Locally"}
        >
          {isOnline ? (
            <>
              <Cloud className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Online & Synced</span>
            </>
          ) : (
            <>
              <CloudOff className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-amber-500 font-semibold">Offline Mode</span>
            </>
          )}
        </button>


        {/* Image Gallery Button */}
        {onOpenImageGallery && (
          <button
            onClick={onOpenImageGallery}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#2a2a2a] hover:bg-[#333] text-zinc-200 transition-colors border border-[#444] cursor-pointer"
            title="Open Project Image Gallery & Asset Library"
          >
            <ImageIcon className="w-3.5 h-3.5 text-orange-400" />
            <span className="hidden md:inline">Asset Gallery</span>
          </button>
        )}

        {/* Print Preview Button */}
        <button
          onClick={onOpenPrintPreview}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#2a2a2a] hover:bg-[#333] text-zinc-200 transition-colors border border-[#444] cursor-pointer"
          title="Open Document Print & Page Layout Preview"
        >
          <Printer className="w-3.5 h-3.5 text-[#FF6B00]" />
          <span className="hidden sm:inline">Print Preview</span>
        </button>

        {/* Primary Action Button */}
        <button
          onClick={onOpenExportModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF6B00] hover:bg-orange-600 text-black font-extrabold text-xs shadow-md transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Publish</span>
        </button>
      </div>

    </header>
  );
};
