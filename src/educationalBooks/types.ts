export type GradeLevel = 
  | 'primary' 
  | 'middle' 
  | 'high' 
  | 'zimsec_primary'   // Grade 1 to 7 (ZIMSEC)
  | 'zimsec_secondary' // Form 1 to 4 O-Level (ZIMSEC)
  | 'zimsec_a_level';  // Form 5 to 6 A-Level (ZIMSEC)

export type EducationalSubject = string;

export type PageType = 
  | 'coloring_lineart' 
  | 'math_worksheet' 
  | 'word_puzzle' 
  | 'fill_in_blanks' 
  | 'diagram_labeling' 
  | 'quiz_assessment' 
  | 'folktale_story'           // Storytelling narrative with moral lessons & comprehension
  | 'community_project'        // Practical field assignment aligned with ZIMSEC schema
  | 'language_translation'     // Shona/Ndebele proverbs (Tsumo/Izaga), riddles & translation
  | 'data_sheet_table'         // Data tables, sheets, scientific observations & financial logs
  | 'graph_chart'              // Data visualization graphs (bar, line, pie, scatter)
  | 'past_exam_paper'          // ZIMSEC Official Format Past Examination Paper
  | 'revision_test'            // Timed Revision Test & Practice Assessment Paper
  | 'cad_drafting'               // ArchiCAD & FreeCAD 2D/3D Architectural & Mechanical Drafting
  | 'three_d_printing'           // 3D Printing Dynamics, Slicing Parameters & G-Code Mechanics
  | 'answer_key';

export interface ColoringElement {
  id: string;
  type: 'path' | 'circle' | 'rect' | 'text';
  d?: string;
  cx?: number;
  cy?: number;
  r?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fillColor?: string; // default 'white' or '#ffffff' for coloring
  strokeColor?: string; // default 'black'
  strokeWidth?: number;
  label?: string;
  numberTag?: number; // for color-by-number
}

export interface MathProblem {
  id: string;
  question: string;
  expression: string;
  latex?: string;
  answer: string;
  visualItemsCount?: number;
  visualIcon?: string; // e.g. 'apple', 'star', 'circle'
}

export interface WordPuzzleItem {
  word: string;
  clue: string;
}

export interface DiagramLabelItem {
  id: string;
  label: string;
  xPercent: number; // percentage on SVG
  yPercent: number;
  description?: string;
}

export interface FolktaleData {
  title: string;
  cultureOrigin: string; // e.g., "Shona Folk Legend / Ndebele Inganekwane"
  storyText: string;
  moralLesson: string;
  proverbs?: { proverb: string; meaning: string; language: 'Shona' | 'Ndebele' | 'English' }[];
  comprehensionQuestions: { id: string; question: string; sampleAnswer: string }[];
  illustrationTheme?: 'tsuro_na_gudo' | 'kamba_tortoise' | 'great_zimbabwe' | 'pfumvudza_farm';
}

export interface CommunityProjectData {
  projectName: string;
  zimsecSyllabusCode: string; // e.g., "ZIMSEC Heritage Studies 4006 / Agriculture Grade 6"
  communityTopic: 'pfumvudza_farming' | 'heritage_monuments' | 'indigenous_herbs' | 'clean_water_sanitation' | 'ubuntu_elderly_care';
  objectives: string[];
  requiredMaterials: string[];
  fieldSteps: string[];
  communityOutcome: string;
  assessmentRubric: { criterion: string; maxPoints: number }[];
}

export interface IndigenousLanguageData {
  language: 'Shona' | 'Ndebele' | 'English';
  topicType: 'tsumo_proverbs' | 'zvirahwe_riddles' | 'nzwisiso_comprehension' | 'madimikira_idioms';
  passageText?: string;
  exercises: {
    prompt: string;
    answer: string;
    options?: string[];
  }[];
}

export interface TableData {
  title?: string;
  headers: string[];
  rows: string[][];
  caption?: string;
}

