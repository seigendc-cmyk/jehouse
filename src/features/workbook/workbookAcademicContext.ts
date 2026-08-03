import { WorkbookAcademicContext } from '../../types';
import type { GradeLevel } from '../../educationalBooks/types';

export function translateGradeLevelToEducationLevel(gradeLevel: GradeLevel): string {
  switch (gradeLevel) {
    case 'zimsec_primary': return 'Primary';
    case 'zimsec_secondary': return 'Secondary';
    case 'zimsec_a_level': return 'Advanced Level';
    case 'primary': return 'Primary';
    case 'middle': return 'Secondary';
    case 'high': return 'Advanced Level';
    default: return 'Primary';
  }
}

export function translateEducationLevelToGradeLevel(educationLevel: string): GradeLevel {
  switch (educationLevel) {
    case 'Primary': return 'primary';
    case 'Secondary': return 'middle';
    case 'Advanced Level': return 'zimsec_a_level';
    case 'Early Childhood Development': return 'primary';
    case 'Tertiary': return 'high';
    case 'Professional': return 'high';
    case 'Custom': return 'primary';
    default: return 'primary';
  }
}

export function resolveGradeLabelForLevel(gradeLevel: GradeLevel): string {
  switch (gradeLevel) {
    case 'zimsec_primary': return 'Grade 6';
    case 'zimsec_secondary': return 'Form 3';
    case 'zimsec_a_level': return 'Lower Sixth';
    case 'primary': return 'Grade 6';
    case 'middle': return 'Form 3';
    case 'high': return 'Grade 10';
    default: return 'Grade 6';
  }
}

const EDUCATION_LEVELS = [
  'Early Childhood Development',
  'Primary',
  'Secondary',
  'Advanced Level',
  'Tertiary',
  'Professional',
  'Custom'
] as const;

export function getEducationLevels(): readonly string[] {
  return EDUCATION_LEVELS;
}

export function isEducationLevel(value: string): value is WorkbookAcademicContext['educationLevel'] {
  return (EDUCATION_LEVELS as readonly string[]).includes(value);
}

const GRADE_OPTIONS: Record<string, string[]> = {
  'Early Childhood Development': ['ECD A', 'ECD B'],
  'Primary': ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7'],
  'Secondary': ['Form 1', 'Form 2', 'Form 3', 'Form 4'],
  'Advanced Level': ['Lower Sixth', 'Upper Sixth']
};

export function getGradeOptions(educationLevel: string): string[] {
  if (GRADE_OPTIONS[educationLevel]) {
    return GRADE_OPTIONS[educationLevel];
  }
  return [];
}

const SUBJECT_OPTIONS: Record<string, string[]> = {
  'Primary': ['Mathematics', 'English', 'Heritage Studies', 'Agriculture', 'Combined Science', 'Shona', 'Ndebele', 'Creative Arts', 'Physical Education'],
  'Secondary': ['Mathematics', 'English', 'Heritage Studies', 'Agriculture', 'Combined Science', 'Shona', 'Ndebele', 'Creative Arts', 'Physical Education', 'Biology', 'Chemistry', 'Physics', 'History', 'Geography'],
  'Advanced Level': ['Mathematics', 'English Literature', 'Heritage Studies', 'Agriculture', 'Biology', 'Chemistry', 'Physics', 'History', 'Geography', 'Economics', 'Shona', 'Ndebele'],
  'Early Childhood Development': ['Creative Arts', 'Physical Education', 'Language Development', 'Numeracy'],
  'Tertiary': ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Business Studies', 'Law', 'Medicine'],
  'Professional': ['Management', 'Accounting', 'ICT', 'Marketing', 'Human Resources'],
  'Custom': []
};

export function getSubjectOptions(educationLevel: string): string[] {
  const level = educationLevel === 'zimsec_primary' ? 'Primary'
    : educationLevel === 'zimsec_secondary' ? 'Secondary'
    : educationLevel === 'zimsec_a_level' ? 'Advanced Level'
    : educationLevel;
  if (SUBJECT_OPTIONS[level]) {
    return SUBJECT_OPTIONS[level];
  }
  return [];
}

export function resolveGradeLabel(educationLevel: string, gradeId?: string): string {
  if (gradeId && GRADE_OPTIONS[educationLevel]?.includes(gradeId)) {
    return gradeId;
  }
  const options = getGradeOptions(educationLevel);
  return options.length > 0 ? options[0] : 'Unspecified Grade';
}

export function resolveSubjectLabel(educationLevel: string, subjectId?: string): string {
  if (subjectId && getSubjectOptions(educationLevel).includes(subjectId)) {
    return subjectId;
  }
  const options = getSubjectOptions(educationLevel);
  return options.length > 0 ? options[0] : 'Unspecified Subject';
}

export function createDefaultAcademicContext(): WorkbookAcademicContext {
  return {
    educationLevel: 'Primary',
    gradeLabel: 'Grade 6',
    subjectLabel: 'Heritage Studies'
  };
}

export function normalizeAcademicContext(
  context: Partial<WorkbookAcademicContext>
): WorkbookAcademicContext {
  const educationLevel = context.educationLevel || 'Primary';
  const gradeLabel = context.gradeLabel || resolveGradeLabel(educationLevel, context.gradeId);
  const subjectLabel = context.subjectLabel || resolveSubjectLabel(educationLevel, context.subjectId);

  return {
    curriculumId: context.curriculumId,
    educationLevel,
    gradeId: context.gradeId,
    gradeLabel,
    subjectId: context.subjectId,
    subjectLabel,
    customLevelLabel: context.customLevelLabel,
    customGradeLabel: context.customGradeLabel,
    customSubjectLabel: context.customSubjectLabel
  };
}
