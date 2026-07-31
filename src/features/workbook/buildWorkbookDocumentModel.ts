import { BookProject, ContentBlock, EducationalPage } from '../../types';
import { WorkbookAcademicContext } from '../../types';
import { createDefaultAcademicContext } from './workbookAcademicContext';

export interface WorkbookDocumentMetadata {
  title: string;
  educationLevel: string;
  gradeLabel: string;
  subjectLabel: string;
  author: string;
  chapterCount: number;
  pageCount: number;
  activityTypes: string[];
  hasAnswerKey: boolean;
}

export interface WorkbookDocumentPage {
  id: string;
  pageNumber: number;
  chapterId?: string;
  title: string;
  activityType: string;
  academicContextSnapshot: {
    educationLevel: string;
    gradeLabel: string;
    subjectLabel: string;
  };
  runningHeader?: string;
  studentInstructions?: string;
  contentBlocks: WorkbookContentBlock[];
  answerKey?: ContentBlock;
  imageData?: { url: string; caption?: string; alignment?: string; widthPercent?: number };
  tableData?: { title?: string; headers: string[]; rows: string[][]; caption?: string };
  chartData?: { title: string; type: string; xAxisLabel?: string; yAxisLabel?: string; items?: { label: string; value: number; color?: string }[] };
  coloringTheme?: string;
  coloringElements?: unknown[];
  colorByNumberLegend?: unknown[];
  mathProblems?: unknown[];
  wordList?: unknown[];
  wordSearchGrid?: string[][];
  quizQuestions?: unknown[];
  folktaleData?: unknown;
  communityProjectData?: unknown;
  languageData?: unknown;
  pastExamData?: unknown;
  revisionTestData?: unknown;
  cadDraftingData?: unknown;
  threeDPrintingData?: unknown;
  teacherTip?: string;
}

export interface WorkbookContentBlock {
  id: string;
  type: string;
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  align?: string;
  indentLevel?: number;
  fontSize?: number;
  fontFamily?: string;
  lineHeight?: number;
  textColour?: string;
  imageUrl?: string;
  imageCaption?: string;
  imageWrap?: string;
  imageWidth?: string;
  imageOpacity?: number;
  imageFrameStyle?: string;
  tableData?: { title?: string; headers: string[]; rows: string[][]; caption?: string };
  ledgerData?: unknown[];
  journalEntryData?: unknown;
  trialBalanceData?: unknown;
  financialStatementData?: unknown;
  quizQuestions?: unknown[];
  spreadsheetData?: unknown;
  graphData?: unknown;
  captionData?: unknown;
  mathData?: unknown;
  solutionStep?: boolean;
  workedExample?: boolean;
  semanticRole?: string;
  problemNumber?: string;
  stepNumber?: string;
  codeLanguage?: string;
  codeSnippet?: string;
  footnoteRef?: string;
  footnoteText?: string;
}

export interface WorkbookDocumentActivity {
  id: string;
  type: string;
  title: string;
  instructions: string;
  contentBlocks: WorkbookContentBlock[];
  answerKey?: ContentBlock;
  academicContextSnapshot: {
    educationLevel: string;
    gradeLabel: string;
    subjectLabel: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface WorkbookDocumentModel {
  metadata: WorkbookDocumentMetadata;
  pages: WorkbookDocumentPage[];
  activities: WorkbookDocumentActivity[];
  academicContext: WorkbookAcademicContext;
}

function normalizeContentBlock(block: ContentBlock): WorkbookContentBlock {
  return {
    id: block.id,
    type: block.type,
    text: block.text ?? '',
    bold: block.bold,
    italic: block.italic,
    underline: block.underline,
    align: block.align,
    indentLevel: block.indentLevel,
    fontSize: block.fontSize,
    fontFamily: block.fontFamily,
    lineHeight: block.lineHeight,
    textColour: block.textColour,
    imageUrl: block.imageUrl,
    imageCaption: block.imageCaption,
    imageWrap: block.imageWrap,
    imageWidth: block.imageWidth,
    imageOpacity: block.imageOpacity,
    imageFrameStyle: block.imageFrameStyle,
    tableData: block.tableData,
    ledgerData: block.ledgerData,
    journalEntryData: block.journalEntryData,
    trialBalanceData: block.trialBalanceData,
    financialStatementData: block.financialStatementData,
    quizQuestions: block.quizQuestions,
    spreadsheetData: block.spreadsheetData,
    graphData: block.graphData,
    captionData: block.captionData,
    mathData: block.mathData,
    solutionStep: block.type === 'solution-step',
    workedExample: block.type === 'worked-example',
    semanticRole: block.semanticRole,
    problemNumber: block.problemNumber,
    stepNumber: block.stepNumber,
    codeLanguage: block.codeLanguage,
    codeSnippet: block.codeSnippet,
    footnoteRef: block.footnoteRef,
    footnoteText: block.footnoteText
  };
}

function extractActivityFromPage(page: EducationalPage): WorkbookDocumentActivity | null {
  const hasContent = page.folktaleData || page.communityProjectData || page.languageData
    || page.pastExamData || page.revisionTestData || page.cadDraftingData || page.threeDPrintingData
    || page.mathProblems || page.wordList || page.coloringElements
    || page.contentBlocks || page.quizQuestions;

  if (!hasContent) return null;

  return {
    id: page.id,
    type: page.type,
    title: page.title,
    instructions: page.instructions ?? '',
    contentBlocks: (page.contentBlocks ?? []).map(normalizeContentBlock),
    answerKey: undefined,
    academicContextSnapshot: {
      educationLevel: '',
      gradeLabel: '',
      subjectLabel: ''
    },
    createdAt: '',
    updatedAt: ''
  };
}

export function buildWorkbookDocumentModel(project: BookProject): WorkbookDocumentModel {
  const academicContext = project.academicContext ?? createDefaultAcademicContext();
  const normalizedContext = {
    educationLevel: academicContext.educationLevel,
    gradeId: academicContext.gradeId,
    gradeLabel: academicContext.gradeLabel,
    subjectId: academicContext.subjectId,
    subjectLabel: academicContext.subjectLabel,
    customLevelLabel: academicContext.customLevelLabel,
    customGradeLabel: academicContext.customGradeLabel,
    customSubjectLabel: academicContext.customSubjectLabel
  };

  const pages: WorkbookDocumentPage[] = project.chapters.flatMap((chapter) =>
    chapter.blocks.map((block) => ({
      id: block.id,
      pageNumber: chapter.number,
      chapterId: chapter.id,
      title: block.text || chapter.title,
      activityType: 'block',
      academicContextSnapshot: {
        educationLevel: normalizedContext.educationLevel,
        gradeLabel: normalizedContext.gradeLabel,
        subjectLabel: normalizedContext.subjectLabel
      },
      runningHeader: chapter.title,
      studentInstructions: undefined,
      contentBlocks: [normalizeContentBlock(block)],
      answerKey: undefined
    }))
  );

  const activities: WorkbookDocumentActivity[] = [];

  const metadata: WorkbookDocumentMetadata = {
    title: project.title,
    educationLevel: normalizedContext.educationLevel,
    gradeLabel: normalizedContext.gradeLabel,
    subjectLabel: normalizedContext.subjectLabel,
    author: project.author,
    chapterCount: project.chapters.length,
    pageCount: pages.length,
    activityTypes: [...new Set(pages.map((p) => p.activityType))],
    hasAnswerKey: project.exportSettings.includeQuizzes ?? false
  };

  return {
    metadata,
    pages,
    activities,
    academicContext: normalizedContext
  };
}