export interface ChartDataItem {
  label: string;
  value: number;
  color?: string;
}

export interface ChartData {
  title: string;
  type: 'bar' | 'line' | 'pie' | 'scatter';
  xAxisLabel?: string;
  yAxisLabel?: string;
  labels?: string[];
  dataPoints?: number[];
  color?: string;
  items?: ChartDataItem[];
}

export interface PastExamQuestion {
  id: string;
  questionNumber: string; // e.g. "1(a)", "2", "3(b)"
  questionText: string;
  marks: number;
  type?: 'multiple_choice' | 'short_answer' | 'essay' | 'calculation';
  options?: string[]; // for multiple choice
  correctAnswer?: string;
  sampleAnswer?: string;
  markingGuide?: string;
}

export interface PastExamPaperSection {
  sectionName: string; // e.g. "SECTION A: MULTIPLE CHOICE (40 MARKS)"
  instructions?: string;
  questions: PastExamQuestion[];
}

export interface PastExamPaperData {
  examSession: string; // e.g. "ZIMSEC NOVEMBER 2025 EXAMINATION"
  subjectCode: string; // e.g. "COMBINED SCIENCE 5006/2" or "MATHEMATICS 4004/1"
  paperNumber: number; // e.g. 1 or 2
  timeAllowed: string; // e.g. "2 Hours 30 Minutes"
  totalMarks: number; // e.g. 100
  instructionsToCandidates: string[];
  sections: PastExamPaperSection[];
}

export interface RevisionTestQuestion {
  id: string;
  questionNum: number;
  question: string;
  maxPoints: number;
  answerSpaceLines?: number;
  sampleAnswer: string;
}

export interface RevisionTestData {
  testTitle: string;
  syllabusTopic: string;
  timeLimitMinutes: number;
  totalPoints: number;
  instructions: string;
  questions: RevisionTestQuestion[];
}

export interface CadDraftingTask {
  taskNumber: number;
  instruction: string;
  maxPoints: number;
  sampleSolution?: string;
}

export interface CadDraftingData {
  software: 'ArchiCAD' | 'FreeCAD' | 'Generic CAD';
  draftingType: 'architectural_floorplan' | 'orthographic_projection' | 'parametric_3d_component' | 'bim_wall_section';
  title: string;
  scale: string; // e.g., "1:50", "1:100", "1:1 (mm)"
  projectUnits: 'mm' | 'm' | 'cm';
  blueprintSvgKey: 'floorplan_residential' | 'orthographic_cube_bracket' | 'archicad_wall_detail' | 'freecad_part_design';
  dimensions: { label: string; value: string }[];
  exerciseTasks: CadDraftingTask[];
  layerSpecifications?: { layerName: string; lineWeight: string; colorHex: string; description: string }[];
}

export interface ThreeDPrintingData {
  printerTechnology: 'FDM' | 'SLA' | 'SLS';
  topic: 'slicing_parameters' | 'filament_dynamics' | 'gcode_syntax' | 'infill_and_supports' | 'print_troubleshooting';
  filamentType: 'PLA' | 'PETG' | 'ABS' | 'TPU' | 'Photopolymer Resin';
  slicerSettings: {
    layerHeightMm: number;
    nozzleTempC: number;
    bedTempC: number;
    printSpeedMmS: number;
    infillDensityPercent: number;
    infillPattern: 'Gyroid' | 'Grid' | 'Honeycomb' | 'Triangles';
    supportOverhangAngleDeg: number;
    retractionDistanceMm: number;
  };
  gcodeSnippet?: { lineNum: number; code: string; explanation: string }[];
  troubleshootingCases?: { faultName: string; symptom: string; cause: string; solution: string }[];
  exerciseQuestions: { id: string; questionNum: number; question: string; points: number; sampleAnswer: string }[];
}

