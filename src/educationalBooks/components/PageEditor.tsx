import React, { useState } from 'react';
import { EducationalPage, PageType, ChartData, QuizQuestion, PageContentBlock } from '../types';
import { InteractiveColoringCanvas } from './InteractiveColoringCanvas';
import { MathRenderer } from './MathRenderer';
import { AcademicTable } from './AcademicTable';
import { AcademicChart } from './AcademicChart';
import { ImageUploaderBlock } from './ImageUploaderBlock';
import { 
  FileText, 
  Trash2, 
  Plus, 
  Calculator, 
  Palette, 
  Grid, 
  HelpCircle, 
  Lightbulb, 
  Code2, 
  BookOpen, 
  Type, 
  BarChart3, 
  Table as TableIcon, 
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  CheckSquare,
  Copy,
  ArrowUp,
  ArrowDown,
  List,
  AlertCircle,
  Bookmark,
  Sparkles,
  Check,
  X
} from 'lucide-react';

interface PageEditorProps {
  page: EducationalPage;
  onUpdatePage: (updated: EducationalPage) => void;
  onDeletePage: (id: string) => void;
  onInsertPage?: (position: 'before' | 'after', relativePageId: string) => void;
  onDuplicatePage?: (page: EducationalPage) => void;
}

export const PageEditor: React.FC<PageEditorProps> = ({
  page,
  onUpdatePage,
  onDeletePage,
  onInsertPage,
  onDuplicatePage,
}) => {
  const [showContentBlockMenu, setShowContentBlockMenu] = useState(false);

  // Initialize quizQuestions if empty for quiz_assessment type
  const quizQuestions = page.quizQuestions || [];

  const handleAddQuizQuestion = (type: 'multiple_choice' | 'short_answer' | 'true_false' = 'multiple_choice') => {
    const newQ: QuizQuestion = {
      id: `q-${Date.now()}`,
      question: type === 'true_false' ? 'Is the following statement True or False?' : 'Write your question text here...',
      options: type === 'true_false' ? ['True', 'False'] : ['Option A', 'Option B', 'Option C', 'Option D'],
      correctIndex: 0,
      type,
      points: 5,
      explanation: 'Explanation for answer key reference...',
      sampleAnswer: type === 'short_answer' ? 'Sample ideal student response...' : undefined,
    };
    onUpdatePage({ ...page, quizQuestions: [...quizQuestions, newQ] });
  };

  const handleUpdateQuizQuestion = (qId: string, updatedProps: Partial<QuizQuestion>) => {
    const updated = quizQuestions.map(q => q.id === qId ? { ...q, ...updatedProps } : q);
    onUpdatePage({ ...page, quizQuestions: updated });
  };

  const handleDeleteQuizQuestion = (qId: string) => {
    const filtered = quizQuestions.filter(q => q.id !== qId);
    onUpdatePage({ ...page, quizQuestions: filtered });
  };

  // Content Blocks Handlers
  const handleAddContentBlock = (type: PageContentBlock['type']) => {
    const newBlock: PageContentBlock = {
      id: `block-${Date.now()}`,
      type,
      title: type === 'subheading' ? 'New Section Subheading' : type === 'vocabulary' ? 'Key Vocabulary Term' : undefined,
      content: type === 'callout' ? 'Important concept or tip for students to note.' : 'Enter content details here...',
      style: type === 'callout' ? 'info' : undefined,
      items: type === 'bullet_list' ? ['First bullet point item', 'Second bullet point item'] : undefined,
    };
    const blocks = page.contentBlocks || [];
    onUpdatePage({ ...page, contentBlocks: [...blocks, newBlock] });
    setShowContentBlockMenu(false);
  };

  const handleUpdateContentBlock = (blockId: string, updatedProps: Partial<PageContentBlock>) => {
    const blocks = (page.contentBlocks || []).map(b => b.id === blockId ? { ...b, ...updatedProps } : b);
    onUpdatePage({ ...page, contentBlocks: blocks });
  };

  const handleDeleteContentBlock = (blockId: string) => {
    const blocks = (page.contentBlocks || []).filter(b => b.id !== blockId);
    onUpdatePage({ ...page, contentBlocks: blocks });
  };

  const handleMoveContentBlock = (blockId: string, direction: 'up' | 'down') => {
    const blocks = [...(page.contentBlocks || [])];
    const idx = blocks.findIndex(b => b.id === blockId);
    if (idx < 0) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= blocks.length) return;
    const [moved] = blocks.splice(idx, 1);
    blocks.splice(targetIdx, 0, moved);
    onUpdatePage({ ...page, contentBlocks: blocks });
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-6 shadow-sm">
      
      {/* Top Header & Page Management Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-orange-500 text-black font-black text-xs flex items-center justify-center shadow-sm">
            {page.pageNumber}
          </span>
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm flex items-center gap-2">
              Editing Page {page.pageNumber}
              {page.chapterNumber && (
                <span className="text-[10px] px-2 py-0.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold rounded-full">
                  Ch {page.chapterNumber}: {page.chapterTitle || 'Chapter'}
                </span>
              )}
            </h3>
            <p className="text-[11px] text-zinc-500">Activity Type: <strong className="uppercase text-orange-600">{page.type.replace(/_/g, ' ')}</strong></p>
          </div>
        </div>

        {/* Page Insertion / Duplicate / Delete Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {onInsertPage && (
            <>
              <button
                type="button"
                onClick={() => onInsertPage('before', page.id)}
                className="px-2.5 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                title="Insert page before this page"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-500" /> Insert Before
              </button>

              <button
                type="button"
                onClick={() => onInsertPage('after', page.id)}
                className="px-2.5 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                title="Insert page after this page"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-500" /> Insert After
              </button>
            </>
          )}

          {onDuplicatePage && (
            <button
              type="button"
              onClick={() => onDuplicatePage(page)}
              className="px-2.5 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              title="Duplicate this page"
            >
              <Copy className="w-3.5 h-3.5 text-amber-500" /> Duplicate
            </button>
          )}

          <button
            type="button"
            onClick={() => onDeletePage(page.id)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete Page
          </button>
        </div>
      </div>

      {/* Page Title & Activity Type Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="md:col-span-2">
          <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
            Page Title Header
          </label>
          <input
            type="text"
            value={page.title}
            onChange={(e) => onUpdatePage({ ...page, title: e.target.value })}
            className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg font-bold text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-orange-500 focus:outline-none"
            placeholder="e.g. Chapter 1 Quiz / Heritage Studies Practice"
          />
        </div>

        <div>
          <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
            Activity Type
          </label>
          <select
            value={page.type}
            onChange={(e) => onUpdatePage({ ...page, type: e.target.value as PageType })}
            className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg font-medium text-zinc-900 dark:text-zinc-100 cursor-pointer focus:ring-2 focus:ring-orange-500 focus:outline-none"
          >
            <option value="quiz_assessment" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">📝 Quiz & Assessment Paper</option>
            <option value="past_exam_paper" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">📄 ZIMSEC Past Examination Paper</option>
            <option value="revision_test" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">✅ Timed Revision Test Paper</option>
            <option value="cad_drafting" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">📐 ArchiCAD & FreeCAD 2D/3D CAD</option>
            <option value="three_d_printing" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">🖨️ 3D Printing Dynamics</option>
            <option value="data_sheet_table" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">📊 Sheets & Data Table</option>
            <option value="graph_chart" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">📈 Graph & Data Visualization</option>
            <option value="math_worksheet" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">📐 Math Worksheet (LaTeX)</option>
            <option value="folktale_story" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">📖 African Folktale (Ngano / Inganekwane)</option>
            <option value="community_project" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">🌱 Community Field Project (ZIMSEC Schema)</option>
            <option value="language_translation" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">🗣️ Indigenous Language (Shona / Ndebele)</option>
            <option value="coloring_lineart" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">🎨 Coloring & Line-Art</option>
            <option value="word_puzzle" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">🧩 Word Search / Puzzle</option>
          </select>
        </div>
      </div>

      {/* Chapters & Formatting Options Bar */}
      <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 rounded-lg space-y-3 text-xs">
        <span className="font-extrabold uppercase text-[11px] text-zinc-500 tracking-wider flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-emerald-500" /> Chapter, Running Header & Typography Formatting
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Chapter No.</label>
            <input
              type="number"
              min="1"
              max="50"
              value={page.chapterNumber || ''}
              onChange={(e) => onUpdatePage({ ...page, chapterNumber: parseInt(e.target.value) || undefined })}
              placeholder="e.g. 1"
              className="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded font-semibold text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Chapter Name</label>
            <input
              type="text"
              value={page.chapterTitle || ''}
              onChange={(e) => onUpdatePage({ ...page, chapterTitle: e.target.value })}
              placeholder="e.g. Heritage & Agricultural Science"
              className="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded font-semibold text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Running Header</label>
            <input
              type="text"
              value={page.customHeader || ''}
              onChange={(e) => onUpdatePage({ ...page, customHeader: e.target.value })}
              placeholder="e.g. Grade 6 • Unit 1"
              className="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Font Family</label>
            <select
              value={page.fontFamily || 'sans'}
              onChange={(e) => onUpdatePage({ ...page, fontFamily: e.target.value as any })}
              className="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded font-medium text-zinc-900 dark:text-zinc-100 cursor-pointer"
            >
              <option value="sans">Modern Sans</option>
              <option value="serif">Classic Serif</option>
              <option value="mono">Technical Monospace</option>
              <option value="dyslexic">Dyslexic-Readable</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Text Alignment</label>
            <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 p-1 border border-zinc-300 dark:border-zinc-700 rounded">
              <button
                type="button"
                onClick={() => onUpdatePage({ ...page, textAlignment: 'left' })}
                className={`p-1 rounded cursor-pointer ${page.textAlignment === 'left' || !page.textAlignment ? 'bg-orange-500 text-black' : 'text-zinc-400'}`}
                title="Align Left"
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onUpdatePage({ ...page, textAlignment: 'center' })}
                className={`p-1 rounded cursor-pointer ${page.textAlignment === 'center' ? 'bg-orange-500 text-black' : 'text-zinc-400'}`}
                title="Align Center"
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onUpdatePage({ ...page, textAlignment: 'right' })}
                className={`p-1 rounded cursor-pointer ${page.textAlignment === 'right' ? 'bg-orange-500 text-black' : 'text-zinc-400'}`}
                title="Align Right"
              >
                <AlignRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onUpdatePage({ ...page, textAlignment: 'justify' })}
                className={`p-1 rounded cursor-pointer ${page.textAlignment === 'justify' ? 'bg-orange-500 text-black' : 'text-zinc-400'}`}
                title="Justify"
              >
                <AlignJustify className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Insertion Block */}
      <ImageUploaderBlock
        imageData={page.imageData}
        onChange={(data) => onUpdatePage({ ...page, imageData: data })}
      />

      {/* Student Task / Instructions Input */}
      <div>
        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
          Student Activity Instructions / Task Prompt
        </label>
        <textarea
          value={page.instructions}
          onChange={(e) => onUpdatePage({ ...page, instructions: e.target.value })}
          rows={2}
          placeholder="e.g. Read the questions below and circle the correct option or write detailed explanations..."
          className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
        />
      </div>

      {/* DEDICATED QUIZ & ASSESSMENT BUILDER (When type === 'quiz_assessment' OR quizQuestions exists) */}
      {(page.type === 'quiz_assessment' || quizQuestions.length > 0) && (
        <div className="p-4 bg-orange-500/5 dark:bg-orange-500/10 border-2 border-orange-500/30 rounded-xl space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h4 className="font-extrabold text-sm text-orange-600 dark:text-orange-400 flex items-center gap-2">
                <CheckSquare className="w-4 h-4" /> Quiz & Assessment Questions Builder ({quizQuestions.length})
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Create multiple choice, short answer, and true/false assessment items with instant correct answer keys.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleAddQuizQuestion('multiple_choice')}
                className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-black font-extrabold text-xs rounded-lg shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> + Multiple Choice
              </button>

              <button
                type="button"
                onClick={() => handleAddQuizQuestion('short_answer')}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> + Short Answer
              </button>

              <button
                type="button"
                onClick={() => handleAddQuizQuestion('true_false')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> + True / False
              </button>
            </div>
          </div>

          {/* Quiz Question Cards List */}
          <div className="space-y-3">
            {quizQuestions.length === 0 ? (
              <div className="p-6 text-center border-2 border-dashed border-orange-300 dark:border-orange-800 rounded-lg text-zinc-500 text-xs">
                No quiz questions added yet. Click one of the buttons above to add Multiple Choice or Short Answer questions.
              </div>
            ) : (
              quizQuestions.map((q, qIdx) => (
                <div key={q.id} className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-3 text-xs shadow-xs">
                  
                  {/* Question Header & Points */}
                  <div className="flex items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-orange-500 text-black font-extrabold text-[11px] flex items-center justify-center">
                        #{qIdx + 1}
                      </span>
                      <select
                        value={q.type || 'multiple_choice'}
                        onChange={(e) => handleUpdateQuizQuestion(q.id, { type: e.target.value as any })}
                        className="p-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-xs font-bold cursor-pointer"
                      >
                        <option value="multiple_choice">Multiple Choice</option>
                        <option value="short_answer">Short Answer / Essay</option>
                        <option value="true_false">True / False</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <span className="text-zinc-400 font-medium text-[11px]">Points:</span>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={q.points || 5}
                          onChange={(e) => handleUpdateQuizQuestion(q.id, { points: parseInt(e.target.value) || 1 })}
                          className="w-14 p-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded font-mono font-bold text-center text-xs"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteQuizQuestion(q.id)}
                        className="p-1 text-rose-500 hover:text-rose-700 transition-colors"
                        title="Delete Question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Question Prompt */}
                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
                      Question Prompt
                    </label>
                    <textarea
                      value={q.question}
                      onChange={(e) => handleUpdateQuizQuestion(q.id, { question: e.target.value })}
                      rows={2}
                      className="w-full p-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 rounded font-medium text-zinc-900 dark:text-zinc-100"
                      placeholder="e.g. Which ancient monument in Zimbabwe features dry stone walls?"
                    />
                  </div>

                  {/* Multiple Choice & True/False Options Editor */}
                  {(q.type === 'multiple_choice' || q.type === 'true_false' || !q.type) && (
                    <div className="space-y-2 pt-1">
                      <span className="text-[10px] font-bold uppercase text-zinc-400 block">
                        Options (Mark correct answer choice with radio button):
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, optIdx) => (
                          <div
                            key={optIdx}
                            className={`flex items-center gap-2 p-2 rounded border transition-colors ${
                              q.correctIndex === optIdx
                                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-semibold'
                                : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`correct-${q.id}`}
                              checked={q.correctIndex === optIdx}
                              onChange={() => handleUpdateQuizQuestion(q.id, { correctIndex: optIdx })}
                              className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                              title="Set as correct answer"
                            />
                            <span className="font-mono font-bold text-zinc-400 w-5">
                              {String.fromCharCode(65 + optIdx)})
                            </span>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const newOpts = [...q.options];
                                newOpts[optIdx] = e.target.value;
                                handleUpdateQuizQuestion(q.id, { options: newOpts });
                              }}
                              className="flex-1 p-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded text-xs"
                              placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Short Answer / Sample Answer */}
                  {q.type === 'short_answer' && (
                    <div className="pt-1">
                      <label className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 block mb-1">
                        Expected Sample Answer (For Answer Key)
                      </label>
                      <input
                        type="text"
                        value={q.sampleAnswer || ''}
                        onChange={(e) => handleUpdateQuizQuestion(q.id, { sampleAnswer: e.target.value })}
                        className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-emerald-600 dark:text-emerald-400 font-mono font-semibold"
                        placeholder="e.g. Great Zimbabwe / Conical Tower constructed in 11th-15th century."
                      />
                    </div>
                  )}

                  {/* Explanation for Answer Key */}
                  <div className="pt-1">
                    <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
                      Teacher Key Explanation
                    </label>
                    <input
                      type="text"
                      value={q.explanation || ''}
                      onChange={(e) => handleUpdateQuizQuestion(q.id, { explanation: e.target.value })}
                      className="w-full p-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-xs italic text-zinc-600 dark:text-zinc-400"
                      placeholder="e.g. Mulch retains soil moisture and minimizes evaporation during dry spells."
                    />
                  </div>

                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* RICH CONTENT BLOCKS BUILDER (Paragraphs, Callouts, Vocabulary, Bullet Lists) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
            <Type className="w-4 h-4 text-orange-500" /> Additional Content Blocks & Text Elements ({(page.contentBlocks || []).length})
          </span>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowContentBlockMenu(!showContentBlockMenu)}
              className="px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs rounded-lg shadow-xs flex items-center gap-1 cursor-pointer hover:bg-zinc-800"
            >
              <Plus className="w-3.5 h-3.5" /> Add Content Block
            </button>

            {showContentBlockMenu && (
              <div className="absolute right-0 mt-1 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-20 p-1 space-y-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => handleAddContentBlock('paragraph')}
                  className="w-full text-left p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg flex items-center gap-2 text-zinc-800 dark:text-zinc-200 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-500" /> Paragraph Text
                </button>

                <button
                  type="button"
                  onClick={() => handleAddContentBlock('subheading')}
                  className="w-full text-left p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg flex items-center gap-2 text-zinc-800 dark:text-zinc-200 cursor-pointer"
                >
                  <Type className="w-3.5 h-3.5 text-indigo-500" /> Section Subheading
                </button>

                <button
                  type="button"
                  onClick={() => handleAddContentBlock('callout')}
                  className="w-full text-left p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg flex items-center gap-2 text-zinc-800 dark:text-zinc-200 cursor-pointer"
                >
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> Callout / Guidance Box
                </button>

                <button
                  type="button"
                  onClick={() => handleAddContentBlock('bullet_list')}
                  className="w-full text-left p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg flex items-center gap-2 text-zinc-800 dark:text-zinc-200 cursor-pointer"
                >
                  <List className="w-3.5 h-3.5 text-emerald-500" /> Bulleted List
                </button>

                <button
                  type="button"
                  onClick={() => handleAddContentBlock('vocabulary')}
                  className="w-full text-left p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg flex items-center gap-2 text-zinc-800 dark:text-zinc-200 cursor-pointer"
                >
                  <Bookmark className="w-3.5 h-3.5 text-rose-500" /> Key Vocabulary Term
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content Blocks List */}
        {page.contentBlocks && page.contentBlocks.length > 0 && (
          <div className="space-y-3">
            {page.contentBlocks.map((block, bIdx) => (
              <div key={block.id} className="p-3.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700 pb-2">
                  <span className="font-bold text-orange-600 dark:text-orange-400 uppercase text-[10px] tracking-wider flex items-center gap-1">
                    Block #{bIdx + 1}: {block.type}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleMoveContentBlock(block.id, 'up')}
                      disabled={bIdx === 0}
                      className="p-1 text-zinc-400 hover:text-zinc-700 disabled:opacity-30"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveContentBlock(block.id, 'down')}
                      disabled={bIdx === (page.contentBlocks?.length || 0) - 1}
                      className="p-1 text-zinc-400 hover:text-zinc-700 disabled:opacity-30"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteContentBlock(block.id)}
                      className="p-1 text-rose-500 hover:text-rose-700"
                      title="Delete Block"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {block.type === 'subheading' && (
                  <input
                    type="text"
                    value={block.title || ''}
                    onChange={(e) => handleUpdateContentBlock(block.id, { title: e.target.value })}
                    placeholder="Subheading Title..."
                    className="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded font-bold text-sm text-zinc-900 dark:text-zinc-100"
                  />
                )}

                {block.type === 'callout' && (
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <select
                      value={block.style || 'info'}
                      onChange={(e) => handleUpdateContentBlock(block.id, { style: e.target.value as any })}
                      className="p-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded font-semibold text-xs cursor-pointer"
                    >
                      <option value="info">💡 Info Box</option>
                      <option value="warning">⚠️ Warning Box</option>
                      <option value="note">📌 Note Box</option>
                      <option value="key_term">🔑 Key Term Box</option>
                    </select>
                    <input
                      type="text"
                      value={block.title || ''}
                      onChange={(e) => handleUpdateContentBlock(block.id, { title: e.target.value })}
                      placeholder="Callout Header Title..."
                      className="sm:col-span-3 p-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded font-semibold text-xs"
                    />
                  </div>
                )}

                {block.type === 'vocabulary' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={block.title || ''}
                      onChange={(e) => handleUpdateContentBlock(block.id, { title: e.target.value })}
                      placeholder="Vocabulary Word (e.g. Hunhu/Ubuntu)..."
                      className="p-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded font-bold text-xs"
                    />
                    <input
                      type="text"
                      value={block.content}
                      onChange={(e) => handleUpdateContentBlock(block.id, { content: e.target.value })}
                      placeholder="Definition / Meaning..."
                      className="sm:col-span-2 p-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded text-xs"
                    />
                  </div>
                )}

                {block.type !== 'vocabulary' && (
                  <textarea
                    value={block.content}
                    onChange={(e) => handleUpdateContentBlock(block.id, { content: e.target.value })}
                    rows={2}
                    placeholder="Enter block text content..."
                    className="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-zinc-100"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Specific Activity Type Editors */}
      {page.type === 'data_sheet_table' && (
        <div className="space-y-3 pt-2">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <TableIcon className="w-4 h-4" /> Interactive Spreadsheet & Data Table Editor
          </span>
          <AcademicTable
            data={page.tableData}
            editable={true}
            onChange={(updated) => onUpdatePage({ ...page, tableData: updated })}
          />
        </div>
      )}

      {page.type === 'graph_chart' && (
        <div className="space-y-4 pt-2">
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4" /> Graph & Data Visualization Configurator
          </span>

          <AcademicChart
            data={
              page.chartData || {
                title: 'Pfumvudza Crop Yield Comparison (Bags/Hectare)',
                type: 'bar',
                xAxisLabel: 'Farming Region',
                yAxisLabel: 'Bags Yield',
                labels: ['Mashonaland', 'Manicaland', 'Masvingo', 'Matabeleland'],
                dataPoints: [45, 38, 29, 32],
                color: '#10b981',
              }
            }
            height={220}
          />

          {(() => {
            const chart: ChartData = page.chartData || {
              title: 'Pfumvudza Crop Yield Comparison (Bags/Hectare)',
              type: 'bar',
              xAxisLabel: 'Farming Region',
              yAxisLabel: 'Bags Yield',
              labels: ['Mashonaland', 'Manicaland', 'Masvingo', 'Matabeleland'],
              dataPoints: [45, 38, 29, 32],
              color: '#10b981',
            };

            const updateChart = (updatedProps: Partial<ChartData>) => {
              onUpdatePage({ ...page, chartData: { ...chart, ...updatedProps } });
            };

            return (
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Chart Title</label>
                    <input
                      type="text"
                      value={chart.title}
                      onChange={(e) => updateChart({ title: e.target.value })}
                      className="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded font-semibold text-zinc-900 dark:text-zinc-100"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Chart Type</label>
                    <select
                      value={chart.type}
                      onChange={(e) => updateChart({ type: e.target.value as any })}
                      className="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded font-medium text-zinc-900 dark:text-zinc-100 cursor-pointer"
                    >
                      <option value="bar">Bar Chart</option>
                      <option value="line">Line Graph</option>
                      <option value="pie">Pie Chart</option>
                      <option value="scatter">Scatter Plot</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Color Theme</label>
                    <input
                      type="color"
                      value={chart.color || '#10b981'}
                      onChange={(e) => updateChart({ color: e.target.value })}
                      className="w-full h-9 p-1 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">X-Axis Label</label>
                    <input
                      type="text"
                      value={chart.xAxisLabel || ''}
                      onChange={(e) => updateChart({ xAxisLabel: e.target.value })}
                      className="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Y-Axis Label</label>
                    <input
                      type="text"
                      value={chart.yAxisLabel || ''}
                      onChange={(e) => updateChart({ yAxisLabel: e.target.value })}
                      className="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-700 dark:text-zinc-300">Data Series Labels & Values</span>
                    <button
                      type="button"
                      onClick={() =>
                        updateChart({
                          labels: [...(chart.labels || []), `Item ${(chart.labels || []).length + 1}`],
                          dataPoints: [...(chart.dataPoints || []), 10],
                        })
                      }
                      className="flex items-center gap-1 text-indigo-600 font-bold hover:underline"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Data Point
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {(chart.labels || []).map((lbl, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={lbl}
                          onChange={(e) => {
                            const newLabels = [...(chart.labels || [])];
                            newLabels[idx] = e.target.value;
                            updateChart({ labels: newLabels });
                          }}
                          className="flex-1 p-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded"
                          placeholder="Category / Label"
                        />
                        <input
                          type="number"
                          value={(chart.dataPoints || [])[idx] ?? 0}
                          onChange={(e) => {
                            const newPoints = [...(chart.dataPoints || [])];
                            newPoints[idx] = parseFloat(e.target.value) || 0;
                            updateChart({ dataPoints: newPoints });
                          }}
                          className="w-24 p-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded font-mono font-bold"
                          placeholder="Value"
                        />
                        {(chart.labels || []).length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newLabels = (chart.labels || []).filter((_, i) => i !== idx);
                              const newPoints = (chart.dataPoints || []).filter((_, i) => i !== idx);
                              updateChart({ labels: newLabels, dataPoints: newPoints });
                            }}
                            className="p-1 text-rose-500 hover:text-rose-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {page.type === 'coloring_lineart' && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-4 h-4" /> Interactive Vector Line-Art & Coloring Canvas
            </span>
            <select
              value={page.coloringTheme || 'safari_animals'}
              onChange={(e) => onUpdatePage({ ...page, coloringTheme: e.target.value as any })}
              className="p-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-xs font-semibold cursor-pointer"
            >
              <option value="safari_animals">Safari Animals</option>
              <option value="solar_system">Solar System</option>
              <option value="chemistry_lab">Chemistry Lab</option>
              <option value="geometry_patterns">Cell Anatomy</option>
            </select>
          </div>

          <InteractiveColoringCanvas
            theme={page.coloringTheme}
            elements={page.coloringElements}
            colorByNumberLegend={page.colorByNumberLegend}
            onElementsChange={(updated) => onUpdatePage({ ...page, coloringElements: updated })}
            interactive={true}
          />
        </div>
      )}

      {page.type === 'math_worksheet' && page.mathProblems && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calculator className="w-4 h-4" /> LaTeX Math Problem Drills ({page.mathProblems.length})
            </span>
            <span className="text-[11px] font-mono text-zinc-500">
              KaTeX formula syntax: <code className="bg-zinc-200 dark:bg-zinc-800 px-1 rounded">\frac&#123;a&#125;&#123;b&#125;</code> <code className="bg-zinc-200 dark:bg-zinc-800 px-1 rounded">\sqrt&#123;x&#125;</code>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {page.mathProblems.map((prob, idx) => (
              <div key={prob.id} className="p-3.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg space-y-2">
                <div className="flex items-center justify-between font-bold text-zinc-500">
                  <span>Problem #{idx + 1}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-zinc-400">Answer:</span>
                    <input
                      type="text"
                      value={prob.answer}
                      onChange={(e) => {
                        const updatedProblems = page.mathProblems!.map(p => p.id === prob.id ? { ...p, answer: e.target.value } : p);
                        onUpdatePage({ ...page, mathProblems: updatedProblems });
                      }}
                      className="w-20 p-1 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded text-emerald-600 dark:text-emerald-400 font-mono font-bold text-center text-xs"
                    />
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md text-center min-h-[50px] flex items-center justify-center overflow-x-auto">
                  <MathRenderer math={prob.expression || ''} displayMode={true} />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-bold flex items-center gap-1 mb-1">
                    <Code2 className="w-3 h-3 text-orange-500" /> LaTeX Formula Code
                  </label>
                  <input
                    type="text"
                    value={prob.expression}
                    onChange={(e) => {
                      const updatedProblems = page.mathProblems!.map(p => p.id === prob.id ? { ...p, expression: e.target.value, latex: e.target.value } : p);
                      onUpdatePage({ ...page, mathProblems: updatedProblems });
                    }}
                    placeholder="e.g. \frac{3}{4} + \frac{1}{2} = \square"
                    className="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded font-mono font-semibold text-xs text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Teacher Guidance Tip */}
      <div className="pt-2">
        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Teacher / Parent Guidance Tip
        </label>
        <input
          type="text"
          value={page.teacherTip || ''}
          onChange={(e) => onUpdatePage({ ...page, teacherTip: e.target.value })}
          placeholder="e.g. Discuss the moral values of the story and encourage students to explain their calculations."
          className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-zinc-100"
        />
      </div>

    </div>
  );
};
