# Typography Paragraph Phase D

## Existing source map

- `BookTypographySettings.body` owns body line height and legacy paragraph
  spacing; `BookTypographySettings.paragraphs` is the authoritative paragraph
  engine and now contains the complete structural rules.
- `ContentBlock.align`, `fontSize`, `fontFamily`, `lineHeight` and legacy
  `indentLevel` are whole-block fields. New paragraph-specific overrides live
  together in `ContentBlock.paragraphFormatting`.
- `EditorCanvas`, `FocusMode` and `PrintPreviewModal` previously used local
  padding/classes. `exportUtils` duplicated `text-indent`, margins and DOCX
  spacing. They now consume `resolveParagraphFormatting`.
- Chapter opening separation and front-matter rules remain format-specific and
  are not treated as body paragraphs.
- There is no semantic scene-break block. `pagebreak` remains a page break;
  arbitrary repeated characters are deliberately not inferred as scene breaks.

## Resolution and compatibility

Precedence is block override, contextual first-paragraph/after-heading/after-
image rule, book paragraph settings, then bounded safe values. Missing fields
from existing projects are normalized in memory against Legacy defaults without
changing stored revisions or appearance. New projects receive preset-aligned
paragraph rules.

Points are canonical. Conversion helpers support pt, mm, cm and inches, while
all resolved values are bounded. Indentation is metadata/CSS/DOCX paragraph
properties; manuscript strings never receive spaces, tabs or markup.

Browser print engines and EPUB readers may vary in widow/orphan enforcement.
DOCX uses paragraph indents and spacing without inserted tabs. Markdown remains
semantic and intentionally ignores visual paragraph layout.
