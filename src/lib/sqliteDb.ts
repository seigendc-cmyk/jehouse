import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import { BookProject, Chapter, ContentBlock } from '../types';
import { safeSaveItem, safeLoadItem } from './idbStorage';

let dbInstance: Database | null = null;
let SQL: SqlJsStatic | null = null;

const STORAGE_KEY = 'presscraft_sqlite_db_v1';

/**
 * Initialize the client-side SQLite WebAssembly engine and schema.
 */
export async function initSQLiteDB(): Promise<Database | null> {
  if (dbInstance) return dbInstance;

  try {
    SQL = await initSqlJs({
      locateFile: (file) => {
        if (file === 'sql-wasm.wasm') {
          return sqlWasmUrl || `https://cdn.jsdelivr.net/npm/sql.js@1.14.1/dist/${file}`;
        }
        return `https://cdn.jsdelivr.net/npm/sql.js@1.14.1/dist/${file}`;
      }
    });

    // Check if an existing SQLite binary is saved in IndexedDB / localStorage
    const savedDbBase64 = await safeLoadItem<string>(STORAGE_KEY);
    if (savedDbBase64) {
      try {
        const u8 = base64ToUint8Array(savedDbBase64);
        dbInstance = new SQL.Database(u8);
      } catch (err) {
        console.warn('Failed to parse existing SQLite binary, creating fresh DB:', err);
        dbInstance = new SQL.Database();
      }
    } else {
      dbInstance = new SQL.Database();
    }

    createSchema(dbInstance);
    await persistSQLiteDB(dbInstance);
    return dbInstance;
  } catch (err) {
    console.warn('Error initializing SQLite WASM (falling back to LocalStorage JSON store):', err);
    return null;
  }
}

/**
 * Create relational SQLite database schema
 */
function createSchema(db: Database) {
  db.run(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subtitle TEXT,
      author TEXT,
      category TEXT,
      isbn TEXT,
      publisher TEXT,
      trim_size TEXT,
      cloud_synced INTEGER DEFAULT 0,
      last_saved TEXT,
      metadata JSON
    );

    CREATE TABLE IF NOT EXISTS chapters (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      chapter_number INTEGER NOT NULL,
      title TEXT NOT NULL,
      word_count INTEGER DEFAULT 0,
      status TEXT DEFAULT 'draft',
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS blocks (
      id TEXT PRIMARY KEY,
      chapter_id TEXT NOT NULL,
      block_type TEXT NOT NULL,
      position INTEGER NOT NULL,
      block_text TEXT,
      block_data JSON,
      FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS db_audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL,
      operation TEXT NOT NULL,
      details TEXT
    );
  `);
}

/**
 * Persists the binary SQLite file into IndexedDB & LocalStorage
 */
export async function persistSQLiteDB(db?: Database | null) {
  const target = db || dbInstance;
  if (!target) return;
  try {
    const data = target.export();
    const base64 = uint8ArrayToBase64(data);
    await safeSaveItem(STORAGE_KEY, base64);
  } catch (err) {
    console.warn('Failed to persist SQLite DB binary:', err);
  }
}

/**
 * Save a complete BookProject model into relational SQLite tables
 */
export async function saveProjectToSQLite(project: BookProject): Promise<void> {
  const db = await initSQLiteDB();
  if (!db) return;

  try {
    db.run('BEGIN TRANSACTION;');

    // 1. Upsert project metadata
    const metadataJson = JSON.stringify({
      cover: project.cover,
      frontMatter: project.frontMatter,
      watermark: project.watermark,
      exportSettings: project.exportSettings,
      headerFooter: project.headerFooter,
      series: project.series
    });

    db.run(
      `INSERT OR REPLACE INTO projects 
       (id, title, subtitle, author, category, isbn, publisher, trim_size, cloud_synced, last_saved, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        project.id,
        project.title,
        project.subtitle || '',
        project.author,
        project.category,
        project.frontMatter?.isbn || '',
        project.frontMatter?.publisher || '',
        project.exportSettings?.trimSize || '6x9',
        project.cloudSynced ? 1 : 0,
        project.lastSaved || new Date().toISOString(),
        metadataJson
      ]
    );

    // Clear old chapters & blocks for this project to ensure clean sync
    db.run(`DELETE FROM blocks WHERE chapter_id IN (SELECT id FROM chapters WHERE project_id = ?);`, [project.id]);
    db.run(`DELETE FROM chapters WHERE project_id = ?;`, [project.id]);

    // 2. Insert chapters and blocks
    project.chapters.forEach((chapter, chIdx) => {
      db.run(
        `INSERT INTO chapters (id, project_id, chapter_number, title, word_count, status)
         VALUES (?, ?, ?, ?, ?, ?);`,
        [chapter.id, project.id, chapter.number, chapter.title, chapter.wordCount, 'published']
      );

      chapter.blocks.forEach((block, blkIdx) => {
        const { id, type, text, ...restBlockData } = block;
        db.run(
          `INSERT INTO blocks (id, chapter_id, block_type, position, block_text, block_data)
           VALUES (?, ?, ?, ?, ?, ?);`,
          [id, chapter.id, type, blkIdx, text || '', JSON.stringify(restBlockData)]
        );
      });
    });

    // Audit log entry
    db.run(
      `INSERT INTO db_audit_logs (timestamp, operation, details) VALUES (?, ?, ?);`,
      [new Date().toISOString(), 'UPSERT_PROJECT', `Project "${project.title}" saved to SQLite`]
    );

    db.run('COMMIT;');
    persistSQLiteDB(db);
  } catch (err) {
    db.run('ROLLBACK;');
    console.error('SQLite Save Error:', err);
    throw err;
  }
}

