import { EducationalBookProject } from './types';
import { generateFolktaleData, generateCommunityProjectData, generateIndigenousLanguageData } from './generatorUtils';

export const ZIMSEC_HERITAGE_FOLKTALES_PRIMARY: EducationalBookProject = {
  id: 'edu-zimsec-primary-1',
  title: 'ZIMSEC Heritage Studies, Folktales & Agriculture Workbook',
  subtitle: 'African Folktales (Ngano), Indigenous Proverbs (Tsumo/Izaga), Pfumvudza Farming & Great Zimbabwe Monuments',
  author: 'ZIMSEC Curriculum Development Unit & Heritage Dept',
  gradeLevel: 'zimsec_primary',
  subject: 'folktales_heritage',
  targetAgeGroup: 'Grades 3-7 (ZIMSEC Primary)',
  coverColor: '#15803d',
  includeAnswerKey: true,
  zimsecAligned: true,
  createdDate: new Date().toISOString().split('T')[0],
  pages: [
    {
      id: 'zp-1',
      pageNumber: 1,
      type: 'folktale_story',
      title: 'Tsuro naGudo: Honesty & Community Values',
      instructions: 'Read the African folktale (Ngano) below carefully, reflect on the moral lesson of Hunhu/Ubuntu, and answer the comprehension questions.',
      difficulty: 'easy',
      zimsecSyllabusRef: 'ZIMSEC Heritage Studies Syllabus 4006 / Grade 4 Oral Literature',
      folktaleData: generateFolktaleData('tsuro_na_gudo'),
      teacherTip: 'Ask pupils to roleplay Tsuro and Gudo to emphasize how greed hurts community harmony.'
    },
    {
      id: 'zp-2',
      pageNumber: 2,
      type: 'coloring_lineart',
      title: 'Great Zimbabwe Monument & Conical Tower',
      instructions: 'Color the dry stone walls, Conical Tower, and soapstone Zimbabwe Bird. Learn about ancient stonemasonry!',
      difficulty: 'easy',
      zimsecSyllabusRef: 'ZIMSEC Heritage Studies Syllabus 4006 / Grade 5 Historical Monuments',
      coloringTheme: 'great_zimbabwe',
      colorByNumberLegend: [
        { number: 1, colorName: 'Granite Gray (Dry Stone Walls)', hex: '#64748b' },
        { number: 2, colorName: 'Ochre Sand (Conical Tower)', hex: '#d97706' },
        { number: 3, colorName: 'Terracotta (Zimbabwe Bird Pillar)', hex: '#c2410c' }
      ]
    },
    {
      id: 'zp-3',
      pageNumber: 3,
      type: 'community_project',
      title: 'Pfumvudza / Intwasa Climate Agriculture Project',
      instructions: 'Complete this hands-on field project in your school garden or home plot to demonstrate soil moisture conservation.',
      difficulty: 'medium',
      zimsecSyllabusRef: 'ZIMSEC Agriculture Syllabus 7038 / Grade 6 Conservation Farming',
      communityProjectData: generateCommunityProjectData('pfumvudza_farming'),
      teacherTip: 'Measure basins precisely with a stick and ensure dry grass mulch covers the entire soil surface.'
    },
    {
      id: 'zp-4',
      pageNumber: 4,
      type: 'language_translation',
      title: 'Shona Proverbs (Tsumo) & Wisdom Exercises',
      instructions: 'Complete the traditional Shona proverbs below. Explain the moral meaning behind each proverb.',
      difficulty: 'medium',
      zimsecSyllabusRef: 'ZIMSEC Shona Literature & Culture Syllabus 3006',
      languageData: generateIndigenousLanguageData('Shona', 'tsumo_proverbs')
    },
    {
      id: 'zp-5',
      pageNumber: 5,
      type: 'data_sheet_table',
      title: 'Pfumvudza Agricultural Harvest Data Sheet',
      instructions: 'Record the weekly rainfall (mm), mulch thickness (cm), and maize crop yield across trial plots in the spreadsheet table below.',
      difficulty: 'medium',
      zimsecSyllabusRef: 'ZIMSEC Agriculture Syllabus 7038 / Grade 6 Data Analytics',
      chapterNumber: 2,
      chapterTitle: 'Practical Conservation & Data Sheets',
      tableData: {
        title: 'School Demonstration Plot Harvest Log Sheet',
        headers: ['Plot No.', 'Crop Variety', 'Mulch Depth (cm)', 'Weekly Rainfall (mm)', 'Est. Yield (kg)'],
        rows: [
          ['Plot A1', 'SC 403 (Kanyi)', '5 cm', '45 mm', '28 kg'],
          ['Plot A2', 'SC 513 (Medium)', '7 cm', '52 mm', '34 kg'],
          ['Plot B1', 'Traditional Sorghum', '6 cm', '38 mm', '22 kg'],
          ['Plot B2', 'Pearl Millet (Mhunga)', '8 cm', '30 mm', '26 kg']
        ]
      }
    },
    {
      id: 'zp-6',
      pageNumber: 6,
      type: 'graph_chart',
      title: 'Community Crop Yield Comparison Graph',
      instructions: 'Examine the bar chart comparing maize yield across traditional farming vs. Pfumvudza conservation plots.',
      difficulty: 'medium',
      zimsecSyllabusRef: 'ZIMSEC Primary Mathematics & Agriculture Syllabus',
      chapterNumber: 2,
      chapterTitle: 'Practical Conservation & Data Sheets',
      chartData: {
        title: 'Maize Yield Comparison per Basin Plot (kg)',
        type: 'bar',
        xAxisLabel: 'Farming Technique',
        yAxisLabel: 'Grain Harvest (kg)',
        items: [
          { label: 'Conventional Tillage', value: 14, color: '#ef4444' },
          { label: 'Pfumvudza Plot A', value: 32, color: '#10b981' },
          { label: 'Pfumvudza Plot B', value: 38, color: '#059669' },
          { label: 'Irrigated Demo', value: 45, color: '#0284c7' }
        ]
      }
    }
  ]
};

