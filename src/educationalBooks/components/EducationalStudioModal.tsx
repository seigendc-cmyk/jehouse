import React, { useState } from 'react';
import { BookProject } from '../../types';
import { EducationalBookProject, EducationalPage, PageType } from '../types';
import { PRESET_EDUCATIONAL_BOOKS } from '../templates';
import { PageEditor } from './PageEditor';
import { WorksheetGeneratorPanel } from './WorksheetGeneratorPanel';
import { EducationalBookPreview } from './EducationalBookPreview';
import { MathRenderer } from './MathRenderer';
import { WorkbookHeader } from '../../features/workbook/WorkbookHeader';
import {
  translateGradeLevelToEducationLevel,
  translateEducationLevelToGradeLevel,
  resolveGradeLabelForLevel
} from '../../features/workbook/workbookAcademicContext';
import {
  GraduationCap,
  X,
  BookOpen,
  Plus,
  Wand2,
  Eye,
  KeyRound,
  Layers,
  Copy,
  ArrowUp,
  ArrowDown,
  FolderPlus,
  Check,
  CheckSquare
} from 'lucide-react';

interface EducationalStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookProject?: BookProject;
  onUpdateBookProject?: (project: BookProject) => void;
}

export const EducationalStudioModal: React.FC<EducationalStudioModalProps> = ({
  isOpen,
  onClose,
  bookProject,
  onUpdateBookProject
}) => {
  const [project, setProject] = useState<EducationalBookProject>(PRESET_EDUCATIONAL_BOOKS[0]);
  const [activeTab, setActiveTab] = useState<'pages' | 'builder' | 'preview' | 'answerKey'>('pages');
  const [selectedPageId, setSelectedPageId] = useState<string>(project.pages[0]?.id || '');

  if (!isOpen) return null;

  const activePage = project.pages.find(p => p.id === selectedPageId) || project.pages[0];

  const deriveBookProject = (eduProject: EducationalBookProject): BookProject => ({
    id: eduProject.id,
    title: eduProject.title,
    subtitle: eduProject.subtitle,
    author: eduProject.author,
    category: 'Academic & Textbook' as BookProject['category'],
    lastSaved: eduProject.createdDate,
    cloudSynced: false,
    chapters: eduProject.pages.map((page, idx) => ({
      id: page.id,
      number: page.chapterNumber ?? idx + 1,
      title: page.chapterTitle ?? `Chapter ${idx + 1}`,
      blocks: [{
        id: page.id,
        type: 'paragraph' as const,
        text: page.title,
        align: 'left' as const
      }],
      wordCount: 0
    })),
    cover: {
      title: eduProject.title,
      subtitle: eduProject.subtitle,
      author: eduProject.author,
      publisher: '',
      coverBgColor: eduProject.coverColor ?? '#EA580C',
      textColor: '#FFFFFF',
      accentColor: '#C2410C',
      spineWidthMm: 12,
      backBlurb: '',
      fullBleedImage: false,
      imageOpacity: 100,
      layoutStyle: 'modern-minimal'
    },
    frontMatter: {
      includeTitlePage: true,
      includeCopyright: false,
      copyrightText: '',
      isbn: '',
      publisher: '',
      includeDedication: false,
      dedicationText: '',
      includeForeword: false,
      forewordAuthor: '',
      forewordContent: '',
      includeExecutiveSummary: false,
      executiveSummaryContent: '',
      includeTOC: true
    },
    watermark: {
      enabled: false,
      type: 'text',
      text: 'DRAFT',
      opacity: 0.08,
      rotation: -35,
      fontSize: 54
    },
    exportSettings: {
      includeCover: true,
      includeFrontMatter: true,
      includeExecSummary: false,
      includeTOC: true,
      includeQuizzes: eduProject.includeAnswerKey,
      includeWatermark: false,
      includeFootnotes: true,
      includeBibliography: false,
      trimSize: '8.5x11',
      fontPairing: 'Classic Serif',
      marginPreset: 'standard',
      showRunningHeader: true,
      showPageNumbers: true,
      enableHyphenation: true,
      autoHyphenation: true
    },
    academicContext: {
      educationLevel: translateGradeLevelToEducationLevel(eduProject.gradeLevel),
      gradeId: undefined,
      gradeLabel: resolveGradeLabelForLevel(eduProject.gradeLevel),
      subjectId: undefined,
      subjectLabel: eduProject.subject,
      customLevelLabel: undefined,
      customGradeLabel: undefined,
      customSubjectLabel: undefined
    }
  });

  const handleBookProjectUpdate = (updatedBookProject: BookProject) => {
    const newContext = updatedBookProject.academicContext;
    if (!newContext) return;
    const newGradeLevel = translateEducationLevelToGradeLevel(newContext.educationLevel);
    setProject(prev => ({
      ...prev,
      gradeLevel: newGradeLevel,
      subject: newContext.subjectLabel,
      academicContext: newContext
    }));
  };

  const handleUpdatePage = (updatedPage: EducationalPage) => {
    const updatedPages = project.pages.map(p => p.id === updatedPage.id ? updatedPage : p);
    setProject({ ...project, pages: updatedPages });
  };

  const handleDeletePage = (id: string) => {
    if (project.pages.length <= 1) return;
    const filtered = project.pages.filter(p => p.id !== id);
    const reindexed = filtered.map((p, idx) => ({ ...p, pageNumber: idx + 1 }));
    setProject({ ...project, pages: reindexed });
    setSelectedPageId(reindexed[0]?.id || '');
  };

  const handleInsertPage = (position: 'before' | 'after', relativePageId: string, customType?: PageType) => {
    const idx = project.pages.findIndex(p => p.id === relativePageId);
    const targetPage = project.pages[idx];
    const newPageId = `page-${Date.now()}`;
    const newPage: EducationalPage = {
      id: newPageId,
      pageNumber: 0,
      type: customType || 'quiz_assessment',
      title: customType === 'quiz_assessment' ? 'New Quiz & Assessment' : 'New Educational Activity Page',
      instructions: 'Complete the activity items according to teacher instructions.',
      difficulty: 'medium',
      chapterNumber: targetPage?.chapterNumber || 1,
      chapterTitle: targetPage?.chapterTitle || 'Chapter 1: Unit Concepts',
      customHeader: targetPage?.customHeader || '',
      fontFamily: targetPage?.fontFamily || 'sans',
      quizQuestions: customType === 'quiz_assessment' ? [
        {
          id: `q-${Date.now()}`,
          question: 'Write your assessment question prompt here...',
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctIndex: 0,
          type: 'multiple_choice',
          points: 5,
          explanation: 'Answer key explanation...'
        }
      ] : undefined
    };

    const insertIndex = position === 'before' ? Math.max(0, idx) : idx + 1;
    const updatedPages = [...project.pages];
    updatedPages.splice(insertIndex, 0, newPage);
    const reindexed = updatedPages.map((p, i) => ({ ...p, pageNumber: i + 1 }));

    setProject({ ...project, pages: reindexed });
    setSelectedPageId(newPageId);
  };

  const handleDuplicatePage = (pageToDup: EducationalPage) => {
    const idx = project.pages.findIndex(p => p.id === pageToDup.id);
    const newPageId = `page-${Date.now()}`;
    const dupPage: EducationalPage = JSON.parse(JSON.stringify(pageToDup));
    dupPage.id = newPageId;
    dupPage.title = `${pageToDup.title} (Copy)`;

    const updatedPages = [...project.pages];
    updatedPages.splice(idx + 1, 0, dupPage);
    const reindexed = updatedPages.map((p, i) => ({ ...p, pageNumber: i + 1 }));

    setProject({ ...project, pages: reindexed });
    setSelectedPageId(newPageId);
  };

  const handleMovePage = (pageId: string, direction: 'up' | 'down') => {
    const idx = project.pages.findIndex(p => p.id === pageId);
    if (idx < 0) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= project.pages.length) return;

    const updatedPages = [...project.pages];
    const [moved] = updatedPages.splice(idx, 1);
    updatedPages.splice(targetIdx, 0, moved);

    const reindexed = updatedPages.map((p, i) => ({ ...p, pageNumber: i + 1 }));
    setProject({ ...project, pages: reindexed });
  };

  const handleAddNewChapter = () => {
    const existingChapterNums = project.pages.map(p => p.chapterNumber || 0);
    const nextChapterNum = Math.max(0, ...existingChapterNums) + 1;
    const newPageId = `ch-${nextChapterNum}-p1-${Date.now()}`;

    const newChapterPage: EducationalPage = {
      id: newPageId,
      pageNumber: project.pages.length + 1,
      type: 'quiz_assessment',
      title: `Chapter ${nextChapterNum} Quiz & Unit Review`,
      instructions: 'Read each question carefully and circle the best answer.',
      difficulty: 'medium',
      chapterNumber: nextChapterNum,
      chapterTitle: `Chapter ${nextChapterNum}: New Unit Topic`,
      customHeader: `Chapter ${nextChapterNum} • Academic Workbook`,
      fontFamily: 'sans',
      quizQuestions: [
        {
          id: `q-ch${nextChapterNum}-1`,
          question: `Sample Chapter ${nextChapterNum} multiple choice question...`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctIndex: 0,
          type: 'multiple_choice',
          points: 5,
          explanation: 'Sample answer explanation for teacher guide.'
        }
      ]
    };

    const updatedPages = [...project.pages, newChapterPage];
    const reindexed = updatedPages.map((p, i) => ({ ...p, pageNumber: i + 1 }));
    setProject({ ...project, pages: reindexed });
    setSelectedPageId(newPageId);
  };

  const handleAddGeneratedPage = (newPage: EducationalPage) => {
    const pageNumber = project.pages.length + 1;
    const pageWithNumber = { ...newPage, pageNumber };
    setProject({ ...project, pages: [...project.pages, pageWithNumber] });
    setSelectedPageId(pageWithNumber.id);
    setActiveTab('pages');
  };

  // Group pages by Chapter
  const chapterMap: Record<string, { number?: number; title?: string; pages: EducationalPage[] }> = {};
  project.pages.forEach(p => {
    const chKey = p.chapterNumber ? `ch-${p.chapterNumber}` : 'ch-unassigned';
    if (!chapterMap[chKey]) {
      chapterMap[chKey] = {
        number: p.chapterNumber,
        title: p.chapterTitle || (p.chapterNumber ? `Chapter ${p.chapterNumber}` : 'Unassigned Chapter Pages'),
        pages: []
      };
    }
    chapterMap[chKey].pages.push(p);
  });

  return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-hidden">
        <div className="w-full max-w-6xl h-[92vh] bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          
          {/* Studio Top Navbar */}
          <header className="px-5 py-3.5 bg-zinc-900 border-b border-zinc-800 text-white flex flex-col gap-3 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-orange-500 text-black font-extrabold flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={project.title}
                      onChange={(e) => setProject({ ...project, title: e.target.value })}
                      className="bg-transparent font-bold text-sm text-white focus:outline-hidden focus:ring-1 focus:ring-orange-500 rounded px-1"
                    />
                  </div>
                  <p className="text-xs text-zinc-400">
                    Academic & Coloring Workbook Studio • Primary to Secondary Education
                  </p>
                </div>
              </div>

              {/* Preset Selector & Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  onChange={(e) => {
                    const found = PRESET_EDUCATIONAL_BOOKS.find(b => b.id === e.target.value);
                    if (found) {
                      setProject(found);
                      setSelectedPageId(found.pages[0]?.id || '');
                    }
                  }}
                  value={project.id}
                  className="bg-zinc-800 border border-zinc-600 text-xs font-bold text-white rounded-lg px-3 py-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
                >
                  <option value="edu-primary-1" className="bg-zinc-900 text-white font-medium">Primary: Heritage & Agriculture</option>
                  <option value="edu-middle-1" className="bg-zinc-900 text-white font-medium">Middle School: Space Science & Algebra</option>
                  <option value="edu-high-1" className="bg-zinc-900 text-white font-medium">High School: Biology & Cell Anatomy</option>
                </select>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  title="Close Educational Studio"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Workbook Academic Context Header */}
            <WorkbookHeader
              project={deriveBookProject(project)}
              onUpdateProject={handleBookProjectUpdate}
            />
          </header>

        {/* Tab Navigation Header */}
        <div className="px-5 py-2.5 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4 text-xs font-semibold shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('pages')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'pages'
                  ? 'bg-orange-500 text-black font-extrabold shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Layers className="w-4 h-4" /> Workbook Pages ({project.pages.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('builder')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'builder'
                  ? 'bg-orange-500 text-black font-extrabold shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Wand2 className="w-4 h-4 text-amber-500" /> Activity Builder
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-orange-500 text-black font-extrabold shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Eye className="w-4 h-4" /> Print Preview & Export
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('answerKey')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'answerKey'
                  ? 'bg-orange-500 text-black font-extrabold shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <KeyRound className="w-4 h-4 text-emerald-500" /> Answer Keys
            </button>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-zinc-500">
            <span>Grade: <strong className="uppercase text-orange-600">{project.gradeLevel}</strong></span>
            <span>Subject: <strong className="uppercase text-orange-600">{project.subject}</strong></span>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          
          {/* TAB 1: WORKBOOK PAGES EDITOR */}
          {activeTab === 'pages' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
              
              {/* Pages Sidebar List grouped by Chapter */}
              <div className="lg:col-span-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-4 overflow-y-auto max-h-[75vh]">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    Pages by Chapter
                  </h4>

                  <button
                    type="button"
                    onClick={handleAddNewChapter}
                    className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                    title="Add new chapter and starter page"
                  >
                    <FolderPlus className="w-3.5 h-3.5" /> + Chapter
                  </button>
                </div>

                {/* Chapter Sections */}
                <div className="space-y-4">
                  {Object.entries(chapterMap).map(([chKey, group]) => (
                    <div key={chKey} className="space-y-1.5">
                      {/* Chapter Title Badge Header */}
                      <div className="flex items-center justify-between p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-extrabold text-orange-600 dark:text-orange-400">
                        <span className="flex items-center gap-1.5 truncate">
                          <BookOpen className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                          <span className="truncate">{group.title}</span>
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono shrink-0">
                          ({group.pages.length} pgs)
                        </span>
                      </div>

                      {/* Pages in Chapter */}
                      <div className="space-y-1.5 pl-1">
                        {group.pages.map((page) => {
                          const pageIdx = project.pages.findIndex(p => p.id === page.id);
                          return (
                            <div
                              key={page.id}
                              className={`p-2.5 rounded-lg border transition-all flex items-center justify-between gap-2 ${
                                selectedPageId === page.id
                                  ? 'bg-orange-500/15 border-orange-500 text-orange-600 dark:text-orange-400 font-bold shadow-xs'
                                  : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 text-zinc-700 dark:text-zinc-300'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => setSelectedPageId(page.id)}
                                className="flex-1 flex items-center gap-2 text-left truncate cursor-pointer"
                              >
                                <span className="w-5 h-5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-[10px] font-bold flex items-center justify-center shrink-0">
                                  {page.pageNumber}
                                </span>
                                <span className="text-xs truncate">{page.title}</span>
                              </button>

                              {/* Quick Reorder / Actions */}
                              <div className="flex items-center gap-0.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleMovePage(page.id, 'up')}
                                  disabled={pageIdx === 0}
                                  className="p-1 text-zinc-400 hover:text-zinc-700 disabled:opacity-20 cursor-pointer"
                                  title="Move Up"
                                >
                                  <ArrowUp className="w-3 h-3" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleMovePage(page.id, 'down')}
                                  disabled={pageIdx === project.pages.length - 1}
                                  className="p-1 text-zinc-400 hover:text-zinc-700 disabled:opacity-20 cursor-pointer"
                                  title="Move Down"
                                >
                                  <ArrowDown className="w-3 h-3" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDuplicatePage(page)}
                                  className="p-1 text-zinc-400 hover:text-amber-500 cursor-pointer"
                                  title="Duplicate Page"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Page Content Editor */}
              <div className="lg:col-span-3">
                {activePage ? (
                  <PageEditor
                    page={activePage}
                    onUpdatePage={handleUpdatePage}
                    onDeletePage={handleDeletePage}
                    onInsertPage={handleInsertPage}
                    onDuplicatePage={handleDuplicatePage}
                  />
                ) : (
                  <div className="p-8 text-center text-zinc-500 text-xs">Select a page to edit</div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: ACTIVITY BUILDER */}
          {activeTab === 'builder' && (
            <div className="max-w-2xl mx-auto">
              <WorksheetGeneratorPanel
                gradeLevel={project.gradeLevel}
                onAddGeneratedPage={handleAddGeneratedPage}
              />
            </div>
          )}

          {/* TAB 3: PRINT PREVIEW */}
          {activeTab === 'preview' && (
            <EducationalBookPreview project={project} />
          )}

          {/* TAB 4: TEACHER ANSWER KEYS */}
          {activeTab === 'answerKey' && (
            <div className="max-w-3xl mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-6">
              <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-emerald-500" /> Compiled Teacher Answer Key Guide
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Solutions for all quizzes, mathematics drills, vocabulary puzzles, and assessments in {project.title}
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                {project.pages.map(page => (
                  <div key={page.id} className="p-4 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg space-y-2">
                    <div className="font-bold text-orange-600 dark:text-orange-400 flex items-center justify-between">
                      <span>Page {page.pageNumber}: {page.title}</span>
                      <span className="uppercase text-[10px] px-2 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded text-zinc-700 dark:text-zinc-300">
                        {page.type}
                      </span>
                    </div>

                    {/* Quiz Questions Key */}
                    {page.quizQuestions && page.quizQuestions.length > 0 && (
                      <div className="space-y-2 pt-1 border-t border-zinc-200 dark:border-zinc-700">
                        <div className="font-bold text-zinc-700 dark:text-zinc-300 text-[11px] uppercase tracking-wider flex items-center gap-1">
                          <CheckSquare className="w-3.5 h-3.5 text-emerald-500" /> Quiz Answer Keys:
                        </div>
                        {page.quizQuestions.map((q, qIdx) => (
                          <div key={q.id} className="p-2.5 bg-white dark:bg-zinc-900 rounded border border-zinc-200 dark:border-zinc-700 space-y-1">
                            <div className="font-bold text-zinc-800 dark:text-zinc-200">
                              #{qIdx + 1}. {q.question}
                            </div>
                            <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-[11px]">
                              Correct Option: {String.fromCharCode(65 + (q.correctIndex || 0))}) {q.options?.[q.correctIndex || 0]}
                            </div>
                            {q.sampleAnswer && (
                              <div className="text-zinc-600 dark:text-zinc-400 italic text-[11px]">
                                Sample Student Response: "{q.sampleAnswer}"
                              </div>
                            )}
                            {q.explanation && (
                              <div className="text-zinc-500 text-[10px] italic">
                                Note: {q.explanation}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {page.mathProblems && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
                        {page.mathProblems.map((prob, i) => (
                          <div key={prob.id} className="bg-white dark:bg-zinc-900 p-2.5 border border-zinc-200 dark:border-zinc-700 rounded text-xs flex items-center justify-between gap-2 overflow-x-auto">
                            <div className="flex items-center gap-1.5 font-semibold">
                              <span className="text-zinc-400">#{i+1}:</span>
                              <MathRenderer math={prob.expression} displayMode={false} />
                            </div>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono shrink-0">➔ {prob.answer}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {page.wordList && (
                      <div className="flex flex-wrap gap-1.5 pt-1 font-mono">
                        {page.wordList.map(w => (
                          <span key={w.word} className="px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded font-bold">
                            {w.word}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
