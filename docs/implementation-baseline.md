# PressCraft offline-first implementation baseline

Recorded: 2026-07-29 (Africa/Harare)

## Safety baseline

- Workspace: `D:\book-publisher`
- Parent Git repository before initialization: none
- File count before initialization: 24,949 (included `node_modules` and `dist`)
- Tracked audited source files: 97
- Full backup: `C:\tmp\book-publisher-baseline-20260729-090343.tar`
- Backup size: 431,322,624 bytes
- Backup entries: 29,404
- Backup SHA-256: `A62E5375CF92669F088627697C34A84A41C0C0C8B00E25FB047DD79D7C465308`
- Baseline commit: `b0d1b7202a800e21e21cf934273985de1eddc669`
- Implementation branch: `feature/offline-first-pwa-editor-shell`

## Baseline validation

- Node: 24.14.0
- npm: 11.9.0
- TypeScript (`npm run lint`): passed
- Production build (`npm run build`): passed
- Build warnings: large main bundle and a mixed static/dynamic `bibtexUtils` import

## Installed top-level package versions

- `@google/genai` 2.13.0
- `@tailwindcss/vite` 4.3.3
- `@vitejs/plugin-react` 5.2.0
- `docx` 9.7.1
- `dotenv` 17.4.2
- `esbuild` 0.25.12
- `express` 4.22.2
- `firebase` 12.16.0
- `katex` 0.18.1
- `lucide-react` 0.546.0
- `motion` 12.42.2
- `react` / `react-dom` 19.2.8
- `recharts` 3.10.1
- `sql.js` 1.14.1
- `tsx` 4.23.1
- `typescript` 5.8.3
- `vite` 6.4.3

## Firebase baseline

- Configuration is loaded from `firebase-applet-config.json`.
- Authentication uses anonymous Firebase Authentication.
- Firestore uses a named database and enables the Firebase persistent multi-tab local cache.
- Complete projects were written with blind `setDoc(..., { merge: true })`.
- Cloud reads were merged into React state during startup without revision comparison.
- `firestore.rules` allowed all reads and writes. This is unsafe; Phase 3 production sync
  must not be enabled until owner-isolated, revision-validating rules replace it.

## Persistence baseline

- React state held the active editing model.
- `presscraft_all_projects` and `presscraft_book_project` were read from and written to
  both IndexedDB key-value storage and localStorage.
- Every active project update also rewrote a complete SQLite relational mirror.
- Every online active project update triggered a blind Firestore merge.
- The Firebase response could replace local state during startup.

## Phase 1 result

- Authoritative database: IndexedDB database `presscraft_projects`, version 1.
- Stores: `projects`, `projectVersions`, `metadata`, and reserved `syncQueue`.
- Complete local saves now use optimistic `localRevision` checks.
- Legacy IndexedDB, localStorage, and SQLite records are inspected without deletion.
- Migrated localStorage records are retained and marked with
  `presscraft_legacy_projects_migrated_v1`.
- Ambiguous unique records are retained as real recovery versions.
- Automatic complete-project SQLite writes and full-project localStorage writes were
  removed from `App.tsx`.
- SQLite remains available for explicit inspection, export, migration, and recovery.
- Firebase startup merging was removed. Revision-aware cloud synchronization remains
  deferred to Phase 3.