export const PRIMARY_SAFARI_WORKBOOK: EducationalBookProject = {
  id: 'edu-primary-1',
  title: 'Safari Animals Math & Coloring Workbook',
  subtitle: 'Fun Animal Counting, Math Drills & Color-by-Number for Primary Students',
  author: 'Dr. Sarah Jenkins & Primary Edu Team',
  gradeLevel: 'primary',
  subject: 'math',
  targetAgeGroup: 'Grades K-3 (Ages 5-8)',
  coverColor: '#16a34a',
  includeAnswerKey: true,
  createdDate: new Date().toISOString().split('T')[0],
  pages: [
    {
      id: 'p-1',
      pageNumber: 1,
      type: 'coloring_lineart',
      title: 'Solar System & Planet Discovery',
      instructions: 'Color the Sun, Earth, Mercury, and Saturn using your favorite crayons or markers. Pay attention to the planet orbit lines!',
      difficulty: 'easy',
      coloringTheme: 'solar_system',
      colorByNumberLegend: [
        { number: 1, colorName: 'Yellow (Sun & Stars)', hex: '#eab308' },
        { number: 2, colorName: 'Orange (Mercury)', hex: '#f97316' },
        { number: 3, colorName: 'Blue / Green (Earth)', hex: '#0284c7' },
        { number: 4, colorName: 'Golden Ring (Saturn)', hex: '#d97706' }
      ],
      teacherTip: 'Ask students to identify which planet is closest to the Sun.'
    },
    {
      id: 'p-2',
      pageNumber: 2,
      type: 'math_worksheet',
      title: 'Safari Animal Addition Drills',
      instructions: 'Solve each addition problem. Show your work or draw tally marks in the space provided.',
      difficulty: 'easy',
      mathCategory: 'addition',
      mathProblems: [
        { id: 'm1', question: 'What is 5 + 4?', expression: '5 + 4 = \\square', latex: '5 + 4 = \\square', answer: '9' },
        { id: 'm2', question: 'What is 7 + 6?', expression: '7 + 6 = \\square', latex: '7 + 6 = \\square', answer: '13' },
        { id: 'm3', question: 'What is 12 + 8?', expression: '12 + 8 = \\square', latex: '12 + 8 = \\square', answer: '20' },
        { id: 'm4', question: 'What is 9 + 7?', expression: '9 + 7 = \\square', latex: '9 + 7 = \\square', answer: '16' },
        { id: 'm5', question: 'What is 15 + 5?', expression: '15 + 5 = \\square', latex: '15 + 5 = \\square', answer: '20' },
        { id: 'm6', question: 'What is 8 + 8?', expression: '8 + 8 = \\square', latex: '8 + 8 = \\square', answer: '16' }
      ],
      teacherTip: 'Encourage students to count aloud or use physical counters if needed.'
    },
    {
      id: 'p-3',
      pageNumber: 3,
      type: 'coloring_lineart',
      title: 'African Safari Giraffe & Wildlife',
      instructions: 'Color the tall giraffe, spot patterns, sun, and clouds. Write the name of your favorite wild animal below!',
      difficulty: 'easy',
      coloringTheme: 'safari_animals',
      teacherTip: 'Discuss animal habitats and how giraffes use their long necks to reach high acacia leaves.'
    },
    {
      id: 'p-4',
      pageNumber: 4,
      type: 'word_puzzle',
      title: 'Wildlife Vocabulary Word Search',
      instructions: 'Find and circle all the hidden wild animal vocabulary words in the grid below.',
      difficulty: 'medium',
      wordList: [
        { word: 'GIRAFFE', clue: 'Tallest mammal with a long neck' },
        { word: 'SAFARI', clue: 'An overland expedition to observe wildlife' },
        { word: 'LION', clue: 'Known as the king of the jungle' },
        { word: 'SAVANNA', clue: 'Grassy plain habitat in tropical regions' },
        { word: 'ZEBRA', clue: 'Black and white striped wild horse' }
      ]
    }
  ]
};

