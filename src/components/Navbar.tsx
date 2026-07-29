import React, { useEffect, useRef, useState } from 'react';
import {
  BookOpen, BookMarked, Check, CloudOff, Database, Download, FileText,
  Focus, FolderOpen, GraduationCap, HelpCircle, Image, LayoutPanelLeft,
  Library, Maximize2, Menu, PanelRight, Plus, Printer, Save, Search,
  Settings, ShieldAlert, Sparkles, Type, Upload, Wifi
} from 'lucide-react';
import { BookProject, UITheme } from '../types';
import { SidebarTab } from './Sidebar';
import {
  applicationDocumentTitle,
  localSaveStatusLabel,
  ProjectSaveState
} from '../persistence/localSaveCoordinator';

export type RibbonTab =
  | 'file' | 'home' | 'insert' | 'layout' | 'references'
  | 'review' | 'view' | 'book' | 'publish' | 'help';

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
  onOpenTypography: () => void;
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
  canInstall?: boolean;
  onInstallPwa?: () => void;
  onGoHome?: () => void;
  saveState: ProjectSaveState;
  activeDocumentLabel?: string;
  navigationVisible?: boolean;
  inspectorVisible?: boolean;
  onToggleNavigation?: () => void;
  onToggleInspector?: () => void;
}

const TABS: { id: RibbonTab; label: string }[] = [
  { id: 'file', label: 'File' }, { id: 'home', label: 'Home' },
  { id: 'insert', label: 'Insert' }, { id: 'layout', label: 'Layout' },
  { id: 'references', label: 'References' }, { id: 'review', label: 'Review' },
  { id: 'view', label: 'View' }, { id: 'book', label: 'Book' },
  { id: 'publish', label: 'Publish' }, { id: 'help', label: 'Help' }
];

function RibbonButton({
  label, icon: Icon, onClick, disabled = false, active = false, title
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title ?? label}
      className={`pc-ribbon-button ${active ? 'is-active' : ''}`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}

function RibbonGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="pc-ribbon-group" aria-label={label}>
      <div className="pc-ribbon-commands">{children}</div>
      <span className="pc-ribbon-group-label">{label}</span>
    </section>
  );
}

