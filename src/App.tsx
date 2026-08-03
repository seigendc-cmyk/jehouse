import React, { useState, useEffect, useRef } from 'react';
import { BookProject, Chapter, ContentBlock, CoverConfig, FrontMatter, WatermarkConfig, ExportSettings, ProofreadIssue, ProjectAsset, UITheme } from './types';
import { createEmptyBookProject } from './data/createEmptyBookProject';
import { Navbar } from './components/Navbar';
import { Sidebar, SidebarTab } from './components/Sidebar';
import { EditorCanvas } from './components/EditorCanvas';
import { WatermarkEditor } from './components/WatermarkEditor';
import { ProofreadDrawer } from './components/ProofreadDrawer';
import { StoryContinuationModal } from './components/StoryContinuationModal';
import { CloudSyncModal } from './components/CloudSyncModal';
import { OptionalWorkspace } from './components/OptionalWorkspace';
import { ProjectManagerModal } from './components/ProjectManagerModal';
import { WelcomePage } from './components/WelcomePage';
import { FocusMode } from './components/FocusMode';
import { localProjectRepository } from './persistence/indexedDbProjectRepository';
import {
  createInitialSaveState,
  isImmediateSaveShortcut,
  LocalSaveCoordinator,
  needsUnloadProtection,
  ProjectSaveState
} from './persistence/localSaveCoordinator';
import { ProjectSummary, ProjectVersion, StoredProject } from './persistence/types';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import { usePwaLifecycle } from './hooks/usePwaLifecycle';
import { applyUpdateWhenSafe } from './pwa/updatePolicy';
import { getDocumentDisplayLabel } from './lib/documentDisplayLabel';
import { FormattingHistoryController, HistoryScope } from './lib/formattingHistory';
import {
  createMathAccountingBlock,
  INSERT_MATH_ACCOUNTING_COMMANDS,
  MathAccountingCommand,
  MATH_ACCOUNTING_COMMAND_LABELS
} from './features/mathAccounting';
import {
  PublishingPreflightIssue,
  runPublishingPreflight
} from './lib/publishingPreflight';
import {
  isInspectablePublishingBlock,
  MathAccountingInspector
} from './components/MathAccountingInspector';
import { DEFAULT_ACCOUNTING_FORMAT } from './lib/accounting';
import { mergeWithPreviousList, sanitizeCustomMarker, splitListAt } from './lib/structuredLists';
import { listenForSciFileOpen } from './desktop/desktopFileOpenEvents';
import { desktopSciPathReader, isTauriDesktop, saveSciToDocuments, saveSciToPath } from './desktop/desktopFileOpenGateway';
import { desktopSessionState } from './desktop/desktopSessionState';
import { openSciProjectFromPath } from './features/sciFile/application/openSciProjectFromPath';
import { SciOpenError, serializeSciProject } from './features/sciFile';

const EMPTY_PROJECT_PLACEHOLDER = createEmptyBookProject();
const loadCoverEditor = () =>
  import('./components/CoverEditor').then((module) => ({ default: module.CoverEditor }));
const loadFrontMatterEditor = () =>
  import('./components/FrontMatterEditor').then((module) => ({
    default: module.FrontMatterEditor
  }));
const loadExportSettings = () =>
  import('./components/ExportSettingsTab').then((module) => ({
    default: module.ExportSettingsTab
  }));
const loadExportModal = () =>
  import('./components/ExportModal').then((module) => ({ default: module.ExportModal }));
const loadPrintPreview = () =>
  import('./components/PrintPreviewModal').then((module) => ({
    default: module.PrintPreviewModal
  }));
const loadSeriesManager = () =>
  import('./components/SeriesManagerModal').then((module) => ({
    default: module.SeriesManagerModal
  }));
const loadSQLiteConsole = () =>
  import('./components/SQLiteConsoleModal').then((module) => ({
    default: module.SQLiteConsoleModal
  }));
const loadCartoonStudio = () =>
  import('./cartoonBook/components/CartoonBookGeneratorModal').then((module) => ({
    default: module.CartoonBookGeneratorModal
  }));
const loadProposalStudio = () =>
  import('./proposalStudio/components/ProposalStudioModal').then((module) => ({
    default: module.ProposalStudioModal
  }));
const loadEducationalStudio = () =>
  import('./educationalBooks/components/EducationalStudioModal').then((module) => ({
    default: module.EducationalStudioModal
  }));
const loadCompanyProfileStudio = () =>
  import('./companyProfile/components/CompanyProfileStudioModal').then((module) => ({
    default: module.CompanyProfileStudioModal
  }));
const loadDesignStudio = () =>
  import('./designStudio/components/DesignStudioModal').then((module) => ({
    default: module.DesignStudioModal
  }));
const loadBookTypography = () =>
  import('./components/BookTypographyModal').then((module) => ({
    default: module.BookTypographyModal
  }));
const loadGoogleFonts = () =>
  import('./components/GoogleFontsLoaderModal').then((module) => ({
    default: module.GoogleFontsLoaderModal
  }));
const loadImageGallery = () =>
  import('./components/ImageGalleryModal').then((module) => ({
    default: module.ImageGalleryModal
  }));

