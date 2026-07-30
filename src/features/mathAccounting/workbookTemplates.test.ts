import { describe, expect, it } from 'vitest';
import { createWorkbookTemplateChapters, WorkbookTemplateId } from './workbookTemplates';

describe('publishing workbook templates', () => {
  const templates: WorkbookTemplateId[] = [
    'mathematics-workbook',
    'accounting-workbook',
    'teacher-mathematics',
    'teacher-accounting'
  ];

  for (const template of templates) {
    it(`creates the ${template} from structured starter blocks`, () => {
      let sequence = 0;
      const chapters = createWorkbookTemplateChapters(template, (prefix) => `${prefix}-${++sequence}`);
      expect(chapters).toHaveLength(1);
      expect(new Set(chapters[0].blocks.map((block) => block.id)).size).toBe(chapters[0].blocks.length);
      expect(chapters[0].blocks.every((block) => !('html' in block))).toBe(true);
      if (template.includes('mathematics')) {
        expect(chapters[0].blocks.some((block) => block.mathData?.source.includes('\\frac'))).toBe(true);
        expect(chapters[0].blocks.some((block) => block.mathData?.source.includes('\\boxed'))).toBe(true);
      } else {
        expect(chapters[0].blocks.some((block) => block.type === 'journal-entry')).toBe(true);
        expect(chapters[0].blocks.some((block) => block.type === 'trial-balance')).toBe(true);
        expect(chapters[0].blocks.some((block) => block.type === 'financial-statement')).toBe(true);
      }
    });
  }
});
