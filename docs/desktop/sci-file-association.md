# SCI Windows file association

An `.sci` file is a portable PressCraft SCI Book Project. Its registered type is
`PressCraft.SCIDocument`, display name is **PressCraft SCI Book Project**, description is
“Secure interactive publication created with PressCraft Book Publisher”, and MIME type is
`application/vnd.presscraft.sci`.

## Format and safety

SCI v1 is UTF-8 JSON containing a small `presscraft-sci` envelope around the canonical,
versioned `StoredProject`; it does not define another document model. Opening verifies the
extension, regular-file status, readability, 50 MiB maximum size, UTF-8/JSON shape, envelope
version, FNV-1a integrity checksum, canonical stored-project migration, identifier uniqueness,
prototype-pollution keys, and portable asset filenames. Future versions and un-migratable old
versions are rejected without modifying the source. The format contains data only: scripts and
HTML are never executed and network references are not fetched by the loader.

## Desktop opening and saving

Tauri receives quoted Windows arguments and the Rust boundary canonicalizes and reads only a
regular `.sci` file. On cold start arguments are queued until React subscribes. The official
single-instance plugin forwards warm-start arguments, restores/focuses the existing window, and
emits `presscraft://open-sci-files`. React then calls the same SCI parser used by the browser file
picker. With no multi-document UI, only the first valid argument opens and a controlled notice is
shown. Existing dirty-state protection attempts Save and offers a cancel-safe discard choice.

The external source path is session-only and is never serialized. Opening never writes the file.
Explicit Ctrl+S updates that path; normal IndexedDB autosave retains its existing behavior and does
not overwrite the external source.

For a project without an external source path, desktop Ctrl+S and “Save to Local Disk” create the
folder `%USERPROFILE%\Documents\Book Publisher` when necessary and save the project there as an
`.sci` file. Windows-invalid filename characters are replaced safely. Browser/PWA builds cannot
choose a folder without user permission, so they retain the platform file picker or download flow.

## Association and icon

`src-tauri/tauri.conf.json` declares `.sci`, its display metadata, MIME type, and Editor role in
Tauri's `bundle.fileAssociations`. Tauri's NSIS current-user installer owns registration/removal
and invokes the packaged executable with the selected path as one argument. The required source
icon is `assets/branding/sci-file-icon.png`; it has not been supplied. Place the unchanged official
PNG there and run `npm run desktop:icon:sci`. The generated `src-tauri/icons/sci-file.ico` contains
16, 24, 32, 48, 64, 128, and 256 pixel frames. The application icon remains separate under
`public/icons`. The official source and generated ICO are now present.

Tauri's portable file-association declaration does not expose a distinct Windows document-icon or
custom ProgID field. Before release, configure an installer-owned WiX/NSIS extension only if the
generated installer does not use `PressCraft.SCIDocument` and `sci-file.ico`; do not ship ad-hoc
registry scripts.

## Development and QA

Run `npm run desktop:icon:sci`, `npm run lint`, `npm test`, `npm run build`, then
`npm run desktop:build`. On Windows install the NSIS bundle from
`src-tauri/target/release/bundle/nsis/`, check the Explorer icon and Open command with paths
containing spaces, parentheses, apostrophes, Unicode, and a long path; test cold/warm opening,
invalid/corrupt/oversized files, dirty-work cancellation, and uninstall. Confirm uninstall removes
only PressCraft-owned association values. Browser/PWA imports remain available through the project
and export file pickers and use the same parser.

Known limitations: the current UI is single-document; Windows
installer/registry QA requires Rust, WebView2 tooling, and an installed bundle.
