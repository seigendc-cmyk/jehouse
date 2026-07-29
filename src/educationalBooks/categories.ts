export interface CategoryItem {
  id: string;
  name: string;
  group: 'Past Exams & Revision' | 'STEM & Sciences' | 'Humanities & Social Sciences' | 'Languages & Literature' | 'Commercials & Business' | 'Agriculture & Practical' | 'Custom Categories';
  zimsecSyllabusCode?: string;
  description?: string;
  isCustom?: boolean;
}

export const DEFAULT_ZIMSEC_CATEGORIES: CategoryItem[] = [
  // PAST EXAMS & REVISION
  {
    id: 'past_exam_papers',
    name: 'Past Examination Papers (ZIMSEC Grade 7, O-Level & A-Level)',
    group: 'Past Exams & Revision',
    zimsecSyllabusCode: 'ZIMSEC Past Exam Papers',
    description: 'Official format past question papers with Section A MCQs & Section B structured problems'
  },
  {
    id: 'revision_tests',
    name: 'Revision Tests & Practice Assessment Papers',
    group: 'Past Exams & Revision',
    zimsecSyllabusCode: 'ZIMSEC Revision Suite',
    description: 'Timed revision worksheets, topic tests, and practice papers with marking schemes'
  },

  // STEM & SCIENCES
  {
    id: 'math',
    name: 'Mathematics & Statistics',
    group: 'STEM & Sciences',
    zimsecSyllabusCode: 'ZIMSEC Maths 4004 / 4028',
    description: 'Numbers, Algebra, Geometry, Statistics, Vectors & Trigonometry'
  },
  {
    id: 'combined_science',
    name: 'Combined Science / Integrated Science',
    group: 'STEM & Sciences',
    zimsecSyllabusCode: 'ZIMSEC Combined Science 5006',
    description: 'Biology, Chemistry & Physics fundamentals for Secondary Education'
  },
  {
    id: 'physics',
    name: 'Physics',
    group: 'STEM & Sciences',
    zimsecSyllabusCode: 'ZIMSEC Physics 5054 / 9188',
    description: 'Mechanics, Electricity, Waves, Nuclear Physics & Thermodynamics'
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    group: 'STEM & Sciences',
    zimsecSyllabusCode: 'ZIMSEC Chemistry 5070 / 9189',
    description: 'Atomic structure, Stoichiometry, Organic Chemistry & Chemical Kinetics'
  },
  {
    id: 'biology',
    name: 'Biology & Life Sciences',
    group: 'STEM & Sciences',
    zimsecSyllabusCode: 'ZIMSEC Biology 5090 / 9184',
    description: 'Cell anatomy, Physiology, Genetics, Ecology & Biotechnology'
  },
  {
    id: 'computer_science',
    name: 'Computer Science & ICT',
    group: 'STEM & Sciences',
    zimsecSyllabusCode: 'ZIMSEC Computer Science 7014',
    description: 'Programming, Data structures, Hardware, Networking & Systems'
  },
  {
    id: 'additional_math',
    name: 'Additional / Pure Mathematics',
    group: 'STEM & Sciences',
    zimsecSyllabusCode: 'ZIMSEC Pure Maths 4033 / 9164',
    description: 'Calculus, Matrices, Complex Numbers & Advanced Coordinate Geometry'
  },

  // HUMANITIES & SOCIAL SCIENCES
  {
    id: 'heritage_studies',
    name: 'Heritage Studies & Culture',
    group: 'Humanities & Social Sciences',
    zimsecSyllabusCode: 'ZIMSEC Heritage Studies 4006 / 2042',
    description: 'Monuments, Hunhu/Ubuntu, Liberation War History & Cultural Heritage'
  },
  {
    id: 'history',
    name: 'History & Pan-African Studies',
    group: 'Humanities & Social Sciences',
    zimsecSyllabusCode: 'ZIMSEC History 2167 / 9155',
    description: 'Pre-Colonial Kingdoms, Chimurenga/Umvukela & World History'
  },
  {
    id: 'geography',
    name: 'Geography & Environmental Science',
    group: 'Humanities & Social Sciences',
    zimsecSyllabusCode: 'ZIMSEC Geography 2248 / 9156',
    description: 'Physical geography, Weather/Climate, Mapwork & Settlement'
  },
  {
    id: 'family_religious_studies',
    name: 'Family & Religious Studies (FRS / Famu)',
    group: 'Humanities & Social Sciences',
    zimsecSyllabusCode: 'ZIMSEC FRS 2043 / 9154',
    description: 'Indigenous Religion, Christianity, Islam & Family Ethics'
  },
  {
    id: 'sociology_psychology',
    name: 'Sociology & Guidance Counseling',
    group: 'Humanities & Social Sciences',
    zimsecSyllabusCode: 'ZIMSEC Sociology 9158',
    description: 'Social structures, Community development & Youth empowerment'
  },

  // LANGUAGES & LITERATURE
  {
    id: 'english_language',
    name: 'English Language & Literature',
    group: 'Languages & Literature',
    zimsecSyllabusCode: 'ZIMSEC English 1122 / 9153',
    description: 'Comprehension, Summary writing, Composition & Literary analysis'
  },
  {
    id: 'shona_language',
    name: 'ChiShona Language & Literature',
    group: 'Languages & Literature',
    zimsecSyllabusCode: 'ZIMSEC Shona 3006 / 9151',
    description: 'Nzwisiso, Tsumo, Zvirahwe, Madimikira & Ndetembo/Ushandiri'
  },
  {
    id: 'ndebele_language',
    name: 'IsiNdebele Language & Literature',
    group: 'Languages & Literature',
    zimsecSyllabusCode: 'ZIMSEC Ndebele 3007 / 9152',
    description: 'Inzwisiso, Izaga, Izitshokobezi, Izihlabelelo & Imilayezo'
  },
  {
    id: 'indigenous_languages_other',
    name: 'Indigenous Languages (Tonga, Kalanga, Venda, Shangani, Nambya)',
    group: 'Languages & Literature',
    zimsecSyllabusCode: 'ZIMSEC National Languages',
    description: 'Grammar, Proverbs, Folktales & Local language heritage'
  },
  {
    id: 'foreign_languages',
    name: 'Foreign Languages (French, Portuguese)',
    group: 'Languages & Literature',
    zimsecSyllabusCode: 'ZIMSEC Modern Languages',
    description: 'Vocabulary, Grammar, Translation & Oral communication'
  },

  // COMMERCIALS & BUSINESS
  {
    id: 'commerce',
    name: 'Commerce & Business Enterprise',
    group: 'Commercials & Business',
    zimsecSyllabusCode: 'ZIMSEC Commerce 4049 / 9157',
    description: 'Trade, Banking, Insurance, Warehousing & Entrepreneurship'
  },
  {
    id: 'principles_accounts',
    name: 'Principles of Accounts & Financial Accounting',
    group: 'Commercials & Business',
    zimsecSyllabusCode: 'ZIMSEC Accounts 4028 / 9159',
    description: 'Ledgers, Double-entry, Balance sheets, Cash books & Auditing'
  },
  {
    id: 'economics',
    name: 'Economics & Business Studies',
    group: 'Commercials & Business',
    zimsecSyllabusCode: 'ZIMSEC Economics 2281 / 9158',
    description: 'Microeconomics, Macroeconomics, Inflation & Market structures'
  },

  // AGRICULTURE & PRACTICAL
  {
    id: 'agriculture',
    name: 'Agriculture, Animal Husbandry & Pfumvudza Conservation',
    group: 'Agriculture & Practical',
    zimsecSyllabusCode: 'ZIMSEC Agriculture 7038 / 9180',
    description: 'Soil science, Crop production, Pfumvudza farming & Livestock'
  },
  {
    id: 'building_technical_graphics',
    name: 'Building Technology & Technical Graphics',
    group: 'Agriculture & Practical',
    zimsecSyllabusCode: 'ZIMSEC Technical Graphics 7035',
    description: 'Architectural drafting, Bricklaying, Surveying & Engineering drawing'
  },
  {
    id: 'archicad_freecad_cad',
    name: 'ArchiCAD & FreeCAD Architectural Drafting & 3D CAD',
    group: 'Agriculture & Practical',
    zimsecSyllabusCode: 'ZIMSEC Technical Graphics & CAD 7035 / 9182',
    description: 'Architectural floor plans, elevation views, BIM wall sections, FreeCAD parametric solid modeling & orthographic projections'
  },
  {
    id: 'three_d_printing_dynamics',
    name: '3D Printing Dynamics & Additive Manufacturing',
    group: 'STEM & Sciences',
    zimsecSyllabusCode: 'ZIMSEC Applied Technology & Additive Manufacturing',
    description: 'FDM/SLA slicer parameters, G-Code syntax, filament thermal physics, infill geometry, support overhangs & defect troubleshooting'
  },
  {
    id: 'food_technology',
    name: 'Food Technology & Design & Home Management',
    group: 'Agriculture & Practical',
    zimsecSyllabusCode: 'ZIMSEC Food Tech 7010',
    description: 'Nutrition, Food processing, Preservation & Home economics'
  },
  {
    id: 'metalwork_woodwork',
    name: 'Metalwork & Woodwork Technology',
    group: 'Agriculture & Practical',
    zimsecSyllabusCode: 'ZIMSEC Woodwork & Metalwork',
    description: 'Carpentry, Joinery, Metal fabrication & Workshop tools'
  },
  {
    id: 'textile_fashion',
    name: 'Textile Technology & Fashion Design',
    group: 'Agriculture & Practical',
    zimsecSyllabusCode: 'ZIMSEC Textiles 7012',
    description: 'Garment making, Weaving, Pattern drafting & Fabric care'
  },
  {
    id: 'physical_education',
    name: 'Physical Education, Sport & Mass Displays (PESMD)',
    group: 'Agriculture & Practical',
    zimsecSyllabusCode: 'ZIMSEC PESMD 6001',
    description: 'Sports science, Athletics, Mass displays & Health fitness'
  }
];