export const Navbar: React.FC<NavbarProps> = ({
  project, activeTab = 'editor', onSelectTab, onUpdateProject,
  onOpenFocusMode, onOpenProofread, onOpenStoryContinuation, onOpenExportModal,
  onOpenPrintPreview, onOpenSeriesManager, onOpenTypography, onOpenCloudSync, onSaveToLocalDisk,
  onOpenSQLiteConsole, onOpenEducationalStudio, onOpenCompanyProfile,
  onOpenDesignStudio, onOpenImageGallery, onOpenProjectManager,
  isOnline = true, canInstall = false, onInstallPwa, onGoHome, saveState,
  activeDocumentLabel, navigationVisible = true, inspectorVisible = false,
  onToggleNavigation, onToggleInspector
}) => {
  const [selectedTab, setSelectedTab] = useState<RibbonTab>('home');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(project.title);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => setTitleInput(project.title), [project.title]);

  const submitTitle = () => {
    setIsEditingTitle(false);
    const title = titleInput.trim();
    if (title && title !== project.title) onUpdateProject({ title });
    else setTitleInput(project.title);
  };

  const selectWorkspace = (tab: SidebarTab) => {
    onSelectTab?.(tab);
  };

  const renderRibbon = () => {
    switch (selectedTab) {
      case 'file':
        return <>
          <RibbonGroup label="Project">
            <RibbonButton label="Home" icon={BookOpen} onClick={onGoHome} />
            <RibbonButton label="New / Open" icon={FolderOpen} onClick={onOpenProjectManager} />
            <RibbonButton label="Save" icon={Save} onClick={onSaveToLocalDisk} />
          </RibbonGroup>
          <RibbonGroup label="Output">
            <RibbonButton label="Export" icon={Download} onClick={onOpenExportModal} />
            <RibbonButton label="Print Preview" icon={Printer} onClick={onOpenPrintPreview} />
          </RibbonGroup>
          <RibbonGroup label="Application">
            <RibbonButton label="Install" icon={Upload} onClick={onInstallPwa} disabled={!canInstall} title={canInstall ? 'Install PressCraft' : 'PressCraft is already installed or installation is unavailable'} />
            <RibbonButton label="Settings" icon={Settings} disabled title="Application settings are not yet available" />
          </RibbonGroup>
        </>;
      case 'home':
        return <>
          <RibbonGroup label="Editing">
            <RibbonButton label="Find" icon={Search} disabled title="Use the document toolbar or Ctrl+F" />
            <RibbonButton label="Writing Assistant" icon={Sparkles} onClick={onOpenStoryContinuation} />
          </RibbonGroup>
          <RibbonGroup label="Font & Paragraph">
            <RibbonButton label="Formatting" icon={Type} onClick={() => selectWorkspace('editor')} title="Open the manuscript formatting toolbar" />
            <RibbonButton label="Manuscript" icon={FileText} onClick={() => selectWorkspace('editor')} active={activeTab === 'editor'} />
          </RibbonGroup>
          <RibbonGroup label="Review">
            <RibbonButton label="Proofread" icon={Check} onClick={onOpenProofread} />
          </RibbonGroup>
        </>;
      case 'insert':
        return <>
          <RibbonGroup label="Images">
            <RibbonButton label="Image Gallery" icon={Image} onClick={onOpenImageGallery} />
          </RibbonGroup>
          <RibbonGroup label="Content Blocks">
            <RibbonButton label="Tables, Charts & Equations" icon={Plus} onClick={() => selectWorkspace('editor')} title="Use the manuscript insertion toolbar" />
          </RibbonGroup>
        </>;
      case 'layout':
        return <>
          <RibbonGroup label="Page Setup">
            <RibbonButton label="Layout Controls" icon={LayoutPanelLeft} onClick={() => selectWorkspace('editor')} />
            <RibbonButton label="Watermark" icon={ShieldAlert} onClick={() => selectWorkspace('watermark')} active={activeTab === 'watermark'} />
          </RibbonGroup>
          <RibbonGroup label="View">
            <RibbonButton label="Focus Mode" icon={Focus} onClick={onOpenFocusMode} />
          </RibbonGroup>
        </>;
      case 'references':
        return <>
          <RibbonGroup label="Bibliography">
            <RibbonButton label="Bibliography & BibTeX" icon={Library} onClick={() => selectWorkspace('exportSettings')} />
          </RibbonGroup>
          <RibbonGroup label="Document References">
            <RibbonButton label="Contents & Index" icon={BookMarked} onClick={() => selectWorkspace('frontmatter')} />
          </RibbonGroup>
        </>;
      case 'review':
        return <>
          <RibbonGroup label="Proofing">
            <RibbonButton label="Proofread" icon={Check} onClick={onOpenProofread} />
            <RibbonButton label="Spellcheck not run" icon={FileText} disabled />
          </RibbonGroup>
          <RibbonGroup label="Changes">
            <RibbonButton label="Review Tools" icon={BookOpen} onClick={() => selectWorkspace('editor')} />
          </RibbonGroup>
        </>;
      case 'view':
        return <>
          <RibbonGroup label="Panels">
            <RibbonButton label="Navigation" icon={Menu} onClick={onToggleNavigation} active={navigationVisible} />
            <RibbonButton label="Inspector" icon={PanelRight} onClick={onToggleInspector} active={inspectorVisible} />
          </RibbonGroup>
          <RibbonGroup label="Document View">
            <RibbonButton label="Focus Mode" icon={Maximize2} onClick={onOpenFocusMode} />
          </RibbonGroup>
        </>;
      case 'book':
        return <>
          <RibbonGroup label="Structure">
            <RibbonButton label="Chapters" icon={FileText} onClick={() => selectWorkspace('editor')} />
            <RibbonButton label="Series Manager" icon={BookMarked} onClick={onOpenSeriesManager} />
            <RibbonButton label="Typography" icon={Type} onClick={() => onOpenTypography()} />
          </RibbonGroup>
          <RibbonGroup label="Book Parts">
            <RibbonButton label="Cover" icon={BookOpen} onClick={() => selectWorkspace('cover')} active={activeTab === 'cover'} />
            <RibbonButton label="Front Matter" icon={Library} onClick={() => selectWorkspace('frontmatter')} active={activeTab === 'frontmatter'} />
            <RibbonButton label="Assets" icon={Image} onClick={onOpenImageGallery} />
          </RibbonGroup>
          <RibbonGroup label="Specialised Studios">
            <RibbonButton label="Education" icon={GraduationCap} onClick={onOpenEducationalStudio} />
            <RibbonButton label="Company Profile" icon={FileText} onClick={onOpenCompanyProfile} />
            <RibbonButton label="Design" icon={Sparkles} onClick={onOpenDesignStudio} />
          </RibbonGroup>
        </>;
      case 'publish':
        return <>
          <RibbonGroup label="Prepare">
            <RibbonButton label="Export Settings" icon={Settings} onClick={() => selectWorkspace('exportSettings')} active={activeTab === 'exportSettings'} />
            <RibbonButton label="Print Preview" icon={Printer} onClick={onOpenPrintPreview} />
          </RibbonGroup>
          <RibbonGroup label="Export">
            <RibbonButton label="Compile & Export" icon={Download} onClick={onOpenExportModal} />
          </RibbonGroup>
        </>;
      case 'help':
        return <>
          <RibbonGroup label="PressCraft Help">
            <RibbonButton label="Getting Started" icon={HelpCircle} disabled title="Help centre is planned" />
            <RibbonButton label="Offline Guide" icon={CloudOff} disabled title="Offline guide is planned" />
          </RibbonGroup>
          <RibbonGroup label="Diagnostics">
            <RibbonButton label="Local Data Inspector" icon={Database} onClick={onOpenSQLiteConsole} />
            <RibbonButton label="Cloud sync disabled" icon={CloudOff} onClick={onOpenCloudSync} />
          </RibbonGroup>
        </>;
    }
  };

  return (
    <header className="pc-app-header" aria-label={applicationDocumentTitle(project.title, activeDocumentLabel, saveState, isOnline)}>
      <div className="pc-titlebar">
        <div className="pc-brand-mark" aria-hidden="true">PC</div>
        <strong className="pc-product-name">PressCraft Book Studio</strong>
        <span className="pc-title-separator">|</span>
        {isEditingTitle ? (
          <input
            aria-label="Project title"
            value={titleInput}
            onChange={(event) => setTitleInput(event.target.value)}
            onBlur={submitTitle}
            onKeyDown={(event) => {
              if (event.key === 'Enter') submitTitle();
              if (event.key === 'Escape') { setTitleInput(project.title); setIsEditingTitle(false); }
            }}
            autoFocus
            className="pc-title-input"
          />
        ) : (
          <button className="pc-project-title" onClick={() => setIsEditingTitle(true)} title={`${project.title.trim() || 'Untitled Book'} — click to edit`}>
            {project.title.trim() || 'Untitled Book'}
          </button>
        )}
        {activeDocumentLabel && <><span className="pc-title-separator">|</span><span className="pc-document-label" title={activeDocumentLabel}>{activeDocumentLabel}</span></>}
        <div className="pc-title-status">
          <span className={`pc-save-state pc-save-${saveState.status}`}>{localSaveStatusLabel(saveState, isOnline)}</span>
          <span className="pc-connectivity">{isOnline ? <Wifi className="h-3.5 w-3.5" /> : <CloudOff className="h-3.5 w-3.5" />}{isOnline ? 'Online' : 'Offline'}</span>
        </div>
      </div>
      <nav className="pc-menu-tabs" aria-label="Application menu tabs" role="tablist">
        {TABS.map((tab, index) => (
          <button
            key={tab.id}
            ref={(node) => { tabRefs.current[index] = node; }}
            role="tab"
            aria-selected={selectedTab === tab.id}
            className={`pc-menu-tab ${selectedTab === tab.id ? 'is-selected' : ''}`}
            onClick={() => setSelectedTab(tab.id)}
            onKeyDown={(event) => {
              if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
              event.preventDefault();
              const next = (index + (event.key === 'ArrowRight' ? 1 : -1) + TABS.length) % TABS.length;
              setSelectedTab(TABS[next].id);
              tabRefs.current[next]?.focus();
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <div className="pc-ribbon" role="tabpanel" aria-label={`${selectedTab} commands`}>
        {renderRibbon()}
      </div>
    </header>
  );
};