export interface PageImageData {
  url: string; // URL or base64 data-URL
  caption?: string;
  altText?: string;
  alignment?: 'center' | 'left' | 'right';
  widthPercent?: number; // 25, 50, 75, 100
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  type?: 'multiple_choice' | 'short_answer' | 'true_false' | 'fill_blank';
  explanation?: string;
  points?: number;
  sampleAnswer?: string;
}

export interface PageContentBlock {
  id: string;
  type: 'paragraph' | 'subheading' | 'callout' | 'vocabulary' | 'bullet_list' | 'quiz_question';
  title?: string;
  content: string;
  style?: 'info' | 'warning' | 'note' | 'key_term';
  items?: string[];
  quizData?: QuizQuestion;
}

export interface EducationalPage {
  id: string;
  pageNumber: number;
  type: PageType;
  title: string;
  instructions: string;
  difficulty: 'easy' | 'medium' | 'hard';
  zimsecSyllabusRef?: string;
  
  // Chapter & Header Formatting
  chapterNumber?: number;
  chapterTitle?: string;
  customHeader?: string;
  fontFamily?: 'sans' | 'serif' | 'mono' | 'dyslexic';
  fontSize?: 'sm' | 'base' | 'lg';
  textAlignment?: 'left' | 'center' | 'right' | 'justify';

  // Rich Content Blocks
  contentBlocks?: PageContentBlock[];
  
  // Image Block
  imageData?: PageImageData;

  // Table / Sheet Data
  tableData?: TableData;

  // Chart / Graph Data
  chartData?: ChartData;

  // Coloring Page Data
  coloringTheme?: 'solar_system' | 'safari_animals' | 'geometry_patterns' | 'cell_structure' | 'world_landmarks' | 'chemistry_lab' | 'great_zimbabwe' | 'tsuro_na_gudo' | 'custom';
  coloringElements?: ColoringElement[];
  colorByNumberLegend?: { number: number; colorName: string; hex: string }[];
  
  // Math Worksheet Data
  mathCategory?: 'addition' | 'multiplication' | 'fractions' | 'geometry' | 'algebra';
  mathProblems?: MathProblem[];
  
  // Word Search / Crossword Data
  wordList?: WordPuzzleItem[];
  wordSearchGrid?: string[][]; // 10x10 or 12x12
  
  // Fill in blanks
  passageText?: string; // Text with {blank1}, {blank2}
  wordBank?: string[];
  blankAnswers?: Record<string, string>;
  
  // Diagram Labeling
  diagramSvgKey?: 'human_cell' | 'water_cycle' | 'solar_system_map' | 'volcano_structure' | 'atom_structure' | 'great_zimbabwe_structure' | 'soil_profile_pfumvudza';
  diagramLabels?: DiagramLabelItem[];
  
  // Quiz
  quizQuestions?: QuizQuestion[];

  // Folktale Storytelling
  folktaleData?: FolktaleData;

  // Community Project
  communityProjectData?: CommunityProjectData;

  // Indigenous Language Exercise
  languageData?: IndigenousLanguageData;

  // Past Exam Paper Data
  pastExamData?: PastExamPaperData;

  // Revision Test Data
  revisionTestData?: RevisionTestData;

  // CAD Drafting Data (ArchiCAD / FreeCAD)
  cadDraftingData?: CadDraftingData;

  // 3D Printing Dynamics Data
  threeDPrintingData?: ThreeDPrintingData;
  
  // Custom teacher notes
  teacherTip?: string;
}

export interface EducationalBookProject {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  gradeLevel: GradeLevel;
  subject: EducationalSubject;
  targetAgeGroup: string; // e.g. "Ages 5-8 (Grades K-2)"
  coverColor: string;
  includeAnswerKey: boolean;
  zimsecAligned?: boolean;
  fontFamily?: 'sans' | 'serif' | 'mono' | 'dyslexic';
  headerText?: string;
  footerText?: string;
  showPageNumbers?: boolean;
  pageNumberStyle?: 'page_x_of_y' | 'simple' | 'chapter_relative';
  pages: EducationalPage[];
  createdDate: string;
}