export const MIDDLE_SCHOOL_SPACE_SCIENCE: EducationalBookProject = {
  id: 'edu-middle-1',
  title: 'Space Science & Astronomy Activity Guide',
  subtitle: 'Diagram Labeling, Celestial Crosswords & Chemistry Lab Line Art',
  author: 'Prof. Marcus Vance',
  gradeLevel: 'middle',
  subject: 'science',
  targetAgeGroup: 'Grades 6-8 (Ages 11-14)',
  coverColor: '#0284c7',
  includeAnswerKey: true,
  createdDate: new Date().toISOString().split('T')[0],
  pages: [
    {
      id: 'p-101',
      pageNumber: 1,
      type: 'coloring_lineart',
      title: 'Chemistry Laboratory Equipment',
      instructions: 'Examine the beaker, flask, and microscope. Color the glassware and label the liquid contents.',
      difficulty: 'medium',
      coloringTheme: 'chemistry_lab',
      teacherTip: 'Safety first! Review laboratory rule guidelines before conducting hands-on experiments.'
    },
    {
      id: 'p-102',
      pageNumber: 2,
      type: 'math_worksheet',
      title: 'Algebraic Equations & Ratios',
      instructions: 'Solve for x in each algebraic equation. Check your answers using substitution.',
      difficulty: 'medium',
      mathCategory: 'algebra',
      mathProblems: [
        { id: 'alg1', question: 'Solve for x', expression: '3x = 21 \\implies x = \\square', latex: '3x = 21 \\implies x = \\square', answer: '7' },
        { id: 'alg2', question: 'Solve for x', expression: '5x = 45 \\implies x = \\square', latex: '5x = 45 \\implies x = \\square', answer: '9' },
        { id: 'alg3', question: 'Solve for x', expression: '2x + 4 = 16 \\implies x = \\square', latex: '2x + 4 = 16 \\implies x = \\square', answer: '6' },
        { id: 'alg4', question: 'Solve for x', expression: '4x - 5 = 15 \\implies x = \\square', latex: '4x - 5 = 15 \\implies x = \\square', answer: '5' }
      ]
    },
    {
      id: 'p-103',
      pageNumber: 3,
      type: 'word_puzzle',
      title: 'Astronomy & Physics Word Search',
      instructions: 'Find key terms related to gravity, orbits, light-years, and nebulae in the grid.',
      difficulty: 'medium',
      wordList: [
        { word: 'GRAVITY', clue: 'Force attracting a body toward center of Earth or celestial mass' },
        { word: 'NEBULA', clue: 'Interstellar cloud of dust, hydrogen, and helium gas' },
        { word: 'ORBIT', clue: 'Curved path of a celestial object around a star or planet' },
        { word: 'SPECTRUM', clue: 'Band of colors produced when light is separated by frequency' },
        { word: 'PHOTON', clue: 'Quantum particle of electromagnetic radiation' }
      ]
    }
  ]
};

