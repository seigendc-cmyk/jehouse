import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Archive,
  RotateCcw,
  Trash2,
  Copy,
  Download,
  Upload,
  Sparkles,
  Check,
  X,
  FileText,
  Clock,
  Layers,
  Cloud,
  CloudOff,
  Search,
  BookMarked,
  Feather,
  GraduationCap,
  Briefcase
} from 'lucide-react';
import { BookProject, BookCategory, Chapter, ContentBlock } from '../types';

import { createEmptyBookProject } from '../data/createEmptyBookProject';

interface ProjectManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProject: BookProject;
  projects: BookProject[];
  onSelectProject: (projectId: string) => boolean | Promise<boolean>;
  onCreateProject: (newProject: BookProject) => void;
  onUpdateProjectInList: (updatedProject: BookProject) => void;
  onDeleteProject: (projectId: string) => void;
  isOnline: boolean;
  persistenceByProject: Record<
    string,
    { lastSavedAt?: string; localRevision: number; status: string }
  >;
  initialTab?: 'active' | 'new';
}

export const ProjectManagerModal: React.FC<ProjectManagerModalProps> = ({
  isOpen,
  onClose,
  activeProject,
  projects,
  onSelectProject,
  onCreateProject,
  onUpdateProjectInList,
  onDeleteProject,
  isOnline,
  persistenceByProject,
  initialTab = 'active'
}) => {
  const [activeTab, setActiveTab] = useState<'active' | 'archived' | 'new'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  
  // New Project Form State
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newCategory, setNewCategory] = useState<BookCategory>('Fiction & Literature');
  const [selectedTemplate, setSelectedTemplate] = useState<'blank' | 'fiction' | 'nonfiction' | 'educational' | 'ai'>('blank');
  
  // AI Outline Generator State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) setActiveTab(initialTab);
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const activeProjectsList = projects.filter(p => !p.archived && (
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  ));

  const archivedProjectsList = projects.filter(p => p.archived && (
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  ));

  const handleCreateNew = async () => {
    if (!newTitle.trim()) return;

    let chapters: Chapter[] = [
      {
        id: `ch-1-${Date.now()}`,
        number: 1,
        title: 'Chapter 1: Opening',
        wordCount: 0,
        blocks: [
          {
            id: `b-1-${Date.now()}`,
            type: 'paragraph',
            text: '',
            fontFamily: 'Georgia, serif',
            fontSize: 16,
            align: 'left',
            lineHeight: 1.6
          }
        ]
      }
    ];

    if (selectedTemplate === 'fiction') {
      chapters = [
        {
          id: `ch-1-${Date.now()}`,
          number: 1,
          title: 'Prologue: Shadows of the Past',
          wordCount: 15,
          blocks: [
            { id: `b1-${Date.now()}`, type: 'paragraph', text: 'The wind blew across the ancient courtyard as night descended...', fontFamily: 'Georgia, serif', fontSize: 16, align: 'left', lineHeight: 1.6 }
          ]
        },
        {
          id: `ch-2-${Date.now()}`,
          number: 2,
          title: 'Chapter 1: The Inciting Discovery',
          wordCount: 12,
          blocks: [
            { id: `b2-${Date.now()}`, type: 'paragraph', text: 'Nobody expected the hidden letter in the old oak library...', fontFamily: 'Georgia, serif', fontSize: 16, align: 'left', lineHeight: 1.6 }
          ]
        },
        {
          id: `ch-3-${Date.now()}`,
          number: 3,
          title: 'Chapter 2: Crossing the Threshold',
          wordCount: 14,
          blocks: [
            { id: `b3-${Date.now()}`, type: 'paragraph', text: 'With bags packed, the journey into the unknown had officially begun...', fontFamily: 'Georgia, serif', fontSize: 16, align: 'left', lineHeight: 1.6 }
          ]
        }
      ];
    }
 else if (selectedTemplate === 'nonfiction') {
      chapters = [
        {
          id: `ch-1-${Date.now()}`,
          number: 1,
          title: 'Introduction & Core Vision',
          wordCount: 120,
          blocks: [
            { id: `b1-${Date.now()}`, type: 'subheading', text: 'Why This Matters Now', fontFamily: 'Inter, sans-serif', fontSize: 22, align: 'left', lineHeight: 1.4 },
            { id: `b2-${Date.now()}`, type: 'paragraph', text: 'In today\'s rapidly changing environment, traditional strategies are no longer sufficient...', fontFamily: 'Georgia, serif', fontSize: 16, align: 'left', lineHeight: 1.6 }
          ]
        },
        {
          id: `ch-2-${Date.now()}`,
          number: 2,
          title: 'Part 1: The Foundational Framework',
          wordCount: 80,
          blocks: [
            { id: `b3-${Date.now()}`, type: 'paragraph', text: 'Three core pillars form the cornerstone of successful execution...', fontFamily: 'Georgia, serif', fontSize: 16, align: 'left', lineHeight: 1.6 }
          ]
        }
      ];
    } else if (selectedTemplate === 'educational') {
      chapters = [
        {
          id: `ch-1-${Date.now()}`,
          number: 1,
          title: 'Unit 1: Fundamentals & Key Concepts',
          wordCount: 100,
          blocks: [
            { id: `b1-${Date.now()}`, type: 'subheading', text: 'Learning Objectives', fontFamily: 'Inter, sans-serif', fontSize: 20, align: 'left', lineHeight: 1.4 },
            { id: `b2-${Date.now()}`, type: 'paragraph', text: 'By the end of this chapter, students will be able to identify primary principles and apply analytical formulas.', fontFamily: 'Georgia, serif', fontSize: 16, align: 'left', lineHeight: 1.6 }
          ]
        }
      ];
    } else if (selectedTemplate === 'ai' && aiPrompt.trim()) {
      setIsGenerating(true);
      setAiError(null);
      try {
        const response = await fetch('/api/ai/book-outline', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: newTitle,
            category: newCategory,
            prompt: aiPrompt
          })
        });
        if (!response.ok) throw new Error('The outline service could not complete the request.');
        const payload = (await response.json()) as {
          chapters?: Array<{ title?: string; summary?: string }>;
        };
        if (Array.isArray(payload.chapters)) {
          chapters = payload.chapters.map((item, idx) => ({
            id: `ch-${idx + 1}-${Date.now()}`,
            number: idx + 1,
            title: item.title || `Chapter ${idx + 1}`,
            wordCount: (item.summary || '').split(/\s+/).filter(Boolean).length || 50,
            blocks: [
              {
                id: `b-${idx}-${Date.now()}`,
                type: 'paragraph' as const,
                text: item.summary || 'Content draft generated by PressCraft AI...',
                fontFamily: 'Georgia, serif',
                fontSize: 16,
                align: 'left' as const,
                lineHeight: 1.6
              }
            ]
          }));
        }
      } catch (err: any) {
        console.warn('[AI Book Outline] Error:', err);
        setAiError('Failed to generate AI outline. Created basic initial template instead.');
      } finally {
        setIsGenerating(false);
      }
    }

    const newProject = createEmptyBookProject({
      title: newTitle,
      subtitle: newSubtitle,
      author: newAuthor,
      category: newCategory
    });
    newProject.chapters = chapters;

    onCreateProject(newProject);
    setNewTitle('');
    setNewSubtitle('');
    setNewAuthor('');
    setAiPrompt('');
    setActiveTab('active');
  };

  const handleToggleArchive = (project: BookProject) => {
    const updated = { ...project, archived: !project.archived };
    onUpdateProjectInList(updated);
  };

  const handleDuplicate = (project: BookProject) => {
    const duplicated: BookProject = {
      ...project,
      id: `book-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: `${project.title} (Copy)`,
      archived: false
    };
    onCreateProject(duplicated);
  };

  const handleExportJSON = (project: BookProject) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.presscraft.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string) as BookProject;
        if (imported && imported.title && Array.isArray(imported.chapters)) {
          const newProj = {
            ...imported,
            id: `book-imp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
          };
          onCreateProject(newProj);
        } else {
          alert('Invalid PressCraft book project JSON file.');
        }
      } catch (err) {
        alert('Could not parse project file.');
      }
    };
    reader.readAsText(file);
  };

  const calculateTotalWords = (project: BookProject) => {
    let words = 0;
    project.chapters.forEach(ch => {
      ch.blocks.forEach(b => {
        if (b.text) {
          words += b.text.trim().split(/\s+/).filter(Boolean).length;
        }
      });
    });
    return words;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
      <div className="bg-[#2b1310] dark:bg-[#1f1a18] text-[#fff6f2] dark:text-zinc-100 border border-[#56241e] dark:border-zinc-800 rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#230e0c] dark:bg-[#161211] border-b border-[#56241e] dark:border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <BookMarked className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-[#fff6f2]">Book Project Manager & Archives</h2>
              <p className="text-xs text-[#ebd3ca] dark:text-zinc-400">Manage, archive, duplicate, or start new offline-first books</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border bg-zinc-800 border-zinc-700 text-zinc-300"
              title="Firebase synchronization is disabled until secure Firestore rules are approved"
            >
              {isOnline ? <Cloud className="w-3.5 h-3.5 text-zinc-400" /> : <CloudOff className="w-3.5 h-3.5 text-amber-400" />}
              <span>{isOnline ? 'Local storage active' : 'Offline — local storage active'}</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body & Navigation Tabs */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          
          {/* Sidebar Nav */}
          <div className="w-full md:w-64 bg-[#230e0c] dark:bg-[#181413] border-r border-[#56241e] dark:border-zinc-800 p-4 space-y-2 shrink-0">
            <button
              onClick={() => setActiveTab('active')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'active'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'text-[#ebd3ca] hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4" />
                <span>Active Books ({projects.filter(p => !p.archived).length})</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('archived')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'archived'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'text-[#ebd3ca] hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Archive className="w-4 h-4" />
                <span>Archived Books ({projects.filter(p => p.archived).length})</span>
              </div>
            </button>

            <div className="my-2 border-t border-[#56241e] dark:border-zinc-800" />

            <button
              onClick={() => setActiveTab('new')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'new'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:bg-orange-500/20'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Start New Book Project</span>
            </button>

            <div className="pt-4">
              <label className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl border border-dashed border-[#56241e] dark:border-zinc-700 text-xs font-semibold text-[#ebd3ca] hover:text-white hover:border-orange-500/50 cursor-pointer transition">
                <Upload className="w-3.5 h-3.5 text-orange-400" />
                <span>Import Book JSON</span>
                <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
              </label>
            </div>
          </div>

          {/* Main Content Pane */}
          <div className="flex-1 bg-[#2b1310] dark:bg-[#1f1a18] p-6 overflow-y-auto">
            
            {/* Search Bar for Active & Archived */}
            {(activeTab === 'active' || activeTab === 'archived') && (
              <div className="mb-6 flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search by title, author, or genre..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-[#381916] dark:bg-[#161211] border border-[#56241e] dark:border-zinc-700 rounded-xl text-xs text-[#fff6f2] focus:outline-hidden focus:border-orange-500"
                  />
                </div>
              </div>
            )}

            {/* TAB 1: ACTIVE PROJECTS */}
            {activeTab === 'active' && (
              <div className="space-y-4">
                {activeProjectsList.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-[#56241e] rounded-2xl p-8">
                    <BookOpen className="w-10 h-10 text-orange-500/50 mx-auto mb-3" />
                    <h3 className="font-bold text-sm text-[#fff6f2]">No active book projects found</h3>
                    <p className="text-xs text-[#ebd3ca] mt-1 mb-4">Start a new book manuscript or restore one from archives</p>
                    <button
                      onClick={() => setActiveTab('new')}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      Start New Book Project
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeProjectsList.map((p) => {
                      const isActive = p.id === activeProject.id;
                      const words = calculateTotalWords(p);
                      const persistence = persistenceByProject[p.id];

                      return (
                        <div
                          key={p.id}
                          className={`p-4 rounded-2xl border transition flex flex-col justify-between relative group ${
                            isActive
                              ? 'bg-[#3d1a16] border-orange-500 ring-2 ring-orange-500/30'
                              : 'bg-[#381916] dark:bg-[#161211] border-[#56241e] hover:border-orange-500/50'
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-bold tracking-wide uppercase border border-orange-500/30">
                                {p.category}
                              </span>
                              {isActive && (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                                  <Check className="w-3 h-3" /> Active Workspace
                                </span>
                              )}
                            </div>

                            <h3 className="font-bold text-base text-[#fff6f2] line-clamp-1">{p.title}</h3>
                            {p.subtitle && <p className="text-xs text-[#ebd3ca] line-clamp-1 italic">{p.subtitle}</p>}
                            <p className="text-xs text-[#c9a59b] mt-1">By {p.author}</p>

                            <div className="flex items-center gap-4 text-[11px] text-[#c9a59b] mt-3 pt-3 border-t border-[#56241e]">
                              <span className="flex items-center gap-1">
                                <Layers className="w-3.5 h-3.5 text-orange-400" /> {p.chapters.length} Chapters
                              </span>
                              <span className="flex items-center gap-1">
                                <FileText className="w-3.5 h-3.5 text-amber-400" /> {words.toLocaleString()} words
                              </span>
                            </div>
                            <div className="mt-2 text-[10px] text-[#c9a59b] flex items-center gap-1">
                              <Clock className="w-3 h-3 text-orange-400" />
                              {persistence?.lastSavedAt
                                ? `Saved on this device ${new Date(persistence.lastSavedAt).toLocaleString()} · Revision ${persistence.localRevision}`
                                : 'Local project · Not yet confirmed saved'}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-[#56241e]">
                            {!isActive ? (
                              <button
                                onClick={async () => {
                                  if (await onSelectProject(p.id)) onClose();
                                }}
                                className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-lg transition cursor-pointer"
                              >
                                Open & Continue
                              </button>
                            ) : (
                              <span className="text-xs font-bold text-orange-400">Currently Editing</span>
                            )}

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDuplicate(p)}
                                title="Duplicate / Fork Book"
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleExportJSON(p)}
                                title="Export Standalone Backup JSON"
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleToggleArchive(p)}
                                title="Archive Book"
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-400 hover:bg-white/10 transition cursor-pointer"
                              >
                                <Archive className="w-3.5 h-3.5" />
                              </button>

                              {projects.length > 1 && (
                                <button
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to delete "${p.title}"?`)) {
                                      onDeleteProject(p.id);
                                    }
                                  }}
                                  title="Delete Book"
                                  className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-white/10 transition cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: ARCHIVED PROJECTS */}
            {activeTab === 'archived' && (
              <div className="space-y-4">
                {archivedProjectsList.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-[#56241e] rounded-2xl p-8">
                    <Archive className="w-10 h-10 text-zinc-500 mx-auto mb-3" />
                    <h3 className="font-bold text-sm text-[#fff6f2]">No archived books</h3>
                    <p className="text-xs text-[#ebd3ca] mt-1">Archived manuscripts will be stored here so you can restore them anytime.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {archivedProjectsList.map((p) => {
                      const words = calculateTotalWords(p);

                      return (
                        <div
                          key={p.id}
                          className="p-4 rounded-2xl border border-[#56241e] bg-[#2d1310] opacity-80 hover:opacity-100 transition flex flex-col justify-between"
                        >
                          <div>
                            <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-[10px] font-bold uppercase border border-zinc-700">
                              Archived • {p.category}
                            </span>
                            <h3 className="font-bold text-base text-[#fff6f2] mt-2">{p.title}</h3>
                            <p className="text-xs text-[#c9a59b]">By {p.author}</p>
                            <div className="flex items-center gap-4 text-[11px] text-[#c9a59b] mt-3">
                              <span>{p.chapters.length} Chapters</span>
                              <span>{words.toLocaleString()} words</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-[#56241e]">
                            <button
                              onClick={() => handleToggleArchive(p)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-lg transition cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Restore Book</span>
                            </button>

                            <button
                              onClick={() => {
                                if (confirm(`Permanently delete archived book "${p.title}"?`)) {
                                  onDeleteProject(p.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-white/10 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: START NEW PROJECT */}
            {activeTab === 'new' && (
              <div className="space-y-6 max-w-2xl mx-auto">
                <div>
                  <h3 className="font-bold text-base text-[#fff6f2]">Create New Book Manuscript</h3>
                  <p className="text-xs text-[#ebd3ca]">Select a starter template or draft from scratch</p>
                </div>

                {/* Templates Selector */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedTemplate('blank')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      selectedTemplate === 'blank'
                        ? 'bg-orange-600/20 border-orange-500 text-orange-300'
                        : 'bg-[#381916] border-[#56241e] text-[#ebd3ca] hover:border-orange-500/40'
                    }`}
                  >
                    <Feather className="w-5 h-5 mb-2 text-orange-400" />
                    <div>
                      <div className="font-bold text-xs">Blank Book</div>
                      <div className="text-[10px] text-[#c9a59b]">Fresh canvas</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedTemplate('fiction')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      selectedTemplate === 'fiction'
                        ? 'bg-orange-600/20 border-orange-500 text-orange-300'
                        : 'bg-[#381916] border-[#56241e] text-[#ebd3ca] hover:border-orange-500/40'
                    }`}
                  >
                    <BookOpen className="w-5 h-5 mb-2 text-orange-400" />
                    <div>
                      <div className="font-bold text-xs">Fiction Novel</div>
                      <div className="text-[10px] text-[#c9a59b]">3-Act Structure</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedTemplate('nonfiction')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      selectedTemplate === 'nonfiction'
                        ? 'bg-orange-600/20 border-orange-500 text-orange-300'
                        : 'bg-[#381916] border-[#56241e] text-[#ebd3ca] hover:border-orange-500/40'
                    }`}
                  >
                    <Briefcase className="w-5 h-5 mb-2 text-orange-400" />
                    <div>
                      <div className="font-bold text-xs">Business / Guide</div>
                      <div className="text-[10px] text-[#c9a59b]">Frameworks</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedTemplate('ai')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      selectedTemplate === 'ai'
                        ? 'bg-purple-600/30 border-purple-400 text-purple-200'
                        : 'bg-[#381916] border-[#56241e] text-[#ebd3ca] hover:border-purple-400/40'
                    }`}
                  >
                    <Sparkles className="w-5 h-5 mb-2 text-purple-400" />
                    <div>
                      <div className="font-bold text-xs">AI Assistant</div>
                      <div className="text-[10px] text-purple-300">Generate Outline</div>
                    </div>
                  </button>
                </div>

                {/* Form Fields */}
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-[#ebd3ca] mb-1">Book Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. The Secrets of Kalahari"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#381916] border border-[#56241e] rounded-xl text-xs text-[#fff6f2] focus:outline-hidden focus:border-orange-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#ebd3ca] mb-1">Subtitle (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. A Journey Through Time"
                        value={newSubtitle}
                        onChange={(e) => setNewSubtitle(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#381916] border border-[#56241e] rounded-xl text-xs text-[#fff6f2] focus:outline-hidden focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#ebd3ca] mb-1">Author Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Miriam Dube"
                        value={newAuthor}
                        onChange={(e) => setNewAuthor(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#381916] border border-[#56241e] rounded-xl text-xs text-[#fff6f2] focus:outline-hidden focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#ebd3ca] mb-1">Genre / Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as BookCategory)}
                      className="w-full px-3.5 py-2.5 bg-[#381916] border border-[#56241e] rounded-xl text-xs text-[#fff6f2] focus:outline-hidden focus:border-orange-500"
                    >
                      <option value="Fiction & Literature">Fiction & Literature</option>
                      <option value="Non-Fiction & Biography">Non-Fiction & Biography</option>
                      <option value="Educational & Textbook">Educational & Textbook</option>
                      <option value="Business & Technology">Business & Technology</option>
                      <option value="Poetry & Arts">Poetry & Arts</option>
                      <option value="Children & Illustrated">Children & Illustrated</option>
                      <option value="Comic & Graphic Novel">Comic & Graphic Novel</option>
                    </select>
                  </div>

                  {selectedTemplate === 'ai' && (
                    <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/40 space-y-2">
                      <label className="block text-xs font-bold text-purple-200 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        Describe your book vision for AI Outline Generator
                      </label>
                      <textarea
                        rows={3}
                        placeholder="e.g. A gripping mystery novel set in Victoria Falls involving ancient artifacts and corporate intrigue..."
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        className="w-full p-3 bg-[#230e0c] border border-purple-500/30 rounded-xl text-xs text-white focus:outline-hidden focus:border-purple-400 resize-none"
                      />
                    </div>
                  )}

                  {aiError && (
                    <div className="p-3 bg-red-950/80 border border-red-500/50 text-red-200 text-xs rounded-xl">
                      {aiError}
                    </div>
                  )}

                  <div className="pt-4 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab('active')}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      disabled={!newTitle.trim() || isGenerating}
                      onClick={handleCreateNew}
                      className="flex items-center gap-2 px-6 py-2.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer"
                    >
                      {isGenerating ? (
                        <>
                          <Sparkles className="w-4 h-4 animate-spin text-purple-300" />
                          <span>Generating AI Book Outline...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>Create & Launch Book Workspace</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
