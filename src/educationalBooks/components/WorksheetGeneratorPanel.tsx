import React, { useState } from 'react';
import { EducationalPage, GradeLevel, PageType } from '../types';
import {
  generateMathProblems,
  generateWordSearchGrid,
  getColoringThemeElements,
  generateFolktaleData,
  generateCommunityProjectData,
  generateIndigenousLanguageData,
  generatePastExamPaper,
  generateRevisionTest,
  generateCadDraftingData,
  generateThreeDPrintingData
} from '../generatorUtils';
import {
  getAllCategories,
  saveCustomCategory,
  CategoryItem
} from '../categories';
import {
  Plus,
  Wand2,
  Calculator,
  Grid,
  Palette,
  HelpCircle,
  BookOpen,
  Users,
  Languages,
  FileText,
  CheckSquare,
  PlusCircle,
  FolderPlus,
  Tag,
  Compass,
  Printer
} from 'lucide-react';

interface WorksheetGeneratorPanelProps {
  gradeLevel: GradeLevel;
  academicContext?: {
    educationLevel: string;
    gradeLabel: string;
    subjectLabel: string;
  };
  onAddGeneratedPage: (page: EducationalPage) => void;
}

export const WorksheetGeneratorPanel: React.FC<WorksheetGeneratorPanelProps> = ({
  gradeLevel,
  academicContext,
  onAddGeneratedPage
}) => {
  const [categories, setCategories] = useState<CategoryItem[]>(() => getAllCategories());
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('past_exam_papers');
  const [selectedType, setSelectedType] = useState<PageType>('past_exam_paper');
  const [pageTitle, setPageTitle] = useState('New Academic Practice Page');
  
  // Custom Category State
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Past Exam settings
  const [examSubject, setExamSubject] = useState('Combined Science');
  const [paperNumber, setPaperNumber] = useState<number>(1);

  // Revision Test settings
  const [revisionTopic, setRevisionTopic] = useState('Conservation Tillage & Crop Production');
  
  // Math settings
  const [mathCategory, setMathCategory] = useState<'addition' | 'multiplication' | 'fractions' | 'geometry' | 'algebra'>('addition');
  const [mathCount, setMathCount] = useState<number>(8);
  
  // Word Search settings
  const [customWordsInput, setCustomWordsInput] = useState('HERITAGE, UBUNTU, PFUMVUDZA, ZIMBABWE, CULTURAL');
  
  // Coloring settings
  const [coloringTheme, setColoringTheme] = useState<'solar_system' | 'safari_animals' | 'geometry_patterns' | 'cell_structure' | 'great_zimbabwe' | 'tsuro_na_gudo'>('great_zimbabwe');

  // Folktale settings
  const [folktaleTheme, setFolktaleTheme] = useState<'tsuro_na_gudo' | 'kamba_tortoise' | 'great_zimbabwe'>('tsuro_na_gudo');

  // Community Project settings
  const [projectTopic, setProjectTopic] = useState<'pfumvudza_farming' | 'heritage_monuments' | 'clean_water_sanitation'>('pfumvudza_farming');

  // Language settings
  const [languageChoice, setLanguageChoice] = useState<'Shona' | 'Ndebele' | 'English'>('Shona');
  const [languageTopic, setLanguageTopic] = useState<'tsumo_proverbs' | 'zvirahwe_riddles' | 'nzwisiso_comprehension'>('tsumo_proverbs');

  // ArchiCAD & FreeCAD CAD settings
  const [cadSoftware, setCadSoftware] = useState<'ArchiCAD' | 'FreeCAD' | 'Generic CAD'>('ArchiCAD');
  const [cadDraftingType, setCadDraftingType] = useState<'architectural_floorplan' | 'orthographic_projection' | 'parametric_3d_component' | 'bim_wall_section'>('architectural_floorplan');

  // 3D Printing Dynamics settings
  const [printerTech, setPrinterTech] = useState<'FDM' | 'SLA' | 'SLS'>('FDM');
  const [threeDTopic, setThreeDTopic] = useState<'slicing_parameters' | 'filament_dynamics' | 'gcode_syntax' | 'infill_and_supports' | 'print_troubleshooting'>('slicing_parameters');

  const handleCreateCustomCategory = () => {
    if (!newCatName.trim()) return;
    const newCategory = saveCustomCategory(newCatName.trim(), 'Custom ZIMSEC', newCatDesc.trim());
    setCategories(getAllCategories());
    setSelectedCategoryId(newCategory.id);
    setNewCatName('');
    setNewCatDesc('');
    setShowAddCategory(false);
  };

  const handleAddGeneratedPage = (newPage: EducationalPage) => {
    const pageWithSnapshot = {
      ...newPage,
      academicContextSnapshot: academicContext ?? {
        educationLevel: 'Primary',
        gradeLabel: gradeLevel === 'zimsec_primary' ? 'Grade 6' : gradeLevel === 'zimsec_secondary' ? 'Form 3' : gradeLevel === 'zimsec_a_level' ? 'Lower Sixth' : 'Grade 6',
        subjectLabel: 'Unspecified Subject'
      }
    };
    onAddGeneratedPage(pageWithSnapshot);
  };

  const handleGenerate = () => {
    const newPageId = `page-${Date.now()}`;

    if (selectedType === 'past_exam_paper') {
      const examData = generatePastExamPaper(examSubject, gradeLevel, paperNumber);
      handleAddGeneratedPage({
        id: newPageId,
        pageNumber: 1,
        type: 'past_exam_paper',
        title: pageTitle || `${examSubject} ZIMSEC Paper ${paperNumber}`,
        instructions: `Read all instructions carefully and complete all questions in ZIMSEC Paper ${paperNumber} format.`,
        difficulty: 'hard',
        zimsecSyllabusRef: `ZIMSEC Syllabus ${examData.subjectCode}`,
        pastExamData: examData,
        teacherTip: 'Strictly enforce exam time limits and provide candidate answer booklets.'
      });
    } else if (selectedType === 'revision_test') {
      const testData = generateRevisionTest(examSubject, revisionTopic);
      handleAddGeneratedPage({
        id: newPageId,
        pageNumber: 1,
        type: 'revision_test',
        title: pageTitle || `${examSubject} Revision Test: ${revisionTopic}`,
        instructions: 'Complete all practice questions within the time limit allowed.',
        difficulty: 'medium',
        zimsecSyllabusRef: `ZIMSEC Syllabus Topic: ${revisionTopic}`,
        revisionTestData: testData,
        teacherTip: 'Grade according to the sample answers and marking scheme.'
      });
    } else if (selectedType === 'cad_drafting') {
      const cadData = generateCadDraftingData(cadSoftware, cadDraftingType);
      handleAddGeneratedPage({
        id: newPageId,
        pageNumber: 1,
        type: 'cad_drafting',
        title: pageTitle || `${cadSoftware} ${cadData.title}`,
        instructions: `Analyze the ${cadSoftware} CAD blueprint specs and complete all drafting tasks and dimension calculations.`,
        difficulty: 'hard',
        zimsecSyllabusRef: 'ZIMSEC Technical Graphics & CAD Syllabus 7035 / 9182',
        cadDraftingData: cadData,
        teacherTip: `Ensure pupils verify CAD layer names, dimension tick marks, and scaling units (${cadData.scale}).`
      });
    } else if (selectedType === 'three_d_printing') {
      const tdpData = generateThreeDPrintingData(printerTech, threeDTopic);
      handleAddGeneratedPage({
        id: newPageId,
        pageNumber: 1,
        type: 'three_d_printing',
        title: pageTitle || `3D Printing Dynamics: ${threeDTopic.replace(/_/g, ' ').toUpperCase()} (${printerTech})`,
        instructions: 'Examine the slicer parameters, G-Code motor instructions, and filament dynamics below to solve the questions.',
        difficulty: 'hard',
        zimsecSyllabusRef: 'ZIMSEC Applied Technology & Additive Manufacturing',
        threeDPrintingData: tdpData,
        teacherTip: 'Review hotend extrusion physics, bed thermal adhesion, and slicer infill geometry.'
      });
    } else if (selectedType === 'folktale_story') {
      const data = generateFolktaleData(folktaleTheme);
      handleAddGeneratedPage({
        id: newPageId,
        pageNumber: 1,
        type: 'folktale_story',
        title: pageTitle || `${data.title}`,
        instructions: 'Read the traditional folktale, analyze the moral lesson of Hunhu/Ubuntu, and answer the questions.',
        difficulty: 'easy',
        zimsecSyllabusRef: 'ZIMSEC Heritage Studies Syllabus 4006',
        folktaleData: data,
        teacherTip: 'Discuss the moral lesson in small student reading groups.'
      });
    } else if (selectedType === 'community_project') {
      const projData = generateCommunityProjectData(projectTopic);
      handleAddGeneratedPage({
        id: newPageId,
        pageNumber: 1,
        type: 'community_project',
        title: pageTitle || `${projData.projectName}`,
        instructions: 'Follow the practical field steps and record your observations on the assessment rubric.',
        difficulty: 'medium',
        zimsecSyllabusRef: projData.zimsecSyllabusCode,
        communityProjectData: projData,
        teacherTip: 'Ensure students conduct field visits under adult or teacher supervision.'
      });
    } else if (selectedType === 'language_translation') {
      const langData = generateIndigenousLanguageData(languageChoice, languageTopic);
      handleAddGeneratedPage({
        id: newPageId,
        pageNumber: 1,
        type: 'language_translation',
        title: pageTitle || `${languageChoice} Language & Wisdom Exercise`,
        instructions: `Complete the ${languageChoice} ${languageTopic.replace('_', ' ')} exercises below.`,
        difficulty: 'medium',
        zimsecSyllabusRef: `ZIMSEC ${languageChoice} Syllabus`,
        languageData: langData,
        teacherTip: 'Encourage pupils to ask community elders for further examples of proverbs.'
      });
    } else if (selectedType === 'math_worksheet') {
      const problems = generateMathProblems(mathCategory, mathCount);
      handleAddGeneratedPage({
        id: newPageId,
        pageNumber: 1,
        type: 'math_worksheet',
        title: pageTitle || `${mathCategory.toUpperCase()} Drills & Problem Solving`,
        instructions: `Solve all ${mathCount} mathematics problems. Write your final answers clearly in the space provided.`,
        difficulty: gradeLevel === 'primary' ? 'easy' : 'medium',
        mathCategory,
        mathProblems: problems,
        teacherTip: 'Check student calculations and units of measurement.'
      });
    } else if (selectedType === 'word_puzzle') {
      const words = customWordsInput
        .split(',')
        .map(w => w.trim().toUpperCase())
        .filter(w => w.length >= 2);

      const wordListItems = words.map(w => ({
        word: w,
        clue: `Vocabulary term related to study unit: ${w}`
      }));

      const grid = generateWordSearchGrid(words, 10);

      handleAddGeneratedPage({
        id: newPageId,
        pageNumber: 1,
        type: 'word_puzzle',
        title: pageTitle || 'Academic Vocabulary Word Search',
        instructions: 'Search the grid horizontally and vertically to find and circle all hidden terms.',
        difficulty: 'medium',
        wordList: wordListItems,
        wordSearchGrid: grid
      });
    } else if (selectedType === 'coloring_lineart') {
      const elements = getColoringThemeElements(coloringTheme);
      handleAddGeneratedPage({
        id: newPageId,
        pageNumber: 1,
        type: 'coloring_lineart',
        title: pageTitle || `${coloringTheme.replace('_', ' ').toUpperCase()} Line Art Page`,
        instructions: 'Color the line-art illustration using crayons, colored pencils, or markers.',
        difficulty: 'easy',
        coloringTheme,
        coloringElements: elements
      });
    } else {
      // Quiz
      handleAddGeneratedPage({
        id: newPageId,
        pageNumber: 1,
        type: 'quiz_assessment',
        title: pageTitle || 'Heritage & General Unit Quiz',
        instructions: 'Read each question carefully and select the best correct option.',
        difficulty: 'medium',
        quizQuestions: [
          {
            id: 'q1',
            question: 'Which historical stone monument is a UNESCO World Heritage site in Zimbabwe?',
            options: ['Great Zimbabwe', 'Matobo Rock', 'Khami Ruins', 'Victoria Falls'],
            correctIndex: 0
          },
          {
            id: 'q2',
            question: 'What is Pfumvudza / Intwasa in agricultural science?',
            options: ['Commercial Tillage', 'Climate-Smart Conservation Agriculture', 'Hydroponics', 'Chemical Spraying'],
            correctIndex: 1
          }
        ]
      });
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> ZIMSEC Syllabus & Activity Builder
        </h3>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 uppercase">
          Grade / Level: {gradeLevel}
        </span>
      </div>

      {/* Category Selection Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-emerald-600" /> Syllabus Category
          </label>
          <button
            type="button"
            onClick={() => setShowAddCategory(!showAddCategory)}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <FolderPlus className="w-3.5 h-3.5" /> + Add New Category
          </button>
        </div>

        {/* Custom Category Form */}
        {showAddCategory && (
          <div className="p-3 bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/30 rounded-lg space-y-2 text-xs">
            <div className="font-bold text-emerald-800 dark:text-emerald-300">Create New Syllabus Category</div>
            <input
              type="text"
              placeholder="Category Name (e.g. Technical Graphics & Woodwork)"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="w-full p-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100"
            />
            <input
              type="text"
              placeholder="Description (Optional)"
              value={newCatDesc}
              onChange={(e) => setNewCatDesc(e.target.value)}
              className="w-full p-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddCategory(false)}
                className="px-3 py-1 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateCustomCategory}
                className="px-3 py-1 bg-emerald-600 text-white rounded font-bold hover:bg-emerald-700 cursor-pointer"
              >
                Save Category
              </button>
            </div>
          </div>
        )}

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  isSelected
                    ? 'bg-emerald-600 text-white font-bold shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {cat.name}
                {cat.isCustom && <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1 rounded ml-1">Custom</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Select Activity Type */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
          Activity / Paper Type
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => setSelectedType('past_exam_paper')}
            className={`p-2.5 rounded-lg border text-left flex flex-col items-center gap-1 transition-all cursor-pointer ${
              selectedType === 'past_exam_paper'
                ? 'bg-emerald-600 text-white border-emerald-700 font-bold shadow-sm'
                : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 hover:border-emerald-500 text-zinc-800 dark:text-zinc-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span className="text-xs font-semibold text-center">Past Exam Paper</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedType('revision_test')}
            className={`p-2.5 rounded-lg border text-left flex flex-col items-center gap-1 transition-all cursor-pointer ${
              selectedType === 'revision_test'
                ? 'bg-emerald-600 text-white border-emerald-700 font-bold shadow-sm'
                : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 hover:border-emerald-500 text-zinc-800 dark:text-zinc-200'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span className="text-xs font-semibold text-center">Revision Test</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedType('cad_drafting')}
            className={`p-2.5 rounded-lg border text-left flex flex-col items-center gap-1 transition-all cursor-pointer ${
              selectedType === 'cad_drafting'
                ? 'bg-emerald-600 text-white border-emerald-700 font-bold shadow-sm'
                : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 hover:border-emerald-500 text-zinc-800 dark:text-zinc-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span className="text-xs font-semibold text-center">ArchiCAD / FreeCAD</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedType('three_d_printing')}
            className={`p-2.5 rounded-lg border text-left flex flex-col items-center gap-1 transition-all cursor-pointer ${
              selectedType === 'three_d_printing'
                ? 'bg-emerald-600 text-white border-emerald-700 font-bold shadow-sm'
                : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 hover:border-emerald-500 text-zinc-800 dark:text-zinc-200'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span className="text-xs font-semibold text-center">3D Printing Dynamics</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedType('folktale_story')}
            className={`p-2.5 rounded-lg border text-left flex flex-col items-center gap-1 transition-all cursor-pointer ${
              selectedType === 'folktale_story'
                ? 'bg-emerald-600 text-white border-emerald-700 font-bold shadow-sm'
                : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 hover:border-emerald-500 text-zinc-800 dark:text-zinc-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="text-xs font-semibold text-center">African Folktale</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedType('community_project')}
            className={`p-2.5 rounded-lg border text-left flex flex-col items-center gap-1 transition-all cursor-pointer ${
              selectedType === 'community_project'
                ? 'bg-emerald-600 text-white border-emerald-700 font-bold shadow-sm'
                : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 hover:border-emerald-500 text-zinc-800 dark:text-zinc-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="text-xs font-semibold text-center">Community Project</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedType('language_translation')}
            className={`p-2.5 rounded-lg border text-left flex flex-col items-center gap-1 transition-all cursor-pointer ${
              selectedType === 'language_translation'
                ? 'bg-emerald-600 text-white border-emerald-700 font-bold shadow-sm'
                : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 hover:border-emerald-500 text-zinc-800 dark:text-zinc-200'
            }`}
          >
            <Languages className="w-4 h-4" />
            <span className="text-xs font-semibold text-center">Indigenous Language</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedType('math_worksheet')}
            className={`p-2.5 rounded-lg border text-left flex flex-col items-center gap-1 transition-all cursor-pointer ${
              selectedType === 'math_worksheet'
                ? 'bg-emerald-600 text-white border-emerald-700 font-bold shadow-sm'
                : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 hover:border-emerald-500 text-zinc-800 dark:text-zinc-200'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span className="text-xs font-semibold text-center">Math Drills</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedType('word_puzzle')}
            className={`p-2.5 rounded-lg border text-left flex flex-col items-center gap-1 transition-all cursor-pointer ${
              selectedType === 'word_puzzle'
                ? 'bg-emerald-600 text-white border-emerald-700 font-bold shadow-sm'
                : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 hover:border-emerald-500 text-zinc-800 dark:text-zinc-200'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span className="text-xs font-semibold text-center">Word Search</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedType('coloring_lineart')}
            className={`p-2.5 rounded-lg border text-left flex flex-col items-center gap-1 transition-all cursor-pointer ${
              selectedType === 'coloring_lineart'
                ? 'bg-emerald-600 text-white border-emerald-700 font-bold shadow-sm'
                : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 hover:border-emerald-500 text-zinc-800 dark:text-zinc-200'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span className="text-xs font-semibold text-center">Coloring Page</span>
          </button>
        </div>
      </div>

      {/* Header Title Input */}
      <div>
        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
          Activity / Worksheet Custom Title
        </label>
        <input
          type="text"
          value={pageTitle}
          onChange={(e) => setPageTitle(e.target.value)}
          className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-zinc-100 font-medium"
        />
      </div>

      {/* Past Exam Paper Settings */}
      {selectedType === 'past_exam_paper' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Exam Subject Name & Code</label>
            <input
              type="text"
              value={examSubject}
              onChange={(e) => setExamSubject(e.target.value)}
              className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100 font-medium"
              placeholder="e.g. Combined Science, Mathematics 4004"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Paper Format</label>
            <select
              value={paperNumber}
              onChange={(e) => setPaperNumber(parseInt(e.target.value))}
              className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100 font-medium cursor-pointer"
            >
              <option value={1}>Paper 1: Section A Multiple Choice (40 Marks)</option>
              <option value={2}>Paper 2: Section A & B Structured / Essay (100 Marks)</option>
            </select>
          </div>
        </div>
      )}

      {/* Revision Test Settings */}
      {selectedType === 'revision_test' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Subject / Syllabus Unit</label>
            <input
              type="text"
              value={examSubject}
              onChange={(e) => setExamSubject(e.target.value)}
              className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100 font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Revision Topic</label>
            <input
              type="text"
              value={revisionTopic}
              onChange={(e) => setRevisionTopic(e.target.value)}
              className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100 font-medium"
            />
          </div>
        </div>
      )}

      {/* CAD Drafting Settings */}
      {selectedType === 'cad_drafting' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">CAD Software Package</label>
            <select
              value={cadSoftware}
              onChange={(e) => setCadSoftware(e.target.value as any)}
              className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100 font-medium cursor-pointer"
            >
              <option value="ArchiCAD">Graphisoft ArchiCAD (Architectural BIM & Floorplans)</option>
              <option value="FreeCAD">FreeCAD (Parametric 3D Solid Mechanical Modeling)</option>
              <option value="Generic CAD">Generic Technical Drafting CAD</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Blueprint & Projection Type</label>
            <select
              value={cadDraftingType}
              onChange={(e) => setCadDraftingType(e.target.value as any)}
              className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100 font-medium cursor-pointer"
            >
              <option value="architectural_floorplan">Residential Floor Plan & Dimensioning (Scale 1:50)</option>
              <option value="orthographic_projection">First-Angle Orthographic Projection (3 Views)</option>
              <option value="parametric_3d_component">FreeCAD PartDesign 3D Solid Bracket Modeling</option>
              <option value="bim_wall_section">ArchiCAD Composite Masonry Wall BIM Section</option>
            </select>
          </div>
        </div>
      )}

      {/* 3D Printing Dynamics Settings */}
      {selectedType === 'three_d_printing' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Additive Manufacturing Technology</label>
            <select
              value={printerTech}
              onChange={(e) => setPrinterTech(e.target.value as any)}
              className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100 font-medium cursor-pointer"
            >
              <option value="FDM">FDM - Fused Deposition Modeling (Thermoplastic Filament)</option>
              <option value="SLA">SLA - Stereolithography (Liquid Resin UV Curing)</option>
              <option value="SLS">SLS - Selective Laser Sintering (Powder Bed Fusion)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Additive Dynamics Study Module</label>
            <select
              value={threeDTopic}
              onChange={(e) => setThreeDTopic(e.target.value as any)}
              className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100 font-medium cursor-pointer"
            >
              <option value="slicing_parameters">Slicer Parameters, Layer Heights & Speed Physics</option>
              <option value="filament_dynamics">Filament Thermal Dynamics (PLA, PETG, ABS, TPU)</option>
              <option value="gcode_syntax">G-Code Syntax & Stepper Motor Motion Analysis</option>
              <option value="infill_and_supports">Infill Geometry (Gyroid vs Grid) & Overhang Supports</option>
              <option value="print_troubleshooting">Quality Audit & Defect Troubleshooting (Stringing, Warping)</option>
            </select>
          </div>
        </div>
      )}

      {/* Folktale Settings */}
      {selectedType === 'folktale_story' && (
        <div className="text-xs space-y-2">
          <label className="block font-semibold text-zinc-700 dark:text-zinc-300">Select Folktale Theme (Ngano / Inganekwane)</label>
          <select
            value={folktaleTheme}
            onChange={(e) => setFolktaleTheme(e.target.value as any)}
            className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100 font-medium cursor-pointer"
          >
            <option value="tsuro_na_gudo" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Tsuro naGudo (The Hare & Baboon) - Honesty & Sharing</option>
            <option value="kamba_tortoise" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Wisdom of Kamba the Tortoise - Patience & Perseverance</option>
            <option value="great_zimbabwe" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Builders of Great Zimbabwe - Engineering & Heritage Pride</option>
          </select>
        </div>
      )}

      {/* Community Project Settings */}
      {selectedType === 'community_project' && (
        <div className="text-xs space-y-2">
          <label className="block font-semibold text-zinc-700 dark:text-zinc-300">ZIMSEC Community Field Project Topic</label>
          <select
            value={projectTopic}
            onChange={(e) => setProjectTopic(e.target.value as any)}
            className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100 font-medium cursor-pointer"
          >
            <option value="pfumvudza_farming" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Pfumvudza/Intwasa Conservation Plot (ZIMSEC Ag Syllabus 7038)</option>
            <option value="heritage_monuments" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Local Community Heritage & Historical Landmark Preservation Map</option>
            <option value="clean_water_sanitation" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Ubuntu Community Water Source & Village Hygiene Audit</option>
          </select>
        </div>
      )}

      {/* Indigenous Language Settings */}
      {selectedType === 'language_translation' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Language</label>
            <select
              value={languageChoice}
              onChange={(e) => setLanguageChoice(e.target.value as any)}
              className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100 font-medium cursor-pointer"
            >
              <option value="Shona" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Shona (ChiShona)</option>
              <option value="Ndebele" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Ndebele (SiNdebele)</option>
              <option value="English" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">English Language</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Exercise Topic</label>
            <select
              value={languageTopic}
              onChange={(e) => setLanguageTopic(e.target.value as any)}
              className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100 font-medium cursor-pointer"
            >
              <option value="tsumo_proverbs" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Proverbs & Moral Maxims (Tsumo / Izaga)</option>
              <option value="zvirahwe_riddles" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Riddles & Mind Puzzles (Zvirahwe / Izitshokobezi)</option>
              <option value="nzwisiso_comprehension" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Passage Reading Comprehension (Nzwisiso)</option>
            </select>
          </div>
        </div>
      )}

      {/* Math settings */}
      {selectedType === 'math_worksheet' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Math Category</label>
            <select
              value={mathCategory}
              onChange={(e) => setMathCategory(e.target.value as any)}
              className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100 font-medium cursor-pointer"
            >
              <option value="addition" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Addition & Subtraction (Primary K-3)</option>
              <option value="multiplication" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Multiplication & Division (Grades 3-5)</option>
              <option value="fractions" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Fractions & Decimals (Grades 4-6)</option>
              <option value="geometry" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Geometry & Area Calculations (Grades 6-8)</option>
              <option value="algebra" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Algebra & Equations (Grades 7-12)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Number of Problems</label>
            <input
              type="number"
              min="4"
              max="16"
              value={mathCount}
              onChange={(e) => setMathCount(parseInt(e.target.value) || 6)}
              className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100 font-medium"
            />
          </div>
        </div>
      )}

      {/* Word puzzle settings */}
      {selectedType === 'word_puzzle' && (
        <div className="text-xs">
          <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Vocabulary Words (Comma Separated)
          </label>
          <input
            type="text"
            value={customWordsInput}
            onChange={(e) => setCustomWordsInput(e.target.value)}
            className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100 font-mono"
            placeholder="e.g. HERITAGE, UBUNTU, PFUMVUDZA, ZIMBABWE"
          />
        </div>
      )}

      {/* Coloring settings */}
      {selectedType === 'coloring_lineart' && (
        <div className="text-xs">
          <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Line Art Subject Theme</label>
          <select
            value={coloringTheme}
            onChange={(e) => setColoringTheme(e.target.value as any)}
            className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100 font-medium cursor-pointer"
          >
            <option value="great_zimbabwe" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Great Zimbabwe Walls & Bird (ZIMSEC Heritage)</option>
            <option value="tsuro_na_gudo" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Tsuro naGudo & Great Baobab Tree (Folktale Line Art)</option>
            <option value="safari_animals" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">African Safari & Animals (Primary)</option>
            <option value="solar_system" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Solar System & Planets (Primary / Middle)</option>
            <option value="chemistry_lab" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Chemistry Lab Glassware (Middle / High)</option>
            <option value="cell_structure" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Cell Structure & Biology (Middle / High)</option>
          </select>
        </div>
      )}

      {/* Generate & Add Page Button */}
      <button
        type="button"
        onClick={handleGenerate}
        className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
      >
        <Plus className="w-4 h-4" /> Generate & Append ZIMSEC Page to Book
      </button>
    </div>
  );
};