const CUSTOM_CATEGORIES_KEY = 'zimsec_custom_categories_v1';

export function getStoredCustomCategories(): CategoryItem[] {
  try {
    const saved = localStorage.getItem(CUSTOM_CATEGORIES_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error('Failed to parse custom categories from storage:', err);
  }
  return [];
}

export function saveCustomCategory(categoryName: string, syllabusCode?: string, description?: string): CategoryItem {
  const cleanName = categoryName.trim();
  const id = `custom_${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;
  
  const newCat: CategoryItem = {
    id,
    name: cleanName,
    group: 'Custom Categories',
    zimsecSyllabusCode: syllabusCode || 'Custom Syllabus Category',
    description: description || 'User-defined custom subject category',
    isCustom: true
  };

  const existing = getStoredCustomCategories();
  const updated = [...existing, newCat];
  try {
    localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save custom category:', err);
  }
  return newCat;
}

export function deleteCustomCategory(id: string): void {
  const existing = getStoredCustomCategories();
  const updated = existing.filter(c => c.id !== id);
  try {
    localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete custom category:', err);
  }
}

export function getAllCategories(): CategoryItem[] {
  const customCats = getStoredCustomCategories();
  return [...DEFAULT_ZIMSEC_CATEGORIES, ...customCats];
}
