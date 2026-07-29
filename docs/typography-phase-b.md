# Typography Phase B

## Authority and compatibility

`BookProject.typography` is the single versioned typography authority. It is
available to the editor, preview and exporters without coupling document design
to physical export settings. `ExportSettings` continues to own trim,
orientation, margins, hyphenation and installed font selections. Explicit
`ContentBlock` font fields remain local overrides and are not duplicated into
the book model. Front-matter and cover typography remain format-specific.

Stored-project schema version 2 adds typography schema version 1. A version 1
stored project receives a cloned `legacy` configuration during migration.
Migration does not change document IDs, chapter titles, blocks, page settings,
margins or revisions. Resolving a project that has not yet passed through the
stored-record migration returns a transient Legacy clone and does not mark the
project dirty.

New fiction, trade and general projects use `modern-bold`. Projects whose
existing category is `Academic & Textbook` use `academic`. No title inference is
performed.

## Format mapping

- Print preview and PDF/print HTML use effective CSS values and the existing
  explicit chapter-opening/continuation page roles.
- DOCX maps chapter hierarchy, alignment, size, weight, colour and spacing to
  Word heading paragraphs. Divider width and browser font fallback stacks do
  not have exact DOCX equivalents.
- EPUB and HTML use semantic chapter headings with equivalent CSS.
- Markdown retains semantic headings and intentionally carries no decorative
  typography.
- Legacy keeps the previous preview classes and existing export font-pairing
  resolution. Trim scaling is intentionally disabled for Legacy.

Browser-driven overflow pagination, chapter-level overrides, palette editing,
drop caps, advanced indent controls, bullets and numbering remain outside this
phase.