export const HIGH_SCHOOL_BIOLOGY_WORKBOOK: EducationalBookProject = {
  id: 'edu-high-1',
  title: 'High School Biology & Cell Anatomy Workbook',
  subtitle: 'Organelle Diagram Labeling, Advanced Genetics & Molecular Line-Art',
  author: 'Dr. Elena Rostova',
  gradeLevel: 'high',
  subject: 'science',
  targetAgeGroup: 'Grades 9-12 (Ages 14-18)',
  coverColor: '#7c3aed',
  includeAnswerKey: true,
  createdDate: new Date().toISOString().split('T')[0],
  pages: [
    {
      id: 'p-201',
      pageNumber: 1,
      type: 'coloring_lineart',
      title: 'Plant & Animal Cell Organelles',
      instructions: 'Study the cell membrane, nucleus, nucleolus, and mitochondria. Color organelles according to their functional groups.',
      difficulty: 'hard',
      coloringTheme: 'custom',
      teacherTip: 'Focus on ATP generation within the inner mitochondrial membrane.'
    },
    {
      id: 'p-202',
      pageNumber: 2,
      type: 'math_worksheet',
      title: 'Geometry & Area Formulas',
      instructions: 'Calculate the total area or volume for each geometric shape using standard formulas.',
      difficulty: 'hard',
      mathCategory: 'geometry',
      mathProblems: [
        { id: 'geo1', question: 'Rectangle Area', expression: '\\text{Area} = 12\\,\\text{cm} \\times 8\\,\\text{cm} = \\square\\,\\text{cm}^2', latex: '\\text{Area} = 12\\,\\text{cm} \\times 8\\,\\text{cm} = \\square\\,\\text{cm}^2', answer: '96' },
        { id: 'geo2', question: 'Triangle Area', expression: '\\text{Area} = \\frac{1}{2} \\cdot 10\\,\\text{cm} \\cdot 6\\,\\text{cm} = \\square\\,\\text{cm}^2', latex: '\\text{Area} = \\frac{1}{2} \\cdot 10\\,\\text{cm} \\cdot 6\\,\\text{cm} = \\square\\,\\text{cm}^2', answer: '30' },
        { id: 'geo3', question: 'Rectangle Area', expression: '\\text{Area} = 15\\,\\text{cm} \\times 10\\,\\text{cm} = \\square\\,\\text{cm}^2', latex: '\\text{Area} = 15\\,\\text{cm} \\times 10\\,\\text{cm} = \\square\\,\\text{cm}^2', answer: '150' }
      ]
    }
  ]
};

export const PRESET_EDUCATIONAL_BOOKS: EducationalBookProject[] = [
  ZIMSEC_HERITAGE_FOLKTALES_PRIMARY,
  PRIMARY_SAFARI_WORKBOOK,
  MIDDLE_SCHOOL_SPACE_SCIENCE,
  HIGH_SCHOOL_BIOLOGY_WORKBOOK
];

