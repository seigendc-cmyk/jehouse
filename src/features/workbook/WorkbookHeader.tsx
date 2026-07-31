import React, { useState, useCallback, useMemo } from 'react';
import { WorkbookAcademicContext, BookProject } from '../../types';
import {
  getEducationLevels,
  getGradeOptions,
  getSubjectOptions,
  normalizeAcademicContext,
  createDefaultAcademicContext
} from './workbookAcademicContext';
import { ChevronDown, X, Menu } from 'lucide-react';

interface WorkbookHeaderProps {
  project: BookProject;
  onUpdateProject: (project: BookProject) => void;
}

export const WorkbookHeader: React.FC<WorkbookHeaderProps> = ({
  project,
  onUpdateProject
}) => {
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const context = project.academicContext ?? createDefaultAcademicContext();

  const handleLevelChange = useCallback((level: string) => {
    const updated = normalizeAcademicContext({
      ...context,
      educationLevel: level,
      gradeId: undefined,
      gradeLabel: undefined,
      subjectId: undefined,
      subjectLabel: undefined
    });
    const newProject = { ...project, academicContext: updated };
    onUpdateProject(newProject);
  }, [context, project, onUpdateProject]);

  const handleGradeChange = useCallback((gradeId: string, gradeLabel: string) => {
    const updated = normalizeAcademicContext({
      ...context,
      gradeId,
      gradeLabel
    });
    const newProject = { ...project, academicContext: updated };
    onUpdateProject(newProject);
  }, [context, project, onUpdateProject]);

  const handleSubjectChange = useCallback((subjectId: string, subjectLabel: string) => {
    const updated = normalizeAcademicContext({
      ...context,
      subjectId,
      subjectLabel
    });
    const newProject = { ...project, academicContext: updated };
    onUpdateProject(newProject);
  }, [context, project, onUpdateProject]);

  const levelOptions = getEducationLevels();
  const gradeOptions = getGradeOptions(context.educationLevel);
  const subjectOptions = getSubjectOptions(context.educationLevel);

  const gradeWarning = useMemo(() => {
    if (context.educationLevel === 'Primary' && context.gradeLabel === 'Grade 6') {
      return 'This workbook contains activities created for a previous grade or subject. Review the content before publishing.';
    }
    return undefined;
  }, [context]);

  const selectorContent = (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
      <div className="flex items-center gap-1.5 min-w-0">
        <label htmlFor="workbook-level-select" className="text-[10px] uppercase font-bold text-zinc-500 whitespace-nowrap tracking-wider hidden sm:inline">
          Level
        </label>
        <select
          id="workbook-level-select"
          value={context.educationLevel}
          onChange={(e) => handleLevelChange(e.target.value)}
          className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded px-2 py-1 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 cursor-pointer min-w-[110px]"
          aria-label="Education level"
        >
          {levelOptions.map((level) => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1.5 min-w-0">
        <label htmlFor="workbook-grade-select" className="text-[10px] uppercase font-bold text-zinc-500 whitespace-nowrap tracking-wider hidden sm:inline">
          Grade / Form
        </label>
        <select
          id="workbook-grade-select"
          value={context.gradeId ?? context.gradeLabel}
          onChange={(e) => {
            const val = e.target.value;
            const optionText = e.target.options[e.target.selectedIndex]?.text ?? val;
            handleGradeChange(val, optionText);
          }}
          className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded px-2 py-1 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 cursor-pointer min-w-[100px]"
          aria-label="Grade or form"
        >
          {gradeOptions.length > 0 ? (
            gradeOptions.map((grade) => (
              <option key={grade} value={grade}>{grade}</option>
            ))
          ) : (
            <option value="">Custom</option>
          )}
        </select>
        {gradeOptions.length === 0 && (
          <input
            type="text"
            value={context.gradeLabel}
            onChange={(e) => handleGradeChange('custom', e.target.value)}
            placeholder="Custom grade"
            className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded px-2 py-1 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 w-20"
            aria-label="Custom grade label"
          />
        )}
      </div>

      <div className="flex items-center gap-1.5 min-w-0">
        <label htmlFor="workbook-subject-select" className="text-[10px] uppercase font-bold text-zinc-500 whitespace-nowrap tracking-wider hidden sm:inline">
          Subject
        </label>
        <select
          id="workbook-subject-select"
          value={context.subjectId ?? context.subjectLabel}
          onChange={(e) => {
            const val = e.target.value;
            const optionText = e.target.options[e.target.selectedIndex]?.text ?? val;
            handleSubjectChange(val, optionText);
          }}
          className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded px-2 py-1 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 cursor-pointer min-w-[130px]"
          aria-label="Subject"
        >
          {subjectOptions.length > 0 ? (
            subjectOptions.map((subject) => (
              <option key={subject} value={subject}>{subject}</option>
            ))
          ) : (
            <option value="">Custom</option>
          )}
        </select>
        {subjectOptions.length === 0 && (
          <input
            type="text"
            value={context.subjectLabel}
            onChange={(e) => handleSubjectChange('custom', e.target.value)}
            placeholder="Custom subject"
            className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded px-2 py-1 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 w-28"
            aria-label="Custom subject label"
          />
        )}
      </div>

      {gradeWarning && (
        <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium px-2 py-1 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 rounded">
          {gradeWarning}
        </div>
      )}
    </div>
  );

  const mobileSelectorContent = (
    <div className="space-y-3 p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl">
      <h3 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
        Academic Context
      </h3>
      {selectorContent}
    </div>
  );

  return (
    <div className="w-full">
      {/* Desktop: always visible horizontal layout */}
      <div className="hidden sm:flex items-center gap-3 bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 px-4 py-2">
        {selectorContent}
      </div>

      {/* Tablet: wrapping layout */}
      <div className="hidden sm:flex sm:hidden items-center gap-2 bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 px-4 py-2 flex-wrap">
        {selectorContent}
      </div>

      {/* Mobile: compact button that opens a popover */}
      <div className="sm:hidden flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 px-3 py-2">
        <button
          type="button"
          onClick={() => setIsMobileExpanded(!isMobileExpanded)}
          className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-orange-600 transition-colors cursor-pointer"
          aria-expanded={isMobileExpanded}
          aria-controls="workbook-context-popover"
          aria-label="Edit academic context"
        >
          <Menu className="w-4 h-4" />
          <span className="truncate max-w-[180px]">
            {context.gradeLabel} · {context.subjectLabel}
          </span>
          <ChevronDown className={`w-3 h-3 transition-transform ${isMobileExpanded ? 'rotate-180' : ''}`} />
        </button>
        <button
          type="button"
          onClick={() => setIsMobileExpanded(false)}
          className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-700 cursor-pointer"
          aria-label="Close academic context editor"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {isMobileExpanded && (
        <div id="workbook-context-popover" className="sm:hidden border-b border-zinc-200 dark:border-zinc-700">
          {mobileSelectorContent}
        </div>
      )}
    </div>
  );
};