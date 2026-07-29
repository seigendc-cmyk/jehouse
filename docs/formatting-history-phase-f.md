# Formatting history (Phase F)

PressCraft keeps a single, in-memory undo/redo history for explicit editor
formatting and structure commands. It is separate from browser-native text
editing history: key events originating in an input, textarea, or editable
element are never intercepted.

## Transaction boundary

The history controller records a complete `BookProject` before and after each
explicit command. Covered commands include block formatting, paragraph
formatting, text colour, scene-break insertion/deletion/movement/settings,
block structure operations, and the Apply action in Book Typography (including
paragraph presets and palettes). Modal preview state and Cancel create no
entries.

Undo and redo restore stable block IDs and the recorded active block where it
still exists; otherwise the editor selects the first safe block. Restored
projects travel through the normal dirty/autosave path, so an undone or redone
state can be saved locally and recovered offline.

## Memory and merging

The history is session-only and is never serialized into a project. It retains
at most 50 transactions. Consecutive updates sharing a merge key within 750 ms
collapse into one transaction, which keeps sliders and repeated formatting
clicks usable without filling the stack.

Whole-project snapshots are intentionally taken only at explicit formatting
boundaries—not on text keystrokes. Snapshot cost therefore scales with project
size but not typing rate. Small, medium, and large projects retain the same
50-entry bound; large documents use more bytes per entry, while continuous
prose typing adds none. If project sizes grow enough to make this noticeable,
the controller boundary permits replacing snapshots with command-specific
patches without changing editor integrations.

## Controls and lifecycle

The Home toolbar exposes Undo and Redo with disabled states and labels for the
next operation. `Ctrl/Cmd+Z` undoes formatting, and `Ctrl/Cmd+Y` or
`Ctrl/Cmd+Shift+Z` redoes it when focus is outside a text editor. Announcements
use a polite live region.

History clears on project creation, switching, deletion/close, stored-version
reload, recovery-copy creation, and active-project replacement. Saving,
autosaving, going offline, and reconnecting do not clear it.