/**
 * Load a BookProject from SQLite database by ID (or get latest)
 */
export async function loadProjectFromSQLite(projectId?: string): Promise<BookProject | null> {
  const db = await initSQLiteDB();
  if (!db) return null;

  try {
    let projStmt;
    if (projectId) {
      projStmt = db.prepare(`SELECT * FROM projects WHERE id = ? LIMIT 1;`);
      projStmt.bind([projectId]);
    } else {
      projStmt = db.prepare(`SELECT * FROM projects ORDER BY rowid DESC LIMIT 1;`);
    }

    if (!projStmt.step()) {
      projStmt.free();
      return null;
    }

    const projRow = projStmt.getAsObject();
    projStmt.free();

    const metadata = projRow.metadata ? JSON.parse(projRow.metadata as string) : {};

    // Fetch chapters
    const chapters: Chapter[] = [];
    const chStmt = db.prepare(`SELECT * FROM chapters WHERE project_id = ? ORDER BY chapter_number ASC;`);
    chStmt.bind([projRow.id]);

    while (chStmt.step()) {
      const chRow = chStmt.getAsObject();
      const chapterId = chRow.id as string;

      // Fetch blocks for chapter
      const blocks: ContentBlock[] = [];
      const blkStmt = db.prepare(`SELECT * FROM blocks WHERE chapter_id = ? ORDER BY position ASC;`);
      blkStmt.bind([chapterId]);

      while (blkStmt.step()) {
        const blkRow = blkStmt.getAsObject();
        const blockData = blkRow.block_data ? JSON.parse(blkRow.block_data as string) : {};

        blocks.push({
          id: blkRow.id as string,
          type: blkRow.block_type as any,
          text: (blkRow.block_text as string) || '',
          ...blockData
        });
      }
      blkStmt.free();

      chapters.push({
        id: chapterId,
        number: Number(chRow.chapter_number),
        title: chRow.title as string,
        blocks: blocks,
        wordCount: Number(chRow.word_count)
      });
    }
    chStmt.free();

    const bookProject: BookProject = {
      id: projRow.id as string,
      title: projRow.title as string,
      subtitle: (projRow.subtitle as string) || '',
      author: projRow.author as string,
      category: projRow.category as any,
      cover: metadata.cover || { style: 'minimalist', primaryColor: '#1A1A1A', fontHeader: 'Cinzel', fontBody: 'EB Garamond' },
      frontMatter: metadata.frontMatter || { copyrightYear: '2026', editionNumber: '1st Edition' },
      watermark: metadata.watermark || { enabled: false, text: 'CONFIDENTIAL', opacity: 0.15 },
      exportSettings: metadata.exportSettings || {
        includeCover: true,
        includeFrontMatter: true,
        includeExecSummary: true,
        includeTOC: true,
        includeQuizzes: true,
        includeWatermark: false,
        includeFootnotes: true,
        trimSize: '6x9',
        fontPairing: 'Classic Serif',
        showRunningHeader: true,
        showPageNumbers: true
      },
      headerFooter: metadata.headerFooter,
      chapters: chapters,
      cloudSynced: Boolean(projRow.cloud_synced),
      lastSaved: (projRow.last_saved as string) || new Date().toISOString(),
      series: metadata.series
    };

    return bookProject;
  } catch (err) {
    console.error('Error loading project from SQLite:', err);
    return null;
  }
}

