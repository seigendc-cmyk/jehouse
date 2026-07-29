# Semantic drop caps (Phase G)

## Audit and model

Drop caps did not previously exist. Paragraph context skips captions and empty
paragraphs and stops at semantic scene breaks, headings, images, or other
content. The authoritative, versioned project configuration is
`BookTypographySettings.dropCaps`; optional whole-paragraph overrides live at
`ContentBlock.dropCapFormatting`. Neither model stores a copied letter or
changes `ContentBlock.text`.

Stored-project schema version 5 adds disabled `legacy` settings to existing
projects. Migration is deterministic and idempotent and adds no block
overrides. New fiction/trade projects use the Modern Fiction chapter-opening
default; Academic projects remain disabled. Choosing another general typography
preset in an existing book preserves its current drop-cap configuration.

## Character and context rules

The resolver scans Unicode code points, ignores leading whitespace, and selects
the first Unicode letter or number. Straight/curly quotes, apostrophes,
parentheses, and other opening punctuation remain inline; only the letter is
styled. This guarantees that text is emitted once. Empty paragraphs and
symbol-only openings fall back to ordinary text.

Automatic caps apply only to non-empty paragraph blocks. Configuration supports
chapter-only, chapter-and-scene, chapter/scene/heading, and manual-only
contexts. Captions, quotes, headings, scene breaks, images, code, clauses, list
items, and metadata never qualify automatically. An explicit block override
wins. Hanging indentation disables the cap; active caps resolve first-line
indent to zero while preserving left/right indents and paragraph spacing.

Colour precedence is block drop-cap colour, project custom colour, configured
palette role (accent, chapter title, or body), body colour, then black. It does
not modify the block text colour. The palette schema therefore did not need a
new role.

## Rendering and exports

Print Preview and non-editing Focus Mode use the shared resolver and one
semantic span in the original text flow. Focused Focus Mode and the main editor
keep the complete textarea as the only text surface. The main editor shows a
coloured inset cue and resolves indentation but intentionally does not mirror
the first character; this preserves caret, selection, clipboard, zoom, and
screen-reader behavior.

Print/PDF HTML, standalone HTML, and EPUB use semantic `.drop-cap-*` spans.
Dropped and in-margin styles float; raised stays inline. DOCX uses three runs
(prefix, enlarged opening run, remainder), the safest supported fallback in the
current library. In-margin maps to that enlarged-run fallback. Markdown remains
plain manuscript text. Small caps for following words remains disabled because
the editor has no inline-run model and equivalent cross-format presentation
would otherwise be unreliable.

Project Apply creates one Phase F typography transaction. Block controls use
the existing `updateBlock` formatting path, including merge, undo/redo,
autosave, and offline persistence. Preview and Cancel remain local.