export default function App() {
  const [projects, setProjects] = useState<BookProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [recentProjects, setRecentProjects] = useState<ProjectSummary[]>([]);
  const [recoveryVersions, setRecoveryVersions] = useState<ProjectVersion[]>([]);
  const [startupError, setStartupError] = useState<string>();
  const externalOpenBusy = useRef(false);
  const projectRecords = useRef<Map<string, StoredProject>>(new Map());

  const activeProject = projects.find(p => p.id === activeProjectId) ?? null;
  const project = activeProject ?? EMPTY_PROJECT_PLACEHOLDER;
  const hasActiveProject = activeProject !== null;
  const activeProjectRef = useRef(project);
  activeProjectRef.current = project;
  const historyRef=useRef(new FormattingHistoryController());
  const [historyTick,setHistoryTick]=useState(0);
  const [historyAnnouncement,setHistoryAnnouncement]=useState('');
  const [historyActiveBlockId,setHistoryActiveBlockId]=useState<string>();

  const [activeTab, setActiveTab] = useState<SidebarTab>('editor');
  const [activeChapterId, setActiveChapterId] = useState<string>(project.chapters[0]?.id || 'ch-1');
  const [isStorageLoaded, setIsStorageLoaded] = useState<boolean>(false);
  
  // Network status is connectivity information only; it does not imply cloud availability.
  const isOnline = useNetworkStatus();
  const pwa = usePwaLifecycle();
  const isOnlineRef = useRef(isOnline);
  isOnlineRef.current = isOnline;
  const [updateError, setUpdateError] = useState<string>();
  const [saveState, setSaveState] = useState<ProjectSaveState>(createInitialSaveState());
  const saveCoordinatorRef = useRef<LocalSaveCoordinator | null>(null);
  if (!saveCoordinatorRef.current) {
    saveCoordinatorRef.current = new LocalSaveCoordinator({
      repository: localProjectRepository,
      onStateChange: setSaveState,
      isOnline: () => isOnlineRef.current,
      onConfirmedSave: (confirmedProject, record) => {
        projectRecords.current.set(record.projectId, record);
        setRecentProjects((current) => {
          const summary: ProjectSummary = {
            projectId: record.projectId,
            title: confirmedProject.title,
            author: confirmedProject.author,
            category: confirmedProject.category,
            localRevision: record.localRevision,
            updatedAt: record.updatedAt,
            lastSavedAt: record.lastSavedAt,
            syncStatus: record.syncStatus
          };
          return [summary, ...current.filter((item) => item.projectId !== record.projectId)].sort(
            (left, right) => Date.parse(right.lastSavedAt) - Date.parse(left.lastSavedAt)
          );
        });
        setProjects((current) =>
          current.map((item) =>
            item.id === confirmedProject.id
              ? { ...item, lastSaved: record.lastSavedAt }
              : item
          )
        );
      }
    });
  }

  // Theme & Ambient Light State - Defaulting to Sahara Red Soils at Dusk
  const [uiTheme, setUITheme] = useState<UITheme>('warm_light');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [autoAmbient, setAutoAmbient] = useState<boolean>(false);
  const [navigationVisible, setNavigationVisible] = useState(
    () => typeof window === 'undefined' || window.innerWidth > 900
  );
  const [inspectorVisible, setInspectorVisible] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string>();
  const [pasteWorkedProblemRequest, setPasteWorkedProblemRequest] = useState(0);
  const [listCommandRequest, setListCommandRequest] = useState<{ id: number; command: 'bullets' | 'numbering' | 'multilevel' | 'increase' | 'decrease' | 'remove' | 'insert-bullets' | 'insert-numbering' }>();
  const [publishingIssues, setPublishingIssues] = useState<PublishingPreflightIssue[]>([]);

  // Modals & Drawers
  const [isProjectManagerOpen, setIsProjectManagerOpen] = useState<boolean>(false);
  const [projectManagerInitialTab, setProjectManagerInitialTab] = useState<'active' | 'new'>('active');
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
  const [isTypographyOpen, setIsTypographyOpen] = useState<boolean>(false);
  const [isGoogleFontsOpen, setIsGoogleFontsOpen] = useState<boolean>(false);
  const [isImageGalleryOpen, setIsImageGalleryOpen] = useState<boolean>(false);

  // AI Proofread state
  const [proofreadIssues, setProofreadIssues] = useState<ProofreadIssue[]>([]);
  const [isProofreadLoading, setIsProofreadLoading] = useState<boolean>(false);

  // Open the authoritative local repository before any project is selected.
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        await localProjectRepository.migrateLegacyData();
        const summaries = await localProjectRepository.listProjects();
        const storedProjects = (
          await Promise.all(
            summaries.map((summary) => localProjectRepository.getProject(summary.projectId))
          )
        ).filter((record) => record !== null);

        if (storedProjects.length > 0 && isMounted) {
          projectRecords.current = new Map(
            storedProjects.map((record) => [record.projectId, record])
          );
          setProjects(storedProjects.map((record) => record.project));
          setRecentProjects(summaries);
          const versions = (
            await Promise.all(
              summaries.map((summary) =>
                localProjectRepository.getProjectVersions(summary.projectId)
              )
            )
          )
            .flat()
            .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
          if (isMounted) setRecoveryVersions(versions);
        }
      } catch (err) {
        console.warn('Storage initial load notice:', err);
        if (isMounted) {
          setStartupError(
            'PressCraft could not read local projects. Stored records were left unchanged. Retry by reloading this page.'
          );
        }
      } finally {
        if (isMounted) setIsStorageLoaded(true);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (isStorageLoaded && activeProjectId) {
      localStorage.setItem('presscraft_active_project_id', activeProjectId);
    }
  }, [activeProjectId, isStorageLoaded]);

  // Ctrl+S always targets the latest complete in-memory project snapshot.
  useEffect(() => {
    const handleSaveShortcut = (event: KeyboardEvent) => {
      if (isImmediateSaveShortcut(event)) {
        event.preventDefault();
        void (async () => {
          await saveCoordinatorRef.current?.saveNow();
          const sourcePath = desktopSessionState.getSourcePath();
          if (isTauriDesktop()) {
            try {
              const contents = serializeSciProject(activeProjectRef.current);
              const savedPath = sourcePath
                ? await saveSciToPath(sourcePath, contents)
                : await saveSciToDocuments(activeProjectRef.current.title || 'Untitled Book', contents);
              desktopSessionState.setSourcePath(savedPath);
            }
            catch (error) {
              console.error('[SCI save]', error);
              setStartupError('PressCraft could not save the SCI file to the selected location.');
            }
          }
        })();
      }
    };
    window.addEventListener('keydown', handleSaveShortcut);
    return () => window.removeEventListener('keydown', handleSaveShortcut);
  }, []);

  // Browsers control the warning text, but only genuinely unconfirmed work activates it.
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!needsUnloadProtection(saveState)) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveState]);

  useEffect(() => {
    if (!isStorageLoaded || !isTauriDesktop()) return;
    let disposed = false;
    let unlisten = () => undefined;
    const openPaths = async (paths: string[]) => {
      if (externalOpenBusy.current) return;
      externalOpenBusy.current = true;
      try {
        const first = paths.find((path) => path.toLocaleLowerCase().endsWith('.sci'));
        if (!first) throw new SciOpenError('INVALID_EXTENSION', 'Windows did not provide a valid .sci file to open.');
        const opened = await openSciProjectFromPath(first, desktopSciPathReader);
        if (hasActiveProject && needsUnloadProtection(saveCoordinatorRef.current?.getState() ?? saveState)) {
          const saveFirst = window.confirm('This project has unsaved changes. Select OK to save before opening the SCI file, or Cancel for more options.');
          if (saveFirst) await saveCoordinatorRef.current?.saveNow();
          if (needsUnloadProtection(saveCoordinatorRef.current?.getState() ?? saveState)) {
            const discard = window.confirm("Select OK to open the SCI file without saving the current changes, or Cancel to keep editing.");
            if (!discard) throw new SciOpenError('CANCELLED', 'Project opening was cancelled because unsaved work remains.');
          }
        }
        if (disposed) return;
        const next = opened.project;
        setProjects((current) => [next, ...current.filter((item) => item.id !== next.id)]);
        setActiveProjectId(next.id);
        activeProjectRef.current = next;
        setActiveChapterId(next.chapters[0]?.id || 'ch-1');
        clearFormattingHistory();
        saveCoordinatorRef.current?.setProject(next, null);
        desktopSessionState.setSourcePath(opened.sourcePath);
        const now = new Date().toISOString();
        setRecentProjects((current) => [{ projectId: next.id, title: next.title, author: next.author,
          category: next.category, localRevision: 0, updatedAt: now, lastSavedAt: now,
          syncStatus: 'local-only' }, ...current.filter((item) => item.projectId !== next.id)]);
        setStartupError(paths.length > 1 ? 'PressCraft currently opens one project at a time. The first valid SCI file was opened.' : undefined);
      } catch (error) {
        console.error('[SCI file open]', error);
        setStartupError(error instanceof SciOpenError ? error.message : 'PressCraft could not read this SCI file because of permissions or filesystem access.');
      } finally { externalOpenBusy.current = false; }
    };
    void listenForSciFileOpen((paths) => void openPaths(paths)).then((stop) => { unlisten = stop; });
    return () => { disposed = true; unlisten(); };
  }, [isStorageLoaded, hasActiveProject, saveState]);

  // Keep activeChapterId in sync when project changes
  useEffect(() => {
    if (hasActiveProject && !project.chapters.some(c => c.id === activeChapterId)) {
      setActiveChapterId(project.chapters[0]?.id || 'ch-1');
    }
  }, [project, activeChapterId, hasActiveProject]);


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
    if (!hasActiveProject) return;
    const changedProject = {
      ...activeProjectRef.current,
      ...partial
    };
    activeProjectRef.current = changedProject;
    setProjects((prev) =>
      prev.map((item) => (item.id === activeProjectId ? changedProject : item))
    );
    saveCoordinatorRef.current?.markDirty(changedProject);
  };
  const applyHistoryProject=(next:BookProject)=>{
    activeProjectRef.current=next;
    setProjects(current=>current.map(item=>item.id===next.id?next:item));
    saveCoordinatorRef.current?.markDirty(next);
  };
  const executeFormattingTransaction=(label:string,scope:HistoryScope,next:BookProject,mergeKey?:string,activeBlockId?:string)=>{
    const before=activeProjectRef.current;
    if(historyRef.current.execute({label,scope,before:structuredClone(before),after:structuredClone(next),mergeKey,activeBlockBefore:activeBlockId,activeBlockAfter:activeBlockId})){
      applyHistoryProject(next);setHistoryTick(v=>v+1);setHistoryAnnouncement(label);
    }
  };
  const undoFormatting=()=>{const result=historyRef.current.undo();if(!result)return;applyHistoryProject(result.project);setHistoryActiveBlockId(result.activeBlockId);setHistoryTick(v=>v+1);setHistoryAnnouncement(`Undid: ${result.entry.label}.`);};
  const redoFormatting=()=>{const result=historyRef.current.redo();if(!result)return;applyHistoryProject(result.project);setHistoryActiveBlockId(result.activeBlockId);setHistoryTick(v=>v+1);setHistoryAnnouncement(`Redid: ${result.entry.label}.`);};
  const clearFormattingHistory=()=>{historyRef.current.clear();setHistoryTick(v=>v+1);setHistoryActiveBlockId(undefined);};

  const handleCreateProject = async (newProj: BookProject) => {
    if (
      hasActiveProject &&
      needsUnloadProtection(saveCoordinatorRef.current?.getState() ?? saveState)
    ) {
      await saveCoordinatorRef.current?.saveNow();
      if (needsUnloadProtection(saveCoordinatorRef.current?.getState() ?? saveState)) {
        const proceed = window.confirm(
          'The current project has not been confirmed saved. Create the new project anyway?'
        );
        if (!proceed) return;
      }
    }
    setProjects((prev) => [newProj, ...prev]);
    clearFormattingHistory();
    setActiveProjectId(newProj.id);
    activeProjectRef.current = newProj;
    saveCoordinatorRef.current?.setProject(newProj, null);
    saveCoordinatorRef.current?.markDirty(newProj);
    setIsProjectManagerOpen(false);
  };

  const handleUpdateProjectInList = (updatedProj: BookProject) => {
    setProjects((prev) => prev.map((p) => (p.id === updatedProj.id ? updatedProj : p)));
    if (updatedProj.id === activeProjectId) {
      clearFormattingHistory();
      activeProjectRef.current = updatedProj;
      saveCoordinatorRef.current?.markDirty(updatedProj);
    }
  };

  const handleDeleteProject = async (projId: string) => {
    if (
      projId === activeProjectId &&
      needsUnloadProtection(saveCoordinatorRef.current?.getState() ?? saveState)
    ) {
      await saveCoordinatorRef.current?.saveNow();
      if (needsUnloadProtection(saveCoordinatorRef.current?.getState() ?? saveState)) {
        const proceed = window.confirm(
          'This project still has unconfirmed edits. Delete the local project anyway?'
        );
        if (!proceed) return;
      }
    }
    await localProjectRepository.deleteProject(projId).catch((error) => {
      console.warn(`[IndexedDB] Could not delete local project "${projId}":`, error);
    });
    projectRecords.current.delete(projId);
    setRecentProjects((current) => current.filter((item) => item.projectId !== projId));
    setProjects((prev) => prev.filter((p) => p.id !== projId));
    if (projId === activeProjectId) {
      clearFormattingHistory();
      setActiveProjectId(null);
      saveCoordinatorRef.current?.clearProject();
    }
  };

  const handleSelectProject = async (projectId: string) => {
    if (projectId === activeProjectId) return true;
    if (needsUnloadProtection(saveCoordinatorRef.current?.getState() ?? saveState)) {
      await saveCoordinatorRef.current?.saveNow();
      if (needsUnloadProtection(saveCoordinatorRef.current?.getState() ?? saveState)) {
        const proceed = window.confirm(
          'The current project still has unconfirmed edits. Open another project anyway? Your current in-memory work will remain available until this page closes.'
        );
        if (!proceed) return false;
      }
    }
    const stored = await localProjectRepository.getProject(projectId);
    if (!stored) {
      setStartupError('That local project could not be opened. Its stored record was not changed.');
      return false;
    }
    const nextProject = stored.project;
    projectRecords.current.set(projectId, stored);
    setProjects((current) => [
      nextProject,
      ...current.filter((item) => item.id !== projectId)
    ]);
    setActiveProjectId(projectId);
    clearFormattingHistory();
    activeProjectRef.current = nextProject;
    setActiveChapterId(nextProject.chapters[0]?.id || 'ch-1');
    saveCoordinatorRef.current?.setProject(nextProject, stored);
    setStartupError(undefined);
    return true;
  };

  const handleCloseProject = async () => {
    if (needsUnloadProtection(saveCoordinatorRef.current?.getState() ?? saveState)) {
      await saveCoordinatorRef.current?.saveNow();
      if (needsUnloadProtection(saveCoordinatorRef.current?.getState() ?? saveState)) {
        const proceed = window.confirm(
          'This project could not be confirmed saved. Close it and return Home anyway?'
        );
        if (!proceed) return false;
      }
    }
    setActiveProjectId(null);
    desktopSessionState.setSourcePath(undefined);
    clearFormattingHistory();
    saveCoordinatorRef.current?.clearProject();
    setSaveState(createInitialSaveState());
    return true;
  };

  const handleRecoverVersion = async (version: ProjectVersion) => {
    clearFormattingHistory();
    const recovered: BookProject = {
      ...structuredClone(version.project),
      id: `book-recovered-${crypto.randomUUID()}`,
      title: `${version.title.trim() || 'Untitled Book'} (Recovered)`,
      cloudSynced: false,
      lastSaved: ''
    };
    await handleCreateProject(recovered);
    await saveCoordinatorRef.current?.saveNow();
  };

  const handleApplyPwaUpdate = async () => {
    setUpdateError(undefined);
    if (!hasActiveProject) {
      await pwa.applyUpdate();
      return;
    }
    const decision = await applyUpdateWhenSafe(
      saveCoordinatorRef.current?.getState() ?? saveState,
      async () =>
        (await saveCoordinatorRef.current?.saveNow()) ??
        (saveCoordinatorRef.current?.getState() ?? saveState),
      pwa.applyUpdate
    );
    if (decision === 'blocked') {
      setUpdateError('Save the current project successfully before updating PressCraft.');
    }
  };

  const handleReloadStoredProject = async () => {
    clearFormattingHistory();
    const stored = await localProjectRepository.getProject(project.id);
    if (!stored) return;
    projectRecords.current.set(stored.projectId, stored);
    setProjects((current) =>
      current.map((item) => (item.id === stored.projectId ? stored.project : item))
    );
    activeProjectRef.current = stored.project;
    saveCoordinatorRef.current?.setProject(stored.project, stored);
  };

  const handleKeepCurrentAsCopy = async () => {
    clearFormattingHistory();
    const copy: BookProject = {
      ...structuredClone(project),
      id: `${project.id}-recovered-${Date.now()}`,
      title: `${project.title.trim() || 'Untitled Book'} (Recovered Copy)`,
      cloudSynced: false
    };
    setProjects((current) => [copy, ...current]);
    setActiveProjectId(copy.id);
    activeProjectRef.current = copy;
    saveCoordinatorRef.current?.setProject(copy, null);
    saveCoordinatorRef.current?.markDirty(copy);
    await saveCoordinatorRef.current?.saveNow();
  };


  // Chapter update helper
  const handleUpdateChapter = (updatedChapter: Chapter) => {
    const updatedChapters = project.chapters.map((c) => (c.id === updatedChapter.id ? updatedChapter : c));
    handleUpdateProject({ chapters: updatedChapters });
  };
  const handleFormattingChapter=(updatedChapter:Chapter,label:string,scope:HistoryScope,mergeKey?:string,activeBlockId?:string)=>{
    const next={...activeProjectRef.current,chapters:activeProjectRef.current.chapters.map(c=>c.id===updatedChapter.id?updatedChapter:c)};
    executeFormattingTransaction(label,scope,next,mergeKey,activeBlockId);
  };
  const handleMathAccountingCommand = (command: MathAccountingCommand) => {
    setActiveTab('editor');
    if (command === 'paste-worked-problem') {
      setPasteWorkedProblemRequest((request) => request + 1);
      return;
    }
    if (command === 'preview-print-layout') {
      setIsPrintPreviewOpen(true);
      return;
    }
    const chapter = activeProjectRef.current.chapters.find((item) => item.id === activeChapterId)
      ?? activeProjectRef.current.chapters[0];
    if (!chapter) return;
    if (command === 'validate-current-block' || command === 'run-chapter-preflight') {
      const report = runPublishingPreflight(activeProjectRef.current);
      const chapterIssues = report.issues.filter((issue) => issue.chapterId === chapter.id);
      const issues = command === 'validate-current-block'
        ? chapterIssues.filter((issue) => issue.blockId === selectedBlockId)
        : chapterIssues;
      setPublishingIssues(issues);
      const targetBlockId = command === 'run-chapter-preflight'
        ? chapterIssues[0]?.blockId
        : selectedBlockId;
      if (targetBlockId) {
        setSelectedBlockId(targetBlockId);
        setHistoryActiveBlockId(targetBlockId);
      }
      setInspectorVisible(true);
      if (window.innerWidth <= 900) setNavigationVisible(false);
      return;
    }
    if (!INSERT_MATH_ACCOUNTING_COMMANDS.has(command)) return;
    const block = createMathAccountingBlock(command, `b-${crypto.randomUUID()}`);
    if (!block) return;
    const selectedIndex = chapter.blocks.findIndex((item) => item.id === selectedBlockId);
    const blocks = [...chapter.blocks];
    blocks.splice(selectedIndex >= 0 ? selectedIndex + 1 : blocks.length, 0, block);
    handleFormattingChapter(
      { ...chapter, blocks },
      MATH_ACCOUNTING_COMMAND_LABELS[command],
      'structure',
      undefined,
      block.id
    );
    setSelectedBlockId(block.id);
    setHistoryActiveBlockId(block.id);
    setPublishingIssues([]);
    setInspectorVisible(true);
    if (window.innerWidth <= 900) setNavigationVisible(false);
  };

  useEffect(()=>{
    const handler=(event:KeyboardEvent)=>{
      const target=event.target as HTMLElement|null;
      if(target&&(target.tagName==='TEXTAREA'||target.tagName==='INPUT'||target.isContentEditable))return;
      if(!(event.ctrlKey||event.metaKey))return;
      const key=event.key.toLowerCase();
      if(key==='z'){event.preventDefault();event.shiftKey?redoFormatting():undoFormatting();}
      else if(key==='y'){event.preventDefault();redoFormatting();}
    };
    window.addEventListener('keydown',handler);return()=>window.removeEventListener('keydown',handler);
  },[]);

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

  if (!hasActiveProject) {
    const welcomePersistence = Object.fromEntries(
      recentProjects.map((item) => [
        item.projectId,
        {
          lastSavedAt: item.lastSavedAt,
          localRevision: item.localRevision,
          status: 'local-only'
        }
      ])
    );

    return (
      <>
        <WelcomePage
          recentProjects={recentProjects}
          recoveryVersions={recoveryVersions}
          isOnline={isOnline}
          canInstall={pwa.canInstall}
          onInstall={() => void pwa.requestInstall()}
          onCreateProject={() => {
            setProjectManagerInitialTab('new');
            setIsProjectManagerOpen(true);
          }}
          onOpenExisting={() => {
            setProjectManagerInitialTab('active');
            setIsProjectManagerOpen(true);
          }}
          onContinueProject={(projectId) => void handleSelectProject(projectId)}
          onRecoverVersion={(version) => void handleRecoverVersion(version)}
        />

        {startupError ? (
          <div role="alert" className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-white/40 bg-white px-4 py-3 text-sm font-semibold text-red-700 shadow-xl">
            {startupError}
          </div>
        ) : null}

        {pwa.updateAvailable ? (
          <div className="fixed right-4 top-4 z-50 max-w-sm rounded-xl border border-orange-200 bg-white p-4 text-sm text-gray-800 shadow-2xl">
            <strong>A new version of PressCraft is available.</strong>
            {updateError ? <p className="mt-1 text-xs text-red-700">{updateError}</p> : null}
            <div className="mt-3 flex gap-2">
              <button onClick={() => void handleApplyPwaUpdate()} className="rounded bg-orange-600 px-3 py-1.5 text-xs font-bold text-white">Update now</button>
              <button onClick={pwa.dismissUpdate} className="rounded px-3 py-1.5 text-xs font-bold text-gray-600">Later</button>
            </div>
          </div>
        ) : null}

        <ProjectManagerModal
          isOpen={isProjectManagerOpen}
          onClose={() => setIsProjectManagerOpen(false)}
          activeProject={EMPTY_PROJECT_PLACEHOLDER}
          projects={projects}
          onSelectProject={handleSelectProject}
          onCreateProject={handleCreateProject}
          onUpdateProjectInList={handleUpdateProjectInList}
          onDeleteProject={handleDeleteProject}
          isOnline={isOnline}
          persistenceByProject={welcomePersistence}
          initialTab={projectManagerInitialTab}
        />
      </>
    );
  }

  const activeChapter = project.chapters.find((c) => c.id === activeChapterId) || project.chapters[0];
  const selectedBlock = activeChapter?.blocks.find((block) => block.id === selectedBlockId) ?? activeChapter?.blocks[0];
  const activeDocumentLabel = getDocumentDisplayLabel({
    workspace: activeTab,
    chapterNumber: activeChapter?.number,
    chapterTitle: activeChapter?.title,
    episodeNumber: activeChapter?.episodeNumber,
    episodeTitle: activeChapter?.episodeTitle
  });

  const persistenceByProject = Object.fromEntries(
    projects.map((item) => {
      const record = projectRecords.current.get(item.id);
      return [
        item.id,
        item.id === activeProjectId
          ? {
              lastSavedAt: saveState.lastSavedAt,
              localRevision: saveState.localRevision,
              status: saveState.status
            }
          : {
              lastSavedAt: record?.lastSavedAt,
              localRevision: record?.localRevision ?? 0,
              status: record?.syncStatus ?? 'local-only'
            }
      ];
    })
  );

  return (
    <div className="presscraft-shell theme-warm-light h-screen w-screen bg-[var(--pc-app-background)] text-[var(--pc-text)] font-sans flex flex-col overflow-hidden relative">
      
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
        onOpenTypography={() => setIsTypographyOpen(true)}
        onOpenCloudSync={() => setIsCloudSyncOpen(true)}
        onSaveToLocalDisk={() => {
          void import('./lib/exportUtils').then(({ saveToLocalDiskInDocuments }) =>
            saveToLocalDiskInDocuments(project)
          );
        }}
        onOpenSQLiteConsole={() => setIsSQLiteConsoleOpen(true)}
        onOpenCartoonGenerator={() => setIsCartoonGeneratorOpen(true)}
        onOpenProposalStudio={() => setIsProposalStudioOpen(true)}
        onOpenEducationalStudio={() => setIsEducationalStudioOpen(true)}
        onOpenCompanyProfile={() => setIsCompanyProfileOpen(true)}
        onOpenDesignStudio={() => setIsDesignStudioOpen(true)}
        onOpenGoogleFontsModal={() => setIsGoogleFontsOpen(true)}
        onOpenImageGallery={() => setIsImageGalleryOpen(true)}
        onOpenProjectManager={() => {
          setProjectManagerInitialTab('active');
          setIsProjectManagerOpen(true);
        }}
        isOnline={isOnline}
        canInstall={pwa.canInstall}
        onInstallPwa={() => void pwa.requestInstall()}
        onGoHome={() => void handleCloseProject()}
        saveState={saveState}
        activeDocumentLabel={activeDocumentLabel}
        navigationVisible={navigationVisible}
        inspectorVisible={inspectorVisible}
        onToggleNavigation={() => {
          setNavigationVisible((visible) => {
            const next = !visible;
            if (next && window.innerWidth <= 900) setInspectorVisible(false);
            return next;
          });
        }}
        onToggleInspector={() => {
          setInspectorVisible((visible) => {
            const next = !visible;
            if (next && window.innerWidth <= 900) setNavigationVisible(false);
            return next;
          });
        }}
        canUndo={historyRef.current.canUndo}
        canRedo={historyRef.current.canRedo}
        undoLabel={historyRef.current.undoLabel}
        redoLabel={historyRef.current.redoLabel}
        onUndo={undoFormatting}
        onRedo={redoFormatting}
        onMathAccountingCommand={handleMathAccountingCommand}
        onListCommand={(command) => { setActiveTab('editor'); setListCommandRequest({ id: Date.now(), command }); }}
        canFormatList={selectedBlock?.type === 'paragraph' || selectedBlock?.type === 'item'}
        activeListType={selectedBlock?.listFormatting?.type}
      />
      <div className="sr-only" aria-live="polite" data-history-version={historyTick}>{historyAnnouncement}</div>


      {/* Main Studio Body Workspace with Floating Sidebar */}
      <div className="flex-1 flex overflow-hidden relative h-full w-full">
        
        {/* Floating Left Sidebar Navigation */}
        {navigationVisible && <Sidebar
          project={project}
          activeTab={activeTab}
          activeChapterId={activeChapterId}
          onSelectTab={setActiveTab}
          onPreloadTab={(tab) => {
            if (tab === 'cover') void loadCoverEditor().catch(() => undefined);
            if (tab === 'frontmatter') void loadFrontMatterEditor().catch(() => undefined);
            if (tab === 'exportSettings') void loadExportSettings().catch(() => undefined);
          }}
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
          saveState={saveState}
          isOnline={isOnline}
          onRetrySave={() => void saveCoordinatorRef.current?.retry()}
        />}

        {/* Center Active Workspace View offset for Floating Header (pt-[4.25rem]), Floating Sidebar (pl-[16.25rem]), and Footer (pb-[2rem]) */}
        <main className={`pc-manuscript-shell flex-1 flex flex-col overflow-hidden pt-[8.25rem] pb-[1.75rem] h-full w-full transition-[padding] ${navigationVisible ? 'pl-[15.5rem]' : 'pl-0'} ${inspectorVisible ? 'pr-80' : 'pr-0'}`}>
          {activeTab === 'editor' && (
            <EditorCanvas
              chapter={activeChapter}
              typography={project.typography}
              colourSettings={project.colourSettings}
              accountingFormat={project.accountingFormat}
              onUpdateAccountingFormat={(accountingFormat) => handleUpdateProject({ accountingFormat })}
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
              onFormattingTransaction={handleFormattingChapter}
              requestedActiveBlockId={historyActiveBlockId}
              pasteWorkedProblemRequest={pasteWorkedProblemRequest}
              onActiveBlockChange={setSelectedBlockId}
              listCommandRequest={listCommandRequest}
              onOpenListSettings={() => setInspectorVisible(true)}
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
            <OptionalWorkspace
              label="Loading Cover Studio"
              loader={loadCoverEditor}
              props={{
                cover: project.cover,
                totalPages: project.chapters.length * 15,
                onUpdateCover: (cover: CoverConfig) =>
                  handleUpdateProject({
                    cover,
                    title: cover.title || project.title,
                    subtitle: cover.subtitle || project.subtitle,
                    author: cover.author || project.author
                  }),
                onOpenImageGallery: () => setIsImageGalleryOpen(true)
              }}
              onReturn={() => setActiveTab('editor')}
            />
          )}

          {activeTab === 'frontmatter' && (
            <OptionalWorkspace
              label="Loading Front Matter Studio"
              loader={loadFrontMatterEditor}
              props={{
                frontMatter: project.frontMatter,
                bookTitle: project.title,
                bookSubtitle: project.subtitle,
                bookAuthor: project.author,
                chapters: project.chapters,
                onUpdateFrontMatter: (frontMatter: FrontMatter) =>
                  handleUpdateProject({ frontMatter }),
                onUpdateProjectMetadata: (meta: {
                  title?: string;
                  subtitle?: string;
                  author?: string;
                  publisher?: string;
                }) =>
                  handleUpdateProject({
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
                  }),
                onGenerateAIExecSummary: handleGenerateAIExecSummary
              }}
              onReturn={() => setActiveTab('editor')}
            />
          )}

          {activeTab === 'watermark' && (
            <WatermarkEditor
              watermark={project.watermark}
              onUpdateWatermark={(watermark) => handleUpdateProject({ watermark })}
            />
          )}

          {activeTab === 'exportSettings' && (
            <OptionalWorkspace
              label="Preparing Export Tools"
              loader={loadExportSettings}
              props={{
                project,
                onUpdateExportSettings: (exportSettings: ExportSettings) =>
                  handleUpdateProject({ exportSettings }),
                onUpdateBibliography: (bibliography: BookProject['bibliography']) =>
                  handleUpdateProject({ bibliography }),
                onOpenPrintPreview: () => setIsPrintPreviewOpen(true)
              }}
              onReturn={() => setActiveTab('editor')}
            />
          )}
        </main>

        {inspectorVisible && (
          <aside className="pc-inspector" aria-label="Document inspector">
            <div className="pc-inspector-heading">
              <strong>Properties</strong>
              <button onClick={() => setInspectorVisible(false)} aria-label="Close inspector">×</button>
            </div>
            {publishingIssues.length > 0 && (
              <nav className="pc-preflight-navigation" aria-label="Chapter preflight issues">
                <strong>Chapter preflight</strong>
                {publishingIssues.map((issue) => (
                  <button
                    type="button"
                    key={issue.id}
                    className={issue.blockId === selectedBlockId ? 'is-active' : ''}
                    onClick={() => {
                      if (!issue.blockId) return;
                      setSelectedBlockId(issue.blockId);
                      setHistoryActiveBlockId(issue.blockId);
                    }}
                  >
                    <span>{issue.severity}</span>{issue.message}
                  </button>
                ))}
              </nav>
            )}
            {selectedBlock?.listFormatting && (
              <section className="space-y-2 border-b border-zinc-700 p-3 text-xs" aria-label="List Settings">
                <strong>List Settings</strong>
                <label className="block">List type<select aria-label="List type" value={selectedBlock.listFormatting.type} onChange={(event) => setListCommandRequest({ id: Date.now(), command: event.target.value === 'unordered' ? 'bullets' : 'numbering' })} className="block w-full"><option value="unordered">Unordered</option><option value="ordered">Ordered</option></select></label>
                {selectedBlock.listFormatting.type === 'unordered' ? <label className="block">Marker Style<select aria-label="Marker Style" value={selectedBlock.listFormatting.unorderedStyle ?? 'disc'} onChange={(event) => { const blocks=activeChapter.blocks.map(block=>block.id===selectedBlock.id?{...block,listFormatting:{...block.listFormatting!,unorderedStyle:event.target.value as any}}:block);handleFormattingChapter({...activeChapter,blocks},'Change list marker style','block-formatting',undefined,selectedBlock.id); }} className="block w-full">{['disc','circle','square','dash','arrow','check','custom'].map(value=><option key={value} value={value}>{value}</option>)}</select></label> : <label className="block">Number Style<select aria-label="Number Style" value={selectedBlock.listFormatting.orderedStyle ?? 'decimal'} onChange={(event) => { const blocks=activeChapter.blocks.map(block=>block.id===selectedBlock.id?{...block,listFormatting:{...block.listFormatting!,orderedStyle:event.target.value as any}}:block);handleFormattingChapter({...activeChapter,blocks},'Change numbering style','block-formatting',undefined,selectedBlock.id); }} className="block w-full">{['decimal','lower-alpha','upper-alpha','lower-roman','upper-roman','decimal-leading-zero','decimal-outline'].map(value=><option key={value} value={value}>{value}</option>)}</select></label>}
                {selectedBlock.listFormatting.unorderedStyle === 'custom' && <label className="block">Custom marker<input aria-label="Custom marker" maxLength={8} value={selectedBlock.listFormatting.customMarker ?? ''} onChange={(event) => { const blocks=activeChapter.blocks.map(block=>block.id===selectedBlock.id?{...block,listFormatting:{...block.listFormatting!,customMarker:sanitizeCustomMarker(event.target.value)}}:block);handleFormattingChapter({...activeChapter,blocks},'Change custom list marker','block-formatting','list-custom-marker',selectedBlock.id); }} /></label>}
                {selectedBlock.listFormatting.type === 'ordered' && <><label className="block">Start At<input aria-label="Start At" type="number" min="1" value={selectedBlock.listFormatting.startAt ?? 1} onChange={(event) => { const blocks=activeChapter.blocks.map(block=>block.id===selectedBlock.id?{...block,listFormatting:{...block.listFormatting!,startAt:Math.max(1,Number(event.target.value)),restart:true}}:block);handleFormattingChapter({...activeChapter,blocks},'Change list start number','block-formatting','list-start',selectedBlock.id); }} /></label><label><input type="checkbox" checked={selectedBlock.listFormatting.restart ?? false} onChange={(event) => { const blocks=activeChapter.blocks.map(block=>block.id===selectedBlock.id?{...block,listFormatting:{...block.listFormatting!,restart:event.target.checked}}:block);handleFormattingChapter({...activeChapter,blocks},'Restart numbering','block-formatting',undefined,selectedBlock.id); }} /> Restart Numbering</label></>}
                <label className="block">Marker colour<input aria-label="Marker colour" type="color" value={selectedBlock.listFormatting.markerColour ?? selectedBlock.textColour ?? '#111111'} onChange={(event) => { const blocks=activeChapter.blocks.map(block=>block.id===selectedBlock.id?{...block,listFormatting:{...block.listFormatting!,markerColour:event.target.value}}:block);handleFormattingChapter({...activeChapter,blocks},'Change list marker colour','block-formatting','list-colour',selectedBlock.id); }} /></label>
                <label className="block">Marker size<input aria-label="Marker size" type="number" min="50" max="200" value={selectedBlock.listFormatting.markerSizePercent ?? 100} onChange={(event) => { const blocks=activeChapter.blocks.map(block=>block.id===selectedBlock.id?{...block,listFormatting:{...block.listFormatting!,markerSizePercent:Number(event.target.value)}}:block);handleFormattingChapter({...activeChapter,blocks},'Change list marker size','block-formatting','list-size',selectedBlock.id); }} /></label>
                <label className="block">Spacing before<input aria-label="List spacing before" type="number" min="0" value={selectedBlock.listFormatting.spacingBeforePt ?? 0} onChange={(event) => { const blocks=activeChapter.blocks.map(block=>block.id===selectedBlock.id?{...block,listFormatting:{...block.listFormatting!,spacingBeforePt:Math.max(0,Number(event.target.value))}}:block);handleFormattingChapter({...activeChapter,blocks},'Change list spacing','block-formatting','list-spacing',selectedBlock.id); }} /></label>
                <label className="block">Spacing after<input aria-label="List spacing after" type="number" min="0" value={selectedBlock.listFormatting.spacingAfterPt ?? 4} onChange={(event) => { const blocks=activeChapter.blocks.map(block=>block.id===selectedBlock.id?{...block,listFormatting:{...block.listFormatting!,spacingAfterPt:Math.max(0,Number(event.target.value))}}:block);handleFormattingChapter({...activeChapter,blocks},'Change list spacing','block-formatting','list-spacing',selectedBlock.id); }} /></label>
                <label><input type="checkbox" checked={selectedBlock.listFormatting.keepWithNext ?? false} onChange={(event) => { const blocks=activeChapter.blocks.map(block=>block.id===selectedBlock.id?{...block,listFormatting:{...block.listFormatting!,keepWithNext:event.target.checked}}:block);handleFormattingChapter({...activeChapter,blocks},'Change list pagination','block-formatting',undefined,selectedBlock.id); }} /> Keep with next</label>
                <div className="flex gap-1"><button onClick={() => setListCommandRequest({id:Date.now(),command:'decrease'})}>Decrease Level</button><button onClick={() => setListCommandRequest({id:Date.now(),command:'increase'})}>Increase Level</button></div>
                <div className="flex flex-wrap gap-1"><button onClick={() => {const index=activeChapter.blocks.findIndex(block=>block.id===selectedBlock.id);const blocks=mergeWithPreviousList(activeChapter.blocks,index);handleFormattingChapter({...activeChapter,blocks},'Continue previous list','block-formatting',undefined,selectedBlock.id);}}>Continue Previous List</button><button onClick={() => {const index=activeChapter.blocks.findIndex(block=>block.id===selectedBlock.id);const blocks=splitListAt(activeChapter.blocks,index);handleFormattingChapter({...activeChapter,blocks},'Split list here','block-formatting',undefined,selectedBlock.id);}}>Split List Here</button><button onClick={() => {const index=activeChapter.blocks.findIndex(block=>block.id===selectedBlock.id);const blocks=mergeWithPreviousList(activeChapter.blocks,index);handleFormattingChapter({...activeChapter,blocks},'Merge with previous list','block-formatting',undefined,selectedBlock.id);}}>Merge with Previous Compatible List</button></div>
                <button onClick={() => setListCommandRequest({id:Date.now(),command:'remove'})}>Remove List</button>
              </section>
            )}
            {isInspectablePublishingBlock(activeChapter.blocks.find((block) => block.id === selectedBlockId)) ? (
              <MathAccountingInspector
                block={activeChapter.blocks.find((block) => block.id === selectedBlockId)!}
                format={project.accountingFormat ?? DEFAULT_ACCOUNTING_FORMAT}
                issues={publishingIssues.filter((issue) => issue.blockId === selectedBlockId)}
                onChange={(partial, label, mergeKey) => {
                  const blocks = activeChapter.blocks.map((block) =>
                    block.id === selectedBlockId ? { ...block, ...partial } : block
                  );
                  handleFormattingChapter(
                    { ...activeChapter, blocks },
                    label,
                    'block-formatting',
                    mergeKey,
                    selectedBlockId
                  );
                }}
                onFormatChange={(accountingFormat) => handleUpdateProject({ accountingFormat })}
              />
            ) : <dl className="pc-property-list">
              <div><dt>Document</dt><dd>{activeDocumentLabel || 'Manuscript'}</dd></div>
              <div><dt>Title</dt><dd>{project.title || 'Untitled Book'}</dd></div>
              <div><dt>Author</dt><dd>{project.author || 'Not specified'}</dd></div>
              <div><dt>Chapters</dt><dd>{project.chapters.length}</dd></div>
              <div><dt>Local revision</dt><dd>{saveState.localRevision}</dd></div>
              <div><dt>Cloud sync</dt><dd>Disabled pending security approval</dd></div>
            </dl>}
          </aside>
        )}

      </div>

      {/* Professional Polish Bottom Status Bar Footer */}
      <footer className="pc-statusbar">
        <div className="pc-status-secondary flex items-center gap-4">
          <span>Words: <strong className="text-gray-200">{project.chapters.reduce((acc, c) => acc + c.wordCount, 0).toLocaleString()}</strong></span>
          <span>Estimated pages: <strong className="text-gray-200">~{Math.max(1, Math.ceil(project.chapters.reduce((acc, c) => acc + c.wordCount, 0) / 350))}</strong></span>
          <span>Focus Mode: <span className={isFocusMode ? "text-[#FF6B00] font-bold" : "text-gray-500"}>{isFocusMode ? "Active" : "Inactive"}</span></span>
        </div>

        <div className="pc-status-primary flex items-center gap-4">
          <span aria-live="polite" className={
            saveState.status === 'error' || saveState.status === 'conflict'
              ? 'text-red-400 font-bold'
              : saveState.status === 'dirty' || saveState.status === 'saving'
                ? 'text-amber-400 font-medium'
                : 'text-emerald-400 font-medium'
          }>
            {saveState.status === 'dirty'
              ? `Unsaved changes · Revision ${saveState.localRevision}`
              : saveState.status === 'saving'
                ? 'Saving locally…'
                : saveState.status === 'error'
                  ? 'Local save failed'
                  : saveState.status === 'conflict'
                    ? 'Local revision conflict'
                    : saveState.lastSavedAt
                      ? `${isOnline ? 'Saved locally' : 'Offline — saved on this device'} at ${new Date(saveState.lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · Revision ${saveState.localRevision} · ${isOnline ? 'Online' : 'Offline'}`
                      : `Local storage active · Revision ${saveState.localRevision} · ${isOnline ? 'Online' : 'Offline'}`}
          </span>
          {saveState.error?.retryable ? (
            <button onClick={() => void saveCoordinatorRef.current?.retry()} className="text-orange-400 font-bold hover:text-orange-300">
              Retry
            </button>
          ) : null}
          <span className="text-gray-500 font-medium">Spellcheck not run</span>
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

      {isExportModalOpen && (
        <OptionalWorkspace
          label="Preparing Export Tools"
          loader={loadExportModal}
          props={{
            project,
            isOpen: true,
            onClose: () => setIsExportModalOpen(false),
            onUpdateExportSettings: (exportSettings: ExportSettings) =>
              handleUpdateProject({ exportSettings }),
            onImportProject: (importedProject: BookProject) =>
              handleCreateProject(importedProject),
            onOpenPrintPreview: () => setIsPrintPreviewOpen(true)
          }}
          onReturn={() => setIsExportModalOpen(false)}
        />
      )}

      {isPrintPreviewOpen && (
        <OptionalWorkspace
          label="Opening Print Preview"
          loader={loadPrintPreview}
          props={{
            project,
            isOpen: true,
            onClose: () => setIsPrintPreviewOpen(false)
          }}
          onReturn={() => setIsPrintPreviewOpen(false)}
        />
      )}

      {isSeriesManagerOpen && (
        <OptionalWorkspace
          label="Opening Series Manager"
          loader={loadSeriesManager}
          props={{
            project,
            isOpen: true,
            onClose: () => setIsSeriesManagerOpen(false),
            onUpdateProject: handleUpdateProject,
            onOpenPrintPreview: () => setIsPrintPreviewOpen(true)
          }}
          onReturn={() => setIsSeriesManagerOpen(false)}
        />
      )}

      {isTypographyOpen && (
        <OptionalWorkspace
          label="Opening Book Typography"
          loader={loadBookTypography}
          props={{
            project,
            isOpen: true,
            onClose: () => setIsTypographyOpen(false),
            onApply: (typography: BookProject['typography'], colourSettings: BookProject['colourSettings']) => {
              const current = activeProjectRef.current;
              const paletteChanged =
                current.colourSettings?.activePaletteId !== colourSettings?.activePaletteId ||
                JSON.stringify(current.colourSettings?.customPalettes) !==
                  JSON.stringify(colourSettings?.customPalettes);
              const paragraphPresetChanged =
                current.typography?.paragraphs?.presetId !== typography?.paragraphs?.presetId;
              executeFormattingTransaction(
                paletteChanged
                  ? 'Apply book palette'
                  : paragraphPresetChanged
                    ? 'Apply paragraph preset'
                    : 'Apply book typography',
                paletteChanged ? 'palette' : 'project-typography',
                {...current,typography,colourSettings}
              );
            }
          }}
          onReturn={() => setIsTypographyOpen(false)}
        />
      )}

      <FocusMode
        chapter={activeChapter}
        typography={project.typography}
        colourSettings={project.colourSettings}
        trimSize={project.exportSettings.trimSize}
        pageOrientation={project.exportSettings.pageOrientation}
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
        saveState={saveState}
        isOnline={isOnline}
        onSaveNow={() => void saveCoordinatorRef.current?.saveNow()}
      />

      {isSQLiteConsoleOpen && (
        <OptionalWorkspace
          label="Opening SQLite Inspector"
          loader={loadSQLiteConsole}
          props={{
            isOpen: true,
            onClose: () => setIsSQLiteConsoleOpen(false),
            onRefreshProject: async () => {
              const { loadProjectFromSQLite } = await import('./lib/sqliteDb');
              const reloaded = await loadProjectFromSQLite();
              if (reloaded) handleUpdateProjectInList(reloaded);
            }
          }}
          onReturn={() => setIsSQLiteConsoleOpen(false)}
        />
      )}

      {isCartoonGeneratorOpen && (
        <OptionalWorkspace
          label="Opening Cartoon Book Studio"
          loader={loadCartoonStudio}
          props={{
            isOpen: true,
            onClose: () => setIsCartoonGeneratorOpen(false),
            onImportToBookStudio: (importedChapter: Chapter) => {
              handleUpdateProject({ chapters: [...project.chapters, importedChapter] });
              setActiveChapterId(importedChapter.id);
            }
          }}
          onReturn={() => setIsCartoonGeneratorOpen(false)}
        />
      )}

      {isProposalStudioOpen && (
        <OptionalWorkspace
          label="Opening Proposal Studio"
          loader={loadProposalStudio}
          props={{
            isOpen: true,
            onClose: () => setIsProposalStudioOpen(false),
            onImportToBookStudio: (importedChapter: Chapter) => {
              handleUpdateProject({ chapters: [...project.chapters, importedChapter] });
              setActiveChapterId(importedChapter.id);
            }
          }}
          onReturn={() => setIsProposalStudioOpen(false)}
        />
      )}

      {isEducationalStudioOpen && (
        <OptionalWorkspace
          label="Opening Educational Studio"
          loader={loadEducationalStudio}
          props={{
            isOpen: true,
            onClose: () => setIsEducationalStudioOpen(false)
          }}
          onReturn={() => setIsEducationalStudioOpen(false)}
        />
      )}

      {isCompanyProfileOpen && (
        <OptionalWorkspace
          label="Opening Company Profile Studio"
          loader={loadCompanyProfileStudio}
          props={{
            isOpen: true,
            onClose: () => setIsCompanyProfileOpen(false),
            onImportToBookStudio: (importedChapter: Chapter) => {
              handleUpdateProject({ chapters: [...project.chapters, importedChapter] });
              setActiveChapterId(importedChapter.id);
            }
          }}
          onReturn={() => setIsCompanyProfileOpen(false)}
        />
      )}

      {isDesignStudioOpen && (
        <OptionalWorkspace
          label="Opening Design Studio"
          loader={loadDesignStudio}
          props={{
            isOpen: true,
            onClose: () => setIsDesignStudioOpen(false),
            onImportToBookStudio: (importedChapter: Chapter) => {
              handleUpdateProject({ chapters: [...project.chapters, importedChapter] });
              setActiveChapterId(importedChapter.id);
            }
          }}
          onReturn={() => setIsDesignStudioOpen(false)}
        />
      )}

      {isGoogleFontsOpen && (
        <OptionalWorkspace
          label="Opening Font Library"
          loader={loadGoogleFonts}
          props={{
            isOpen: true,
            onClose: () => setIsGoogleFontsOpen(false),
            activeSerifFont: project.exportSettings.googleSerifFont || 'EB Garamond',
            activeSansFont: project.exportSettings.googleSansFont || 'Inter',
            onSelectFonts: (serifFont: string, sansFont: string) => {
              handleUpdateProject({
                exportSettings: {
                  ...project.exportSettings,
                  googleSerifFont: serifFont,
                  googleSansFont: sansFont
                }
              });
            }
          }}
          onReturn={() => setIsGoogleFontsOpen(false)}
        />
      )}

      {isImageGalleryOpen && (
        <OptionalWorkspace
          label="Opening Image Gallery"
          loader={loadImageGallery}
          props={{
            isOpen: true,
            onClose: () => setIsImageGalleryOpen(false),
            project,
            onUpdateProject: handleUpdateProject,
            onInsertImageToChapter: handleInsertImageToChapter,
            activeChapterId
          }}
          onReturn={() => setIsImageGalleryOpen(false)}
        />
      )}

      <ProjectManagerModal
        isOpen={isProjectManagerOpen}
        onClose={() => setIsProjectManagerOpen(false)}
        activeProject={project}
        projects={projects}
        onSelectProject={handleSelectProject}
        onCreateProject={handleCreateProject}
        onUpdateProjectInList={handleUpdateProjectInList}
        onDeleteProject={handleDeleteProject}
        isOnline={isOnline}
        persistenceByProject={persistenceByProject}
        initialTab={projectManagerInitialTab}
      />

      {saveState.status === 'conflict' && (
        <div className="fixed bottom-10 right-4 z-50 max-w-md rounded-xl border border-red-500/40 bg-[#2b1614] p-4 text-sm text-red-100 shadow-2xl">
          <div className="font-bold">Local revision conflict</div>
          <p className="mt-1 text-xs text-red-100/75">{saveState.error?.message}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={() => void handleReloadStoredProject()} className="rounded bg-zinc-700 px-3 py-1.5 text-xs font-bold text-white">
              Reload stored version
            </button>
            <button onClick={() => void handleKeepCurrentAsCopy()} className="rounded bg-orange-600 px-3 py-1.5 text-xs font-bold text-white">
              Keep current work as a copy
            </button>
            <button onClick={() => void saveCoordinatorRef.current?.retry()} className="rounded border border-orange-500/50 px-3 py-1.5 text-xs font-bold text-orange-300">
              Retry current work
            </button>
          </div>
        </div>
      )}

      {saveState.status === 'error' && (
        <div className="fixed bottom-10 right-4 z-50 max-w-md rounded-xl border border-red-500/40 bg-[#2b1614] p-4 text-sm text-red-100 shadow-2xl">
          <div className="font-bold">PressCraft could not save locally</div>
          <p className="mt-1 text-xs text-red-100/75">
            {saveState.error?.message} Technical code: {saveState.error?.code}.
          </p>
          <button onClick={() => void saveCoordinatorRef.current?.retry()} className="mt-3 rounded bg-orange-600 px-3 py-1.5 text-xs font-bold text-white">
            Retry local save
          </button>
        </div>
      )}

      {pwa.updateAvailable && (
        <div className="fixed right-4 top-20 z-50 max-w-sm rounded-xl border border-orange-500/40 bg-[#262626] p-4 text-sm text-white shadow-2xl">
          <strong>A new version of PressCraft is available.</strong>
          <p className="mt-1 text-xs text-zinc-400">Save your work before updating.</p>
          {updateError ? <p className="mt-1 text-xs text-red-400">{updateError}</p> : null}
          <div className="mt-3 flex gap-2">
            <button onClick={() => void handleApplyPwaUpdate()} className="rounded bg-orange-600 px-3 py-1.5 text-xs font-bold text-white">Update now</button>
            <button onClick={pwa.dismissUpdate} className="rounded px-3 py-1.5 text-xs font-bold text-zinc-400">Later</button>
          </div>
        </div>
      )}


    </div>
  );
}