/**
 * Execute raw SQL query for SQLite inspector / developer tool
 */
export async function executeRawSQL(sqlQuery: string): Promise<{ columns: string[]; rows: any[][]; error?: string }> {
  try {
    const db = await initSQLiteDB();
    if (!db) {
      return { columns: ['Status'], rows: [['SQLite engine is unavailable in this environment. Falling back to local storage.']] };
    }
    const res = db.exec(sqlQuery);
    
    // Log operation
    db.run(
      `INSERT INTO db_audit_logs (timestamp, operation, details) VALUES (?, ?, ?);`,
      [new Date().toISOString(), 'RAW_SQL_EXEC', sqlQuery]
    );
    persistSQLiteDB(db);

    if (res.length === 0) {
      return { columns: ['Result'], rows: [['Query executed successfully with 0 rows returned.']] };
    }

    return {
      columns: res[0].columns,
      rows: res[0].values
    };
  } catch (err: any) {
    return {
      columns: ['Error'],
      rows: [],
      error: err.message || String(err)
    };
  }
}

/**
 * Get SQLite Database Statistics
 */
export async function getSQLiteStats(): Promise<{
  tablesCount: number;
  projectsCount: number;
  chaptersCount: number;
  blocksCount: number;
  dbSizeBytes: number;
}> {
  const db = await initSQLiteDB();
  if (!db) return { tablesCount: 0, projectsCount: 0, chaptersCount: 0, blocksCount: 0, dbSizeBytes: 0 };
  try {
    const pCount = db.exec('SELECT COUNT(*) FROM projects')[0]?.values[0][0] || 0;
    const cCount = db.exec('SELECT COUNT(*) FROM chapters')[0]?.values[0][0] || 0;
    const bCount = db.exec('SELECT COUNT(*) FROM blocks')[0]?.values[0][0] || 0;
    const exported = db.export();

    return {
      tablesCount: 4,
      projectsCount: Number(pCount),
      chaptersCount: Number(cCount),
      blocksCount: Number(bCount),
      dbSizeBytes: exported.byteLength
    };
  } catch (err) {
    return { tablesCount: 0, projectsCount: 0, chaptersCount: 0, blocksCount: 0, dbSizeBytes: 0 };
  }
}

/**
 * Download standard binary `.sqlite` database file
 */
export async function downloadSQLiteFile(): Promise<void> {
  const db = await initSQLiteDB();
  if (!db) return;
  const binary = db.export();
  const blob = new Blob([binary], { type: 'application/x-sqlite3' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `presscraft_offline_database_${new Date().toISOString().slice(0, 10)}.sqlite`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Helper utilities for Uint8Array base64 serialization
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
