/**
 * Native IndexedDB Key-Value Storage Helper
 * Solves the 5MB browser localStorage QuotaExceededError by providing
 * asynchronous, high-capacity IndexedDB persistence (up to 1GB+).
 */

const DB_NAME = 'presscraft_indexeddb_v1';
const STORE_NAME = 'presscraft_keyval';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function setIDBItem<T>(key: string, value: T): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn(`[IndexedDB] Save warning for key "${key}":`, err);
  }
}

export async function getIDBItem<T>(key: string): Promise<T | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve((req.result as T) ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn(`[IndexedDB] Get warning for key "${key}":`, err);
    return null;
  }
}

export async function removeIDBItem(key: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn(`[IndexedDB] Remove warning for key "${key}":`, err);
  }
}

/**
 * Safe storage setter that saves to IndexedDB first (no 5MB quota restriction),
 * then gracefully syncs to localStorage without throwing unhandled quota exceptions.
 */
export async function safeSaveItem<T>(key: string, value: T): Promise<void> {
  // 1. Save to high-capacity IndexedDB
  await setIDBItem(key, value);

  // 2. Safely attempt localStorage backup without throwing quota errors
  try {
    const stringified = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, stringified);
  } catch (e: any) {
    // Catch quota errors silently or attempt pruning old items
    if (
      e?.name === 'QuotaExceededError' ||
      e?.code === 22 ||
      e?.code === 1014 ||
      (typeof e?.message === 'string' && e.message.includes('exceeded the quota'))
    ) {
      console.info(`[Storage] LocalStorage quota reached for "${key}". Content safely stored in IndexedDB.`);
      
      // If saving project state, try freeing space in localStorage by clearing large binaries
      try {
        if (key === 'presscraft_book_project') {
          localStorage.removeItem('presscraft_sqlite_db_v1');
          const stringified = typeof value === 'string' ? value : JSON.stringify(value);
          localStorage.setItem(key, stringified);
        }
      } catch {
        // Ignored; IndexedDB already has the full persistent copy
      }
    } else {
      console.warn(`[Storage] Storage notice for "${key}":`, e);
    }
  }
}

/**
 * Safe storage loader. Checks IndexedDB first (for latest high-res content),
 * then falls back to localStorage.
 */
export async function safeLoadItem<T>(key: string): Promise<T | null> {
  try {
    // 1. Try IndexedDB
    const idbVal = await getIDBItem<T>(key);
    if (idbVal !== null) {
      return idbVal;
    }

    // 2. Fall back to localStorage
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          return JSON.parse(raw) as T;
        } catch {
          return raw as unknown as T;
        }
      }
    }
  } catch (err) {
    console.warn(`[Storage] Load warning for key "${key}":`, err);
  }
  return null;
}
