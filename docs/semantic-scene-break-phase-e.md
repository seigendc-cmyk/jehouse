# Semantic Scene Break Phase E

`scene-break` is declared in `src/types.ts`. `createSceneBreakBlock` creates an
empty-text block with structured style, alignment, point spacing and keep-next
metadata. Existing generic copy, duplicate, move, delete, import, versioning and
IndexedDB paths preserve the complete block; no migration is required.

The editor inserts after the active block through its normal `addBlock` path and
selects the new block. It has an explicit non-text renderer and settings for
Asterisms, Dots, Thin Rule, Ornament, Whitespace and safe Custom marks.
Ctrl+Shift+Enter is assigned because no existing shortcut used it.

Paragraph context skips captions and empty paragraph spacers. A scene break
remains context until the next meaningful block. A heading or image replaces
that context; quotes and other meaningful blocks stop it. Explicit paragraph
overrides beat scene-break suppression.

Print/PDF HTML, standalone HTML and EPUB use semantic `scene-break` classes.
DOCX uses one formatted paragraph with spacing and keep-next; Markdown emits a
marker only in the exported document. Stored manuscript text stays empty.
Whitespace breaks are visible as editorial placeholders only in the editor.

Rule weight, keep-next and pagination are layout intentions interpreted by each
browser, EPUB reader or word processor and may not paginate identically.
