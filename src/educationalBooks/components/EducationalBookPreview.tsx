import React, { useState } from 'react';
import { EducationalBookProject } from '../types';
import { exportEducationalBookToPdfHtml, downloadOfflineShellHtml } from '../generatorUtils';
import { InteractiveColoringCanvas } from './InteractiveColoringCanvas';
import { MathRenderer } from './MathRenderer';
import { AcademicTable } from './AcademicTable';
import { AcademicChart } from './AcademicChart';
import { Printer, Download, ChevronLeft, ChevronRight, BookOpen, CheckCircle, FileSpreadsheet, Sparkles, Globe, FileCode } from 'lucide-react';

interface EducationalBookPreviewProps {
  project: EducationalBookProject;
}

export const EducationalBookPreview: React.FC<EducationalBookPreviewProps> = ({ project }) => {
  const [currentPageIdx, setCurrentPageIdx] = useState<number>(0);

  const totalPages = project.pages.length + 1; // Page 0 is cover
  const activePage = currentPageIdx === 0 ? null : project.pages[currentPageIdx - 1];

  const handlePrintExport = () => {
    const htmlContent = exportEducationalBookToPdfHtml(project);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 600);
    }
  };

  const handleDownloadOfflineShell = () => {
    downloadOfflineShellHtml(project);
  };

  const getFontClass = (font?: 'sans' | 'serif' | 'mono' | 'dyslexic') => {
    switch (font || project.fontFamily) {
      case 'serif': return 'font-serif';
      case 'mono': return 'font-mono';
      case 'dyslexic': return 'font-sans tracking-wide leading-relaxed';
      default: return 'font-sans';
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-4xl mx-auto p-4">
      
      {/* Top Toolbar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-orange-500" />
          <div>
            <h2 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">{project.title}</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{project.targetAgeGroup} • {project.pages.length} Pages</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handlePrintExport}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-extrabold text-xs rounded-lg transition-colors shadow-sm cursor-pointer hover:bg-zinc-800"
          >
            <Printer className="w-4 h-4 text-orange-500" /> Print Workbook (PDF)
          </button>

          <button
            type="button"
            onClick={handleDownloadOfflineShell}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-lg transition-colors shadow-sm cursor-pointer"
            title="Deploy as standalone interactive single-file offline HTML web application"
          >
            <FileCode className="w-4 h-4" /> Download Offline App Shell (.html)
          </button>
        </div>
      </div>

      {/* Page Navigation Indicator */}
      <div className="flex items-center gap-3 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setCurrentPageIdx(p => Math.max(0, p - 1))}
          disabled={currentPageIdx === 0}
          className="p-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 rounded-lg disabled:opacity-40 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="text-zinc-700 dark:text-zinc-300">
          {currentPageIdx === 0 ? 'Cover Page' : `Page ${currentPageIdx} of ${project.pages.length}`}
        </span>

        <button
          type="button"
          onClick={() => setCurrentPageIdx(p => Math.min(totalPages - 1, p + 1))}
          disabled={currentPageIdx === totalPages - 1}
          className="p-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 rounded-lg disabled:opacity-40 cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Printable Paper Sheet View */}
      <div className={`w-full max-w-[650px] aspect-[1/1.29] bg-white text-zinc-900 border-2 border-zinc-900 rounded-xl shadow-2xl p-8 flex flex-col justify-between relative overflow-hidden select-none ${getFontClass(activePage?.fontFamily)}`}>
        
        {currentPageIdx === 0 ? (
          /* COVER PAGE */
          <div className="h-full flex flex-col items-center justify-between text-center border-4 double border-zinc-900 p-8">
            <div className="text-xs font-black tracking-widest uppercase text-orange-600">
              {project.targetAgeGroup} • {project.subject.toUpperCase()}
            </div>

            <div className="space-y-3 my-auto">
              <h1 className="text-3xl font-extrabold font-serif tracking-tight border-b-2 border-zinc-900 pb-3">
                {project.title}
              </h1>
              <p className="text-sm font-medium italic text-zinc-600">
                {project.subtitle}
              </p>
            </div>

            <div className="w-full max-w-sm border-2 dashed border-zinc-800 p-4 rounded-lg text-xs font-semibold text-left space-y-2">
              <p>Student Name: _______________________</p>
              <p>Grade / Class: _______________________</p>
              <p>School: ____________________________</p>
            </div>

            <div className="text-[10px] text-zinc-500 font-mono mt-4">
              Publisher / Author: {project.author}
            </div>
          </div>
        ) : activePage ? (
          /* REGULAR WORKBOOK PAGE */
          <div className="h-full flex flex-col justify-between overflow-y-auto">
            <div>
              {/* Running Header & Chapter Title */}
              {(activePage.customHeader || activePage.chapterTitle || activePage.chapterNumber) && (
                <div className="flex items-center justify-between text-[11px] text-zinc-500 font-bold uppercase tracking-wider border-b border-zinc-300 pb-1 mb-2">
                  <span>
                    {activePage.chapterNumber ? `Chapter ${activePage.chapterNumber}` : ''}
                    {activePage.chapterTitle ? `: ${activePage.chapterTitle}` : ''}
                  </span>
                  <span>{activePage.customHeader || project.headerText || ''}</span>
                </div>
              )}

              {/* Title Header */}
              <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-2 mb-3">
                <h2 className="text-lg font-extrabold uppercase tracking-wide">{activePage.title}</h2>
                <div className="text-xs font-bold space-x-3">
                  <span>Name: _________</span>
                  <span>Date: _______</span>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-zinc-100 border-l-4 border-zinc-900 p-2.5 mb-3 text-xs italic font-medium">
                <strong>Task:</strong> {activePage.instructions}
              </div>

              {/* Optional Custom Image Block */}
              {activePage.imageData && (
                <div className={`my-3 flex flex-col ${activePage.imageData.alignment === 'left' ? 'items-start' : activePage.imageData.alignment === 'right' ? 'items-end' : 'items-center'}`}>
                  <img
                    src={activePage.imageData.url}
                    alt={activePage.imageData.caption || 'Image'}
                    style={{ width: `${activePage.imageData.widthPercent || 75}%` }}
                    className="max-h-56 object-contain rounded border border-zinc-300 shadow-xs"
                  />
                  {activePage.imageData.caption && (
                    <p className="text-[11px] italic text-zinc-600 mt-1">{activePage.imageData.caption}</p>
                  )}
                </div>
              )}

              {/* Formatted Content Blocks */}
              {activePage.contentBlocks && activePage.contentBlocks.length > 0 && (
                <div className="space-y-3 my-3">
                  {activePage.contentBlocks.map(block => (
                    <div key={block.id} className="text-xs">
                      {block.type === 'subheading' && (
                        <h3 className="font-extrabold text-sm text-zinc-900 border-b border-zinc-300 pb-1 mt-2 mb-1 uppercase tracking-wide">
                          {block.title || 'Section'}
                        </h3>
                      )}

                      {block.type === 'paragraph' && (
                        <p className="text-zinc-800 leading-relaxed font-normal">
                          {block.content}
                        </p>
                      )}

                      {block.type === 'callout' && (
                        <div className={`p-3 rounded-lg border text-xs my-2 ${
                          block.style === 'warning' ? 'bg-amber-50 border-amber-300 text-amber-900' :
                          block.style === 'key_term' ? 'bg-indigo-50 border-indigo-300 text-indigo-900' :
                          'bg-blue-50 border-blue-300 text-blue-900'
                        }`}>
                          {block.title && <div className="font-bold uppercase text-[11px] mb-1">{block.title}</div>}
                          <p>{block.content}</p>
                        </div>
                      )}

                      {block.type === 'vocabulary' && (
                        <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-950 font-medium my-1">
                          <strong className="text-emerald-800 uppercase font-bold mr-1.5">{block.title}:</strong>
                          {block.content}
                        </div>
                      )}

                      {block.type === 'bullet_list' && (
                        <ul className="list-disc pl-5 space-y-1 text-zinc-800 my-2">
                          {(block.items || [block.content]).map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Quiz & Assessment Questions Section */}
              {activePage.quizQuestions && activePage.quizQuestions.length > 0 && (
                <div className="my-4 space-y-3">
                  <div className="font-extrabold text-xs uppercase tracking-wider text-orange-600 border-b-2 border-orange-500 pb-1 flex items-center justify-between">
                    <span>Assessment Questions ({activePage.quizQuestions.length} Items)</span>
                    <span className="text-zinc-400 font-mono text-[10px]">
                      Total Marks: {activePage.quizQuestions.reduce((acc, q) => acc + (q.points || 5), 0)}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {activePage.quizQuestions.map((q, qIdx) => (
                      <div key={q.id} className="p-3 border-1.5 border-zinc-800 rounded-lg bg-white space-y-2 text-xs">
                        <div className="flex justify-between items-start font-bold text-zinc-900">
                          <span>Question {qIdx + 1}. {q.question}</span>
                          <span className="text-orange-600 font-mono text-[11px] shrink-0">[{q.points || 5} Marks]</span>
                        </div>

                        {(q.type === 'multiple_choice' || q.type === 'true_false' || !q.type) && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            {q.options.map((opt, optIdx) => (
                              <div key={optIdx} className="p-2 border border-zinc-300 rounded flex items-center gap-2 bg-zinc-50/60 font-medium">
                                <span className="w-5 h-5 rounded-full border border-zinc-400 text-zinc-700 font-mono font-bold text-[10px] flex items-center justify-center">
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <span>{opt}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {q.type === 'short_answer' && (
                          <div className="pt-2 text-zinc-400 font-mono text-[11px]">
                            Response: __________________________________________________________________________
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Main Page Content */}
              {activePage.type === 'data_sheet_table' && (
                <AcademicTable data={activePage.tableData} editable={false} />
              )}

              {activePage.type === 'graph_chart' && activePage.chartData && (
                <AcademicChart data={activePage.chartData} height={200} />
              )}

              {activePage.type === 'coloring_lineart' && (
                <InteractiveColoringCanvas
                  theme={activePage.coloringTheme}
                  elements={activePage.coloringElements}
                  colorByNumberLegend={activePage.colorByNumberLegend}
                  interactive={true}
                />
              )}

              {activePage.type === 'math_worksheet' && activePage.mathProblems && (
                <div className="grid grid-cols-2 gap-4 mt-3">
                  {activePage.mathProblems.map((prob, idx) => (
                    <div key={prob.id} className="border-1.5 border-zinc-900 p-3 rounded-lg text-sm bg-zinc-50/50">
                      <div className="font-bold text-xs text-zinc-500">#{idx + 1}</div>
                      <div className="font-bold text-base my-2 text-center overflow-x-auto py-1">
                        <MathRenderer math={prob.expression} displayMode={true} />
                      </div>
                      <div className="text-right text-xs text-zinc-400 border-t border-dashed border-zinc-300 pt-1">
                        Answer: ________
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activePage.type === 'word_puzzle' && activePage.wordSearchGrid && (
                <div className="flex gap-4 mt-3">
                  <table className="border-collapse font-mono font-bold text-sm">
                    <tbody>
                      {activePage.wordSearchGrid.map((row, rIdx) => (
                        <tr key={rIdx}>
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="w-6 h-6 border border-zinc-300 text-center">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="flex-1 border border-zinc-900 p-3 rounded-lg text-xs">
                    <h4 className="font-bold uppercase mb-2 text-orange-600">Word Bank:</h4>
                    <ul className="space-y-1 list-disc pl-4 font-semibold">
                      {activePage.wordList?.map(w => (
                        <li key={w.word}>{w.word}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* CAD Drafting View (ArchiCAD & FreeCAD) */}
              {activePage.type === 'cad_drafting' && activePage.cadDraftingData && (
                <div className="mt-3 space-y-3 text-xs">
                  {/* Software Header Badge */}
                  <div className="flex items-center justify-between bg-slate-900 text-slate-100 p-2.5 rounded-lg border border-slate-700">
                    <div>
                      <span className="font-black text-xs uppercase tracking-wider text-cyan-400">
                        {activePage.cadDraftingData.software}
                      </span>
                      <h4 className="font-bold text-sm">{activePage.cadDraftingData.title}</h4>
                    </div>
                    <div className="text-right text-[11px] font-mono text-slate-300">
                      <div>Scale: <strong className="text-white">{activePage.cadDraftingData.scale}</strong></div>
                      <div>Units: <strong className="text-white">{activePage.cadDraftingData.projectUnits}</strong></div>
                    </div>
                  </div>

                  {/* Blueprint Vector Diagram Canvas */}
                  <div className="border-2 border-slate-900 bg-slate-950 p-4 rounded-lg flex flex-col items-center justify-center text-slate-200 shadow-inner">
                    <svg viewBox="0 0 500 240" className="w-full h-auto max-h-56 bg-slate-900 rounded border border-slate-800">
                      {/* Grid Lines */}
                      <defs>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                        </pattern>
                      </defs>
                      <rect width="500" height="240" fill="url(#grid)" />

                      {/* Blueprint Outer Border */}
                      <rect x="10" y="10" width="480" height="220" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 2" />

                      {/* Architectural Floorplan / 3D Solid Model SVG Representation */}
                      {activePage.cadDraftingData.blueprintSvgKey === 'floorplan_residential' ? (
                        <g>
                          {/* Exterior Masonry Walls */}
                          <rect x="60" y="40" width="380" height="150" fill="none" stroke="#0284c7" strokeWidth="6" />
                          {/* Partition Wall */}
                          <line x1="240" y1="40" x2="240" y2="190" stroke="#0284c7" strokeWidth="4" />
                          {/* Living Room Label */}
                          <text x="140" y="105" fill="#38bdf8" fontSize="12" fontWeight="bold" textAnchor="middle">LIVING ROOM</text>
                          <text x="140" y="122" fill="#94a3b8" fontSize="10" textAnchor="middle">5.50m x 4.20m</text>
                          {/* Bedroom Label */}
                          <text x="340" y="105" fill="#38bdf8" fontSize="12" fontWeight="bold" textAnchor="middle">BEDROOM 1</text>
                          <text x="340" y="122" fill="#94a3b8" fontSize="10" textAnchor="middle">4.20m x 4.20m</text>
                          {/* Door Arc */}
                          <path d="M 240 130 A 30 30 0 0 1 270 160" fill="none" stroke="#10b981" strokeWidth="2" />
                          <line x1="240" y1="130" x2="240" y2="160" stroke="#10b981" strokeWidth="2" />
                          {/* Window Symbols */}
                          <rect x="110" y="37" width="60" height="6" fill="#0284c7" />
                          <rect x="310" y="37" width="60" height="6" fill="#0284c7" />
                          {/* Dimension Lines */}
                          <line x1="60" y1="205" x2="440" y2="205" stroke="#f59e0b" strokeWidth="1" />
                          <line x1="60" y1="200" x2="60" y2="210" stroke="#f59e0b" strokeWidth="1.5" />
                          <line x1="440" y1="200" x2="440" y2="210" stroke="#f59e0b" strokeWidth="1.5" />
                          <text x="250" y="218" fill="#f59e0b" fontSize="10" fontWeight="bold" textAnchor="middle">9700 mm [OVERALL LENGTH]</text>
                        </g>
                      ) : (
                        <g>
                          {/* Orthographic / FreeCAD Part Design View */}
                          {/* Front View */}
                          <rect x="50" y="50" width="120" height="80" fill="#0284c7" fillOpacity="0.2" stroke="#38bdf8" strokeWidth="2" />
                          <circle cx="110" cy="90" r="20" fill="none" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3 3" />
                          <text x="110" y="150" fill="#cbd5e1" fontSize="11" fontWeight="bold" textAnchor="middle">FRONT VIEW</text>

                          {/* Top View */}
                          <rect x="200" y="50" width="120" height="80" fill="#0284c7" fillOpacity="0.2" stroke="#38bdf8" strokeWidth="2" />
                          <circle cx="260" cy="90" r="20" fill="none" stroke="#38bdf8" strokeWidth="2" />
                          <text x="260" y="150" fill="#cbd5e1" fontSize="11" fontWeight="bold" textAnchor="middle">TOP VIEW</text>

                          {/* Side View */}
                          <path d="M 360 50 L 440 50 L 440 130 L 360 130 Z" fill="#0284c7" fillOpacity="0.2" stroke="#38bdf8" strokeWidth="2" />
                          <text x="400" y="150" fill="#cbd5e1" fontSize="11" fontWeight="bold" textAnchor="middle">RIGHT SIDE VIEW</text>
                        </g>
                      )}

                      {/* Blueprint Title Block */}
                      <rect x="290" y="180" width="195" height="45" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
                      <text x="298" y="195" fill="#38bdf8" fontSize="9" fontWeight="bold">DWG: {activePage.cadDraftingData.software} BIM BLUEPRINT</text>
                      <text x="298" y="208" fill="#94a3b8" fontSize="8">APPROVED FOR TECHNICAL TRAINING</text>
                      <text x="298" y="219" fill="#f59e0b" fontSize="8" fontWeight="bold">SCALE {activePage.cadDraftingData.scale}</text>
                    </svg>
                  </div>

                  {/* Layers Table */}
                  {activePage.cadDraftingData.layerSpecifications && (
                    <div className="border border-zinc-300 dark:border-zinc-700 rounded-lg overflow-hidden">
                      <div className="bg-zinc-100 dark:bg-zinc-800 p-2 font-bold uppercase text-[11px] text-zinc-700 dark:text-zinc-300">
                        CAD Layer Specifications & Line Weight Schema
                      </div>
                      <table className="w-full text-left text-[11px] border-collapse">
                        <thead>
                          <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-700">
                            <th className="p-1.5 font-bold">Layer Name</th>
                            <th className="p-1.5 font-bold">Line Weight</th>
                            <th className="p-1.5 font-bold">Color</th>
                            <th className="p-1.5 font-bold">Function / Element</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activePage.cadDraftingData.layerSpecifications.map((l, lIdx) => (
                            <tr key={lIdx} className="border-b border-zinc-200 dark:border-zinc-800">
                              <td className="p-1.5 font-mono font-bold">{l.layerName}</td>
                              <td className="p-1.5">{l.lineWeight}</td>
                              <td className="p-1.5 flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: l.colorHex }} />
                                <span className="font-mono text-[10px]">{l.colorHex}</span>
                              </td>
                              <td className="p-1.5 text-zinc-600 dark:text-zinc-400">{l.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Exercise Tasks */}
                  <div className="space-y-2">
                    <h4 className="font-bold uppercase text-xs text-zinc-900 dark:text-zinc-100">
                      CAD Drafting Exercise Tasks:
                    </h4>
                    {activePage.cadDraftingData.exerciseTasks.map((task) => (
                      <div key={task.taskNumber} className="border border-zinc-300 dark:border-zinc-700 p-3 rounded-lg bg-zinc-50/50 dark:bg-zinc-800/30">
                        <div className="flex justify-between font-bold text-xs mb-1">
                          <span>Task #{task.taskNumber}:</span>
                          <span className="text-emerald-600 dark:text-emerald-400">[{task.maxPoints} Points]</span>
                        </div>
                        <p className="text-xs mb-2 text-zinc-800 dark:text-zinc-200 font-medium">{task.instruction}</p>
                        <div className="text-right text-xs text-zinc-400 border-t border-dashed border-zinc-300 dark:border-zinc-700 pt-1.5">
                          Student Response / Calculation: _____________________________________________
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3D Printing Dynamics View */}
              {activePage.type === 'three_d_printing' && activePage.threeDPrintingData && (
                <div className="mt-3 space-y-3 text-xs">
                  {/* Tech Banner */}
                  <div className="flex flex-wrap items-center justify-between bg-zinc-900 text-white p-3 rounded-lg border border-zinc-700 gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-500 text-black font-extrabold text-[10px] uppercase">
                        {activePage.threeDPrintingData.printerTechnology}
                      </span>
                      <span className="font-bold text-sm">
                        Filament: {activePage.threeDPrintingData.filamentType}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-zinc-300">
                      Topic: <strong className="text-emerald-400 uppercase">{activePage.threeDPrintingData.topic.replace(/_/g, ' ')}</strong>
                    </div>
                  </div>

                  {/* Slicer Settings Matrix */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div className="p-2 border border-zinc-300 dark:border-zinc-700 rounded bg-zinc-50 dark:bg-zinc-800">
                      <div className="text-zinc-500 font-bold uppercase text-[9px]">Layer Height</div>
                      <div className="font-mono font-bold text-sm text-zinc-900 dark:text-zinc-100">{activePage.threeDPrintingData.slicerSettings.layerHeightMm} mm</div>
                    </div>
                    <div className="p-2 border border-zinc-300 dark:border-zinc-700 rounded bg-zinc-50 dark:bg-zinc-800">
                      <div className="text-zinc-500 font-bold uppercase text-[9px]">Hotend / Bed Temp</div>
                      <div className="font-mono font-bold text-sm text-zinc-900 dark:text-zinc-100">
                        {activePage.threeDPrintingData.slicerSettings.nozzleTempC}°C / {activePage.threeDPrintingData.slicerSettings.bedTempC}°C
                      </div>
                    </div>
                    <div className="p-2 border border-zinc-300 dark:border-zinc-700 rounded bg-zinc-50 dark:bg-zinc-800">
                      <div className="text-zinc-500 font-bold uppercase text-[9px]">Print Speed</div>
                      <div className="font-mono font-bold text-sm text-zinc-900 dark:text-zinc-100">{activePage.threeDPrintingData.slicerSettings.printSpeedMmS} mm/s</div>
                    </div>
                    <div className="p-2 border border-zinc-300 dark:border-zinc-700 rounded bg-zinc-50 dark:bg-zinc-800">
                      <div className="text-zinc-500 font-bold uppercase text-[9px]">Infill Density</div>
                      <div className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                        {activePage.threeDPrintingData.slicerSettings.infillDensityPercent}% ({activePage.threeDPrintingData.slicerSettings.infillPattern})
                      </div>
                    </div>
                  </div>

                  {/* Vector Graphic Diagram of 3D Printer Extruder & Layer Physics */}
                  <div className="border-2 border-zinc-900 bg-zinc-950 p-4 rounded-lg flex flex-col items-center justify-center shadow-inner">
                    <svg viewBox="0 0 480 180" className="w-full h-auto max-h-48 bg-zinc-900 rounded border border-zinc-800">
                      {/* Heated Build Plate */}
                      <rect x="40" y="140" width="400" height="15" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
                      <text x="240" y="152" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle">HEATED PRINT BED ({activePage.threeDPrintingData.slicerSettings.bedTempC}°C)</text>

                      {/* Printed Layers */}
                      <rect x="120" y="128" width="240" height="12" fill="#10b981" fillOpacity="0.6" stroke="#059669" strokeWidth="1" />
                      <rect x="120" y="116" width="240" height="12" fill="#10b981" fillOpacity="0.8" stroke="#059669" strokeWidth="1" />
                      <rect x="120" y="104" width="180" height="12" fill="#10b981" stroke="#059669" strokeWidth="1" />

                      {/* Brass Hotend Nozzle */}
                      <polygon points="270,40 330,40 310,92 290,92" fill="#d97706" stroke="#b45309" strokeWidth="1.5" />
                      <rect x="290" y="92" width="20" height="12" fill="#f59e0b" stroke="#b45309" />
                      <text x="300" y="32" fill="#f59e0b" fontSize="10" fontWeight="bold" textAnchor="middle">0.4mm BRASS NOZZLE ({activePage.threeDPrintingData.slicerSettings.nozzleTempC}°C)</text>

                      {/* Molten Extrusion Thread */}
                      <rect x="296" y="104" width="8" height="12" fill="#34d399" />

                      {/* Extrusion Arrow */}
                      <line x1="300" y1="50" x2="300" y2="75" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrow)" />
                      <text x="360" y="70" fill="#38bdf8" fontSize="9" fontWeight="bold">Layer Height: {activePage.threeDPrintingData.slicerSettings.layerHeightMm}mm</text>
                    </svg>
                  </div>

                  {/* G-Code Syntax Box */}
                  {activePage.threeDPrintingData.gcodeSnippet && (
                    <div className="border border-zinc-300 dark:border-zinc-700 rounded-lg overflow-hidden bg-zinc-950 text-zinc-100 p-3 font-mono text-[11px]">
                      <div className="text-xs font-bold text-emerald-400 mb-1 flex items-center justify-between">
                        <span>G-CODE STEPPER MOTOR COMMANDS</span>
                        <span className="text-[10px] text-zinc-400">Additive Machine Control</span>
                      </div>
                      <div className="space-y-1">
                        {activePage.threeDPrintingData.gcodeSnippet.map((gc) => (
                          <div key={gc.lineNum} className="flex gap-3 border-b border-zinc-800/80 pb-1">
                            <span className="text-zinc-500 w-6">N{gc.lineNum}</span>
                            <span className="text-cyan-300 font-bold w-36">{gc.code}</span>
                            <span className="text-zinc-400 font-sans italic text-[10px]">{gc.explanation}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Exercise Questions */}
                  <div className="space-y-2">
                    <h4 className="font-bold uppercase text-xs text-zinc-900 dark:text-zinc-100">
                      Additive Manufacturing Questions:
                    </h4>
                    {activePage.threeDPrintingData.exerciseQuestions.map((q) => (
                      <div key={q.id} className="border border-zinc-300 dark:border-zinc-700 p-3 rounded-lg bg-zinc-50/50 dark:bg-zinc-800/30">
                        <div className="flex justify-between font-bold text-xs mb-1">
                          <span>Question #{q.questionNum}:</span>
                          <span className="text-emerald-600 dark:text-emerald-400">[{q.points} Points]</span>
                        </div>
                        <p className="text-xs mb-2 text-zinc-800 dark:text-zinc-200 font-medium">{q.question}</p>
                        <div className="text-right text-xs text-zinc-400 border-t border-dashed border-zinc-300 dark:border-zinc-700 pt-1.5">
                          Student Solution: _____________________________________________
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Teacher Tip */}
              {activePage.teacherTip && (
                <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-900 italic">
                  💡 <strong>Teacher Note:</strong> {activePage.teacherTip}
                </div>
              )}
            </div>

            {/* Footer & Page Numbering */}
            <div className="border-t border-zinc-300 pt-2 flex justify-between text-[10px] text-zinc-500 font-mono mt-4">
              <span>{project.title}</span>
              <span>
                {activePage.chapterNumber ? `Ch ${activePage.chapterNumber} • ` : ''}Page {activePage.pageNumber} of {project.pages.length}
              </span>
            </div>
          </div>
        ) : null}

      </div>
    </div>
  );
};

