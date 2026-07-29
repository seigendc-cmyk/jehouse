import React, { useState, useEffect } from 'react';
import { BookProject, Chapter, ContentBlock, CoverConfig, FrontMatter, WatermarkConfig, ExportSettings, ProofreadIssue, ProjectAsset, UITheme } from './types';
import { initialBookProject } from './data/initialBook';
import { Navbar } from './components/Navbar';
import { Sidebar, SidebarTab } from './components/Sidebar';
import { EditorCanvas } from './components/EditorCanvas';
import { CoverEditor } from './components/CoverEditor';
import { FrontMatterEditor } from './components/FrontMatterEditor';
import { WatermarkEditor } from './components/WatermarkEditor';
import { ExportSettingsTab } from './components/ExportSettingsTab';
import { ExportModal } from './components/ExportModal';
import { PrintPreviewModal } from './components/PrintPreviewModal';
import { SeriesManagerModal } from './components/SeriesManagerModal';
import { ProofreadDrawer } from './components/ProofreadDrawer';
import { StoryContinuationModal } from './components/StoryContinuationModal';
import { CloudSyncModal } from './components/CloudSyncModal';
import { SQLiteConsoleModal } from './components/SQLiteConsoleModal';
import { CartoonBookGeneratorModal } from './cartoonBook';
import { ProposalStudioModal } from './proposalStudio';
import { EducationalStudioModal } from './educationalBooks';
import { CompanyProfileStudioModal } from './companyProfile';
import { DesignStudioModal } from './designStudio';
import { GoogleFontsLoaderModal } from './components/GoogleFontsLoaderModal';
import { ImageGalleryModal } from './components/ImageGalleryModal';
import { ProjectManagerModal } from './components/ProjectManagerModal';
import { FocusMode } from './components/FocusMode';
import { saveToLocalDiskInDocuments } from './lib/exportUtils';
import { initSQLiteDB, saveProjectToSQLite, loadProjectFromSQLite } from './lib/sqliteDb';
import { safeSaveItem, safeLoadItem } from './lib/idbStorage';
import { syncProjectToCloud, fetchUserCloudProjects } from './lib/firebase';


export default function App() {
  // Multi-Project Storage & Active State
  const [projects, setProjects] = useState<BookProject[]>(() => {
    try {
      const saved = localStorage.getItem('presscraft_all_projects');
      return saved ? JSON.parse(saved) : [initialBookProject];
    } catch (e) {
      return [initialBookProject];
    }
  });

  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    try {
      return localStorage.getItem('presscraft_active_project_id') || initialBookProject.id;
    } catch {
      return initialBookProject.id;
    }
  });

  // Current Active Project Derived State
  const project = projects.find(p => p.id === activeProjectId) || projects[0] || initialBookProject;

  const [activeTab, setActiveTab] = useState<SidebarTab>('editor');
  const [activeChapterId, setActiveChapterId] = useState<string>(project.chapters[0]?.id || 'ch-1');
  const [isStorageLoaded, setIsStorageLoaded] = useState<boolean>(false);
  
  // Network & PWA Install Prompt State
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [deferredPwaPrompt, setDeferredPwaPrompt] = useState<any>(null);

  // Theme & Ambient Light State - Defaulting to Sahara Red Soils at Dusk
  const [uiTheme, setUITheme] = useState<UITheme>(() => {
    try {
      const saved = localStorage.getItem('presscraft_ui_theme');
      if (saved === 'sahara_dusk' || saved === 'classic_dark' || saved === 'warm_light') {
        return saved;
      }
    } catch (e) {}
    return 'sahara_dusk';
  });
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [autoAmbient, setAutoAmbient] = useState<boolean>(true);

  // Modals & Drawers
  const [isProjectManagerOpen, setIsProjectManagerOpen] = useState<boolean>(false);
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState<boolean>(false);
  const [isSeriesManagerOpen, setIsSeriesManagerOpen] = useState<boolean>(false);
  const [isProofreadOpen, setIsProofreadOpen] = useState<boolean>(false);
  const [isStoryContinuationOpen, setIsStoryContinuationOpen] = useState<boolean>(false);
  const [isCloudSyncOpen, setIsCloudSyncOpen] = useState<boolean>(false);
  const [isSQLiteConsoleOpen, setIsSQLiteConsoleOpen] = useState<boolean>(false);
  const [isCartoonGeneratorOpen, setIsCartoonGeneratorOpen] = useState<boolean>(false);
  const [isProposalStudioOpen, setIsProposalStudioOpen] = useState<boolean>(false);
  const [isEducationalStudioOpen, setIsEducationalStudioOpen] = useState<boolean>(false);
  const [isCompanyProfileOpen, setIsCompanyProfileOpen] = useState<boolean>(false);
  const [isDesignStudioOpen, setIsDesignStudioOpen] = useState<boolean>(false);
  const [isGoogleFontsOpen, setIsGoogleFontsOpen] = useState<boolean>(false);
  const [isImageGalleryOpen, setIsImageGalleryOpen] = useState<boolean>(false);

  // AI Proofread state
  const [proofreadIssues, setProofreadIssues] = useState<ProofreadIssue[]>([]);
  const [isProofreadLoading, setIsProofreadLoading] = useState<boolean>(false);

  // 1. Listen for Network Online/Offline Status and PWA Install Prompt
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Trigger cloud sync when connection returns
      if (project) {
        syncProjectToCloud(project);
      }
    };
    const handleOffline = () => setIsOnline(false);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPwaPrompt(e);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [project]);

  const handleInstallPwa = async () => {
    if (!deferredPwaPrompt) return;
    deferredPwaPrompt.prompt();
    const choiceResult = await deferredPwaPrompt.userChoice;
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted PressCraft PWA installation');
    }
    setDeferredPwaPrompt(null);
  };

  // 2. Load projects from IndexedDB or Cloud on mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const idbProjects = await safeLoadItem<BookProject[]>('presscraft_all_projects');
        if (idbProjects && Array.isArray(idbProjects) && idbProjects.length > 0 && isMounted) {
          setProjects(idbProjects);
        } else {
          const singleIdbProject = await safeLoadItem<BookProject>('presscraft_book_project');
          if (singleIdbProject && isMounted) {
            setProjects([singleIdbProject]);
          }
        }

        // Try fetching cloud synced projects from Firebase if online
        if (navigator.onLine) {
          const cloudProjects = await fetchUserCloudProjects();
          if (cloudProjects.length > 0 && isMounted) {
            setProjects((prev) => {
              const merged = [...prev];
              cloudProjects.forEach((cp) => {
                const idx = merged.findIndex((p) => p.id === cp.id);
                if (idx >= 0) {
                  merged[idx] = cp;
                } else {
                  merged.push(cp);
                }
              });
              return merged;
            });
          }
        }
      } catch (err) {
        console.warn('Storage initial load notice:', err);
      } finally {
        if (isMounted) setIsStorageLoaded(true);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  // 3. Auto-save local persistence (IndexedDB + safe LocalStorage) & Firebase Cloud Sync
  useEffect(() => {
    if (!isStorageLoaded) return;
    let isMounted = true;
    (async () => {
      try {
        await safeSaveItem('presscraft_all_projects', projects);
        await safeSaveItem('presscraft_book_project', project);
        localStorage.setItem('presscraft_active_project_id', activeProjectId);
        await saveProjectToSQLite(project);

        // Sync active project to Firebase Cloud when online
        if (navigator.onLine && project) {
          await syncProjectToCloud(project);
        }
      } catch (e) {
        console.warn('Project background save notice:', e);
      }
    })();
    return () => { isMounted = false; };
  }, [project, projects, activeProjectId, isStorageLoaded]);

  // Keep activeChapterId in sync when project changes
  useEffect(() => {
    if (project && (!project.chapters.some(c => c.id === activeChapterId))) {
      setActiveChapterId(project.chapters[0]?.id || 'ch-1');
    }
  }, [project, activeChapterId]);


  // Ambient Light level / time of day auto theme switcher
  useEffect(() => {
    if (!autoAmbient) return;

    const hour = new Date().getHours();
    // Evening / Night hours (6 PM to 6 AM) -> Sahara Dusk / Dark; Daytime -> Light
    const isNight = hour >= 18 || hour < 6;
    setUITheme(isNight ? 'sahara_dusk' : 'warm_light');
  }, [autoAmbient]);

  // Sync theme classes on document element
  useEffect(() => {
    try {
      localStorage.setItem('presscraft_ui_theme', uiTheme);
    } catch (e) {}

    document.documentElement.classList.remove('theme-sahara-dusk', 'theme-classic-dark', 'theme-warm-light');

    if (uiTheme === 'sahara_dusk') {
      document.documentElement.classList.add('theme-sahara-dusk', 'dark');
      setDarkMode(true);
    } else if (uiTheme === 'classic_dark') {
      document.documentElement.classList.add('theme-classic-dark', 'dark');
      setDarkMode(true);
    } else {
      document.documentElement.classList.add('theme-warm-light');
      document.documentElement.classList.remove('dark');
      setDarkMode(false);
    }
  }, [uiTheme]);

  // Project update helper for current active project
  const handleUpdateProject = (partial: Partial<BookProject>) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === activeProjectId) {
          return {
            ...p,
            ...partial,
            lastSaved: new Date().toISOString()
          };
        }
        return p;
      })
    );
  };

  const handleCreateProject = (newProj: BookProject) => {
    setProjects((prev) => [newProj, ...prev]);
    setActiveProjectId(newProj.id);
  };

  const handleUpdateProjectInList = (updatedProj: BookProject) => {
    setProjects((prev) => prev.map((p) => (p.id === updatedProj.id ? updatedProj : p)));
  };

  const handleDeleteProject = (projId: string) => {
    setProjects((prev) => {
      const remaining = prev.filter((p) => p.id !== projId);
      if (projId === activeProjectId && remaining.length > 0) {
        setActiveProjectId(remaining[0].id);
      }
      return remaining.length > 0 ? remaining : [initialBookProject];
    });
  };


  // Chapter update helper
  const handleUpdateChapter = (updatedChapter: Chapter) => {
    const updatedChapters = project.chapters.map((c) => (c.id === updatedChapter.id ? updatedChapter : c));
    handleUpdateProject({ chapters: updatedChapters });
  };

  // Add new chapter
  const handleAddChapter = () => {
    const newChapterNum = project.chapters.length + 1;
    const newChapter: Chapter = {
      id: `ch-${Date.now()}`,
      number: newChapterNum,
      title: `Chapter ${newChapterNum}: New Chapter`,
      wordCount: 0,
      blocks: [
        {
          id: `b-${Date.now()}-1`,
          type: 'heading',
          text: `Chapter ${newChapterNum} Introduction`
        },
        {
          id: `b-${Date.now()}-2`,
          type: 'paragraph',
          text: 'Begin drafting your new chapter here...'
        }
      ]
    };

    handleUpdateProject({ chapters: [...project.chapters, newChapter] });
    setActiveChapterId(newChapter.id);
    setActiveTab('editor');
  };

  // Delete chapter
  const handleDeleteChapter = (id: string) => {
    if (project.chapters.length <= 1) return;
    const filtered = project.chapters.filter((c) => c.id !== id);
    // Renumber remaining chapters
    const renumbered = filtered.map((c, idx) => ({ ...c, number: idx + 1 }));
    handleUpdateProject({ chapters: renumbered });
    if (activeChapterId === id) {
      setActiveChapterId(renumbered[0].id);
    }
  };

  // Run AI Proofread for active chapter text
  const handleRunProofread = async () => {
    setIsProofreadLoading(true);
    setIsProofreadOpen(true);
    
    const activeChapter = project.chapters.find((c) => c.id === activeChapterId);
    const textToProofread = activeChapter ? activeChapter.blocks.map((b) => b.text).join('\n') : '';

    try {
      const res = await fetch('/api/ai/proofread', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToProofread,
          context: `Book Title: "${project.title}", Category: "${project.category}"`
        })
      });

      const data = await res.json();
      setProofreadIssues(data.issues || []);
    } catch (e) {
      console.error(e);
      setProofreadIssues([]);
    } finally {
      setIsProofreadLoading(false);
    }
  };

  // Apply single proofread correction
  const handleApplyCorrection = (issue: ProofreadIssue) => {
    const activeChapter = project.chapters.find((c) => c.id === activeChapterId);
    if (!activeChapter) return;

    const updatedBlocks = activeChapter.blocks.map((block) => {
      if (block.text.includes(issue.originalText)) {
        return {
          ...block,
          text: block.text.replace(issue.originalText, issue.correction)
        };
      }
      return block;
    });

    handleUpdateChapter({ ...activeChapter, blocks: updatedBlocks });
    setProofreadIssues((prev) => prev.filter((i) => i.originalText !== issue.originalText));
  };

  // Generate Executive Summary with AI
  const handleGenerateAIExecSummary = async () => {
    const chaptersText = project.chapters.map((c) => `Chapter ${c.number}: ${c.title}\n${c.blocks.map(b => b.text).join(' ')}`).join('\n\n');

    try {
      const res = await fetch('/api/ai/executive-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookTitle: project.title,
          chaptersContent: chaptersText
        })
      });

      const data = await res.json();
      if (data.summary) {
        handleUpdateProject({
          frontMatter: {
            ...project.frontMatter,
            executiveSummaryContent: data.summary,
            includeExecutiveSummary: true
          }
        });
      }
    } catch (e) {
      console.error('Failed to generate summary:', e);
    }
  };

  // Apply AI Story continuation to active chapter
  const handleApplyStoryContinuation = (newText: string) => {
    const activeChapter = project.chapters.find((c) => c.id === activeChapterId);
    if (!activeChapter) return;

    const newBlock = {
      id: `b-${Date.now()}`,
      type: 'paragraph' as const,
      text: newText,
      fontStyle: 'serif' as const
    };

    handleUpdateChapter({
      ...activeChapter,
      blocks: [...activeChapter.blocks, newBlock]
    });
  };

  // Review Mode & Track Changes State Handlers
  const handleToggleReviewMode = () => {
    handleUpdateProject({
      isReviewModeActive: !project.isReviewModeActive,
      showReviewMarkup: project.showReviewMarkup ?? true
    });
  };

  const handleToggleShowMarkup = () => {
    handleUpdateProject({
      showReviewMarkup: !(project.showReviewMarkup ?? true)
    });
  };

  const handleAcceptAllChanges = () => {
    const activeChapter = project.chapters.find((c) => c.id === activeChapterId);
    if (!activeChapter) return;

    const updatedBlocks = activeChapter.blocks
      .filter((b) => !b.isDeletedInReview)
      .map((b) => ({
        ...b,
        isInsertedInReview: undefined,
        isDeletedInReview: undefined,
        trackedChanges: (b.trackedChanges || []).map((tc) => ({ ...tc, status: 'accepted' as const }))
      }));

    handleUpdateChapter({ ...activeChapter, blocks: updatedBlocks });
  };

  const handleRejectAllChanges = () => {
    const activeChapter = project.chapters.find((c) => c.id === activeChapterId);
    if (!activeChapter) return;

    const updatedBlocks = activeChapter.blocks
      .filter((b) => !b.isInsertedInReview)
      .map((b) => {
        const pending = (b.trackedChanges || []).filter((tc) => tc.status === 'pending');
        const oldestOriginalText = pending.find((tc) => tc.originalText !== undefined)?.originalText;
        return {
          ...b,
          text: oldestOriginalText !== undefined ? oldestOriginalText : b.text,
          isDeletedInReview: undefined,
          isInsertedInReview: undefined,
          trackedChanges: (b.trackedChanges || []).map((tc) => ({ ...tc, status: 'rejected' as const }))
        };
      });

    handleUpdateChapter({ ...activeChapter, blocks: updatedBlocks });
  };

  const handleAcceptSingleChange = (blockId: string, changeId?: string) => {
    const activeChapter = project.chapters.find((c) => c.id === activeChapterId);
    if (!activeChapter) return;

    const updatedBlocks = activeChapter.blocks
      .map((b) => {
        if (b.id !== blockId) return b;

        if (!changeId) {
          if (b.isDeletedInReview) return null; // Remove deleted block
          return {
            ...b,
            isInsertedInReview: undefined,
            isDeletedInReview: undefined,
            trackedChanges: (b.trackedChanges || []).map((tc) => ({ ...tc, status: 'accepted' as const }))
          };
        }

        const updatedTracked = (b.trackedChanges || []).map((tc) =>
          tc.id === changeId ? { ...tc, status: 'accepted' as const } : tc
        );
        return {
          ...b,
          trackedChanges: updatedTracked
        };
      })
      .filter(Boolean) as ContentBlock[];

    handleUpdateChapter({ ...activeChapter, blocks: updatedBlocks });
  };

  const handleRejectSingleChange = (blockId: string, changeId?: string) => {
    const activeChapter = project.chapters.find((c) => c.id === activeChapterId);
    if (!activeChapter) return;

    const updatedBlocks = activeChapter.blocks
      .map((b) => {
        if (b.id !== blockId) return b;

        if (!changeId) {
          if (b.isInsertedInReview) return null; // Remove inserted block
          return {
            ...b,
            isDeletedInReview: undefined,
            isInsertedInReview: undefined,
            trackedChanges: (b.trackedChanges || []).map((tc) => ({ ...tc, status: 'rejected' as const }))
          };
        }

        const targetChange = (b.trackedChanges || []).find((tc) => tc.id === changeId);
        const updatedText = targetChange?.originalText !== undefined ? targetChange.originalText : b.text;

        const updatedTracked = (b.trackedChanges || []).map((tc) =>
          tc.id === changeId ? { ...tc, status: 'rejected' as const } : tc
        );

        return {
          ...b,
          text: updatedText,
          trackedChanges: updatedTracked
        };
      })
      .filter(Boolean) as ContentBlock[];

    handleUpdateChapter({ ...activeChapter, blocks: updatedBlocks });
  };

  const handleInsertImageToChapter = (
    imageOrAsset: ProjectAsset | string,
    captionOrChapterId?: string,
    chapterId?: string
  ) => {
    let imageUrl = '';
    let caption = '';
    let targetChapterId = activeChapterId;

    if (typeof imageOrAsset === 'string') {
      imageUrl = imageOrAsset;
      caption = captionOrChapterId || '';
      if (chapterId) {
        targetChapterId = chapterId;
      }
    } else {
      imageUrl = imageOrAsset.url;
      caption = imageOrAsset.caption || imageOrAsset.name;
      if (captionOrChapterId) {
        targetChapterId = captionOrChapterId;
      }
    }

    const targetChapter = project.chapters.find((c) => c.id === targetChapterId) || activeChapter;
    if (!targetChapter) return;

    const newBlock: ContentBlock = {
      id: `b-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: 'image',
      text: '',
      imageUrl: imageUrl,
      imageCaption: caption,
      fontFamily: 'Georgia, serif',
      fontSize: 16,
      align: 'center',
    };

    const updatedChapters = project.chapters.map((ch) => {
      if (ch.id === targetChapter.id) {
        return {
          ...ch,
          blocks: [...ch.blocks, newBlock],
        };
      }
      return ch;
    });

    handleUpdateProject({ chapters: updatedChapters });
  };

  const activeChapter = project.chapters.find((c) => c.id === activeChapterId) || project.chapters[0];

  return (
    <div className={`h-screen w-screen ${uiTheme === 'sahara_dusk' ? 'theme-sahara-dusk bg-[#1c0d0b]' : uiTheme === 'classic_dark' ? 'theme-classic-dark bg-[#141414]' : 'theme-warm-light bg-[#faf9f5]'} text-zinc-100 font-sans flex flex-col overflow-hidden relative transition-colors duration-200`}>
      
      {/* Floating Top Navbar Header */}
      <Navbar
        project={project}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onUpdateProject={handleUpdateProject}
        darkMode={darkMode}
        onToggleDarkMode={() => {
          setAutoAmbient(false);
          setUITheme(uiTheme === 'warm_light' ? 'sahara_dusk' : 'warm_light');
        }}
        uiTheme={uiTheme}
        onSelectUITheme={(t) => {
          setAutoAmbient(false);
          setUITheme(t);
        }}
        autoAmbient={autoAmbient}
        onToggleAutoAmbient={() => setAutoAmbient(!autoAmbient)}
        onOpenFocusMode={() => setIsFocusMode(true)}
        onOpenProofread={handleRunProofread}
        onOpenStoryContinuation={() => setIsStoryContinuationOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenPrintPreview={() => setIsPrintPreviewOpen(true)}
        onOpenSeriesManager={() => setIsSeriesManagerOpen(true)}
        onOpenCloudSync={() => setIsCloudSyncOpen(true)}
        onSaveToLocalDisk={() => saveToLocalDiskInDocuments(project)}
        onOpenSQLiteConsole={() => setIsSQLiteConsoleOpen(true)}
        onOpenCartoonGenerator={() => setIsCartoonGeneratorOpen(true)}
        onOpenProposalStudio={() => setIsProposalStudioOpen(true)}
        onOpenEducationalStudio={() => setIsEducationalStudioOpen(true)}
        onOpenCompanyProfile={() => setIsCompanyProfileOpen(true)}
        onOpenDesignStudio={() => setIsDesignStudioOpen(true)}
        onOpenGoogleFontsModal={() => setIsGoogleFontsOpen(true)}
        onOpenImageGallery={() => setIsImageGalleryOpen(true)}
        onOpenProjectManager={() => setIsProjectManagerOpen(true)}
        isOnline={isOnline}
        deferredPwaPrompt={deferredPwaPrompt}
        onInstallPwa={handleInstallPwa}
      />


      {/* Main Studio Body Workspace with Floating Sidebar */}
      <div className="flex-1 flex overflow-hidden relative h-full w-full">
        
        {/* Floating Left Sidebar Navigation */}
        <Sidebar
          project={project}
          activeTab={activeTab}
          activeChapterId={activeChapterId}
          onSelectTab={setActiveTab}
          onSelectChapter={setActiveChapterId}
          onAddChapter={handleAddChapter}
          onDeleteChapter={handleDeleteChapter}
          onReorderChapters={(reorderedChapters) => handleUpdateProject({ chapters: reorderedChapters })}
          onOpenSeriesManager={() => setIsSeriesManagerOpen(true)}
          onOpenEducationalStudio={() => setIsEducationalStudioOpen(true)}
          onOpenCompanyProfile={() => setIsCompanyProfileOpen(true)}
          onOpenDesignStudio={() => setIsDesignStudioOpen(true)}
          onOpenImageGallery={() => setIsImageGalleryOpen(true)}
          isReviewModeActive={project.isReviewModeActive}
          showReviewMarkup={project.showReviewMarkup ?? true}
          onToggleReviewMode={handleToggleReviewMode}
          onToggleShowMarkup={handleToggleShowMarkup}
          onAcceptAllChanges={handleAcceptAllChanges}
          onRejectAllChanges={handleRejectAllChanges}
          onAcceptSingleChange={handleAcceptSingleChange}
          onRejectSingleChange={handleRejectSingleChange}
        />

        {/* Center Active Workspace View offset for Floating Header (pt-[4.25rem]), Floating Sidebar (pl-[16.25rem]), and Footer (pb-[2rem]) */}
        <main className="flex-1 flex flex-col overflow-hidden pt-[4.25rem] pl-[16.25rem] pb-[2rem] h-full w-full">
          {activeTab === 'editor' && (
            <EditorCanvas
              chapter={activeChapter}
              watermark={project.watermark}
              trimSize={project.exportSettings.trimSize}
              headerFooter={project.headerFooter}
              isReviewModeActive={project.isReviewModeActive}
              showReviewMarkup={project.showReviewMarkup ?? true}
              onToggleReviewMode={handleToggleReviewMode}
              onToggleShowMarkup={handleToggleShowMarkup}
              onAcceptAllChanges={handleAcceptAllChanges}
              onRejectAllChanges={handleRejectAllChanges}
              onAcceptSingleChange={handleAcceptSingleChange}
              onRejectSingleChange={handleRejectSingleChange}
              onUpdateChapter={handleUpdateChapter}
              onUpdateTrimSize={(trimSize) =>
                handleUpdateProject({
                  exportSettings: { ...project.exportSettings, trimSize }
                })
              }
              onUpdateHeaderFooter={(headerFooter) =>
                handleUpdateProject({ headerFooter })
              }
              onTriggerProofread={handleRunProofread}
              onTriggerStoryContinuation={() => setIsStoryContinuationOpen(true)}
              onOpenImageGallery={() => setIsImageGalleryOpen(true)}
            />
          )}

          {activeTab === 'cover' && (
            <CoverEditor
              cover={project.cover}
              totalPages={project.chapters.length * 15}
              onUpdateCover={(cover) => handleUpdateProject({ 
                cover,
                title: cover.title || project.title,
                subtitle: cover.subtitle || project.subtitle,
                author: cover.author || project.author,
              })}
              onOpenImageGallery={() => setIsImageGalleryOpen(true)}
            />
          )}

          {activeTab === 'frontmatter' && (
            <FrontMatterEditor
              frontMatter={project.frontMatter}
              bookTitle={project.title}
              bookSubtitle={project.subtitle}
              bookAuthor={project.author}
              chapters={project.chapters}
              onUpdateFrontMatter={(frontMatter) => handleUpdateProject({ frontMatter })}
              onUpdateProjectMetadata={(meta) => handleUpdateProject({
                title: meta.title ?? project.title,
                subtitle: meta.subtitle ?? project.subtitle,
                author: meta.author ?? project.author,
                frontMatter: {
                  ...project.frontMatter,
                  publisher: meta.publisher ?? project.frontMatter.publisher
                },
                cover: {
                  ...project.cover,
                  title: meta.title ?? project.cover.title,
                  subtitle: meta.subtitle ?? project.cover.subtitle,
                  author: meta.author ?? project.author,
                  publisher: meta.publisher ?? project.cover.publisher
                }
              })}
              onGenerateAIExecSummary={handleGenerateAIExecSummary}
            />
          )}

          {activeTab === 'watermark' && (
            <WatermarkEditor
              watermark={project.watermark}
              onUpdateWatermark={(watermark) => handleUpdateProject({ watermark })}
            />
          )}

          {activeTab === 'exportSettings' && (
            <ExportSettingsTab
              project={project}
              onUpdateExportSettings={(exportSettings) => handleUpdateProject({ exportSettings })}
              onUpdateBibliography={(bibliography) => handleUpdateProject({ bibliography })}
              onOpenPrintPreview={() => setIsPrintPreviewOpen(true)}
            />
          )}
        </main>

      </div>

      {/* Professional Polish Bottom Status Bar Footer */}
      <footer className="fixed bottom-0 left-0 right-0 h-8 items-center justify-between bg-[#262626] px-4 text-[10px] text-gray-400 border-t border-[#333333] z-40 select-none font-sans flex">
        <div className="flex items-center gap-4">
          <span>Words: <strong className="text-gray-200">{project.chapters.reduce((acc, c) => acc + c.wordCount, 0).toLocaleString()}</strong></span>
          <span>Pages: <strong className="text-gray-200">~{Math.max(1, Math.ceil(project.chapters.reduce((acc, c) => acc + c.wordCount, 0) / 350))}</strong></span>
          <span>Focus Mode: <span className={isFocusMode ? "text-[#FF6B00] font-bold" : "text-gray-500"}>{isFocusMode ? "Active" : "Inactive"}</span></span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-emerald-400 font-medium">Spellcheck: OK</span>
          <span>Grammar: <span className={proofreadIssues.length > 0 ? "text-amber-400 font-bold" : "text-gray-400"}>{proofreadIssues.length} {proofreadIssues.length === 1 ? 'Warning' : 'Warnings'}</span></span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setAutoAmbient(!autoAmbient)}
              className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors"
              title="Toggle Day Mode Auto-Switch"
            >
              <div className={`h-3.5 w-8 rounded-full flex items-center p-0.5 transition-colors ${autoAmbient ? 'bg-[#FF6B00]' : 'bg-gray-700'}`}>
                <div className={`h-2.5 w-2.5 rounded-full bg-black transition-transform ${autoAmbient ? 'translate-x-4 bg-black' : 'translate-x-0 bg-white'}`} />
              </div>
              <span className="text-gray-300 font-medium">Day Mode Auto-Switch</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Drawers & Modals */}
      <ProofreadDrawer
        isOpen={isProofreadOpen}
        onClose={() => setIsProofreadOpen(false)}
        isLoading={isProofreadLoading}
        issues={proofreadIssues}
        onApplyCorrection={handleApplyCorrection}
        onRunProofread={handleRunProofread}
      />

      <StoryContinuationModal
        isOpen={isStoryContinuationOpen}
        onClose={() => setIsStoryContinuationOpen(false)}
        chapterTitle={activeChapter.title}
        onApplyContinuation={handleApplyStoryContinuation}
      />

      <ExportModal
        project={project}
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onUpdateExportSettings={(exportSettings) => handleUpdateProject({ exportSettings })}
        onImportProject={(importedProject) => handleCreateProject(importedProject)}
        onOpenPrintPreview={() => setIsPrintPreviewOpen(true)}
      />

      <PrintPreviewModal
        project={project}
        isOpen={isPrintPreviewOpen}
        onClose={() => setIsPrintPreviewOpen(false)}
      />

      <SeriesManagerModal
        project={project}
        isOpen={isSeriesManagerOpen}
        onClose={() => setIsSeriesManagerOpen(false)}
        onUpdateProject={handleUpdateProject}
        onOpenPrintPreview={() => setIsPrintPreviewOpen(true)}
      />

      <FocusMode
        chapter={activeChapter}
        isOpen={isFocusMode}
        onClose={() => setIsFocusMode(false)}
        onUpdateChapter={handleUpdateChapter}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />

      <CloudSyncModal
        project={project}
        isOpen={isCloudSyncOpen}
        onClose={() => setIsCloudSyncOpen(false)}
        onUpdateProject={handleUpdateProject}
      />

      <SQLiteConsoleModal
        isOpen={isSQLiteConsoleOpen}
        onClose={() => setIsSQLiteConsoleOpen(false)}
        onRefreshProject={async () => {
          const reloaded = await loadProjectFromSQLite();
          if (reloaded) handleUpdateProjectInList(reloaded);
        }}
      />


      <CartoonBookGeneratorModal
        isOpen={isCartoonGeneratorOpen}
        onClose={() => setIsCartoonGeneratorOpen(false)}
        onImportToBookStudio={(importedChapter) => {
          handleUpdateProject({ chapters: [...project.chapters, importedChapter] });
          setActiveChapterId(importedChapter.id);
        }}
      />

      <ProposalStudioModal
        isOpen={isProposalStudioOpen}
        onClose={() => setIsProposalStudioOpen(false)}
        onImportToBookStudio={(importedChapter) => {
          handleUpdateProject({ chapters: [...project.chapters, importedChapter] });
          setActiveChapterId(importedChapter.id);
        }}
      />

      <EducationalStudioModal
        isOpen={isEducationalStudioOpen}
        onClose={() => setIsEducationalStudioOpen(false)}
      />

      <CompanyProfileStudioModal
        isOpen={isCompanyProfileOpen}
        onClose={() => setIsCompanyProfileOpen(false)}
        onImportToBookStudio={(importedChapter) => {
          handleUpdateProject({ chapters: [...project.chapters, importedChapter] });
          setActiveChapterId(importedChapter.id);
        }}
      />

      <DesignStudioModal
        isOpen={isDesignStudioOpen}
        onClose={() => setIsDesignStudioOpen(false)}
        onImportToBookStudio={(importedChapter) => {
          handleUpdateProject({ chapters: [...project.chapters, importedChapter] });
          setActiveChapterId(importedChapter.id);
        }}
      />

      <GoogleFontsLoaderModal
        isOpen={isGoogleFontsOpen}
        onClose={() => setIsGoogleFontsOpen(false)}
        activeSerifFont={project.exportSettings.googleSerifFont || 'EB Garamond'}
        activeSansFont={project.exportSettings.googleSansFont || 'Inter'}
        onSelectFonts={(serifFont, sansFont) => {
          handleUpdateProject({
            exportSettings: {
              ...project.exportSettings,
              googleSerifFont: serifFont,
              googleSansFont: sansFont
            }
          });
        }}
      />

      <ImageGalleryModal
        isOpen={isImageGalleryOpen}
        onClose={() => setIsImageGalleryOpen(false)}
        project={project}
        onUpdateProject={handleUpdateProject}
        onInsertImageToChapter={handleInsertImageToChapter}
        activeChapterId={activeChapterId}
      />

      <ProjectManagerModal
        isOpen={isProjectManagerOpen}
        onClose={() => setIsProjectManagerOpen(false)}
        activeProject={project}
        projects={projects}
        onSelectProject={(projId) => setActiveProjectId(projId)}
        onCreateProject={handleCreateProject}
        onUpdateProjectInList={handleUpdateProjectInList}
        onDeleteProject={handleDeleteProject}
        isOnline={isOnline}
        onSyncAll={() => {
          if (project) syncProjectToCloud(project);
        }}
      />


    </div>
  );
}
