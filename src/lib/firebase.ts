import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously, type User } from 'firebase/auth';
import { doc, getDoc, getFirestore, initializeFirestore, persistentLocalCache,
  persistentMultipleTabManager, runTransaction } from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';
import { isStoredProject, migrateStoredProject } from '../persistence/projectSchema';
import type { StoredProject } from '../persistence/types';

const app = getApps().length ? getApp() : initializeApp(firebaseConfigData);
let db: ReturnType<typeof getFirestore>;
try {
  db = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) }, firebaseConfigData.firestoreDatabaseId);
} catch {
  db = getFirestore(app, firebaseConfigData.firestoreDatabaseId);
}
export const auth = getAuth(app);
export { db };

export interface CloudProjectDocument {
  ownerId: string;
  projectId: string;
  remoteRevision: number;
  createdAt: string;
  updatedAt: string;
  record: StoredProject;
}

export class CloudSyncError extends Error {
  constructor(readonly code: 'AUTH' | 'CONFLICT' | 'TOO_LARGE' | 'NOT_FOUND' | 'INVALID_REMOTE' | 'FIREBASE', message: string, readonly cause?: unknown) {
    super(message); this.name = 'CloudSyncError';
  }
}

const MAX_CLOUD_DOCUMENT_BYTES = 900_000;
let authPromise: Promise<User> | undefined;

export function ensureFirebaseUser(): Promise<User> {
  if (auth.currentUser) return Promise.resolve(auth.currentUser);
  if (authPromise) return authPromise;
  authPromise = new Promise<User>((resolve, reject) => {
    const stop = onAuthStateChanged(auth, async (user) => {
      if (user) { stop(); resolve(user); return; }
      try { await signInAnonymously(auth); }
      catch (cause) { stop(); reject(new CloudSyncError('AUTH', 'Firebase anonymous sign-in is unavailable.', cause)); }
    }, (cause) => reject(new CloudSyncError('AUTH', 'Firebase authentication failed.', cause)));
  }).finally(() => { authPromise = undefined; });
  return authPromise;
}

export async function uploadStoredProject(record: StoredProject, expectedRemoteRevision?: number): Promise<CloudProjectDocument> {
  if (!isStoredProject(record)) throw new CloudSyncError('INVALID_REMOTE', 'The local project record is invalid.');
  if (new TextEncoder().encode(JSON.stringify(record)).byteLength > MAX_CLOUD_DOCUMENT_BYTES) {
    throw new CloudSyncError('TOO_LARGE', 'This project is too large for Firebase document sync. Export an SCI file instead.');
  }
  const user = await ensureFirebaseUser();
  const reference = doc(db, 'users', user.uid, 'projects', record.projectId);
  try {
    return await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(reference);
      const current = snapshot.exists() ? snapshot.data() as CloudProjectDocument : undefined;
      const actual = current?.remoteRevision ?? 0;
      if (expectedRemoteRevision !== undefined && actual !== expectedRemoteRevision) {
        throw new CloudSyncError('CONFLICT', `Cloud revision ${actual} is newer than the expected revision ${expectedRemoteRevision}.`);
      }
      const now = new Date().toISOString();
      const next: CloudProjectDocument = { ownerId: user.uid, projectId: record.projectId,
        remoteRevision: actual + 1, createdAt: current?.createdAt ?? now, updatedAt: now,
        record: structuredClone(record) };
      transaction.set(reference, next);
      return next;
    });
  } catch (cause) {
    if (cause instanceof CloudSyncError) throw cause;
    throw new CloudSyncError('FIREBASE', 'Firebase could not upload this project.', cause);
  }
}

export async function downloadStoredProject(projectId: string): Promise<CloudProjectDocument> {
  const user = await ensureFirebaseUser();
  try {
    const snapshot = await getDoc(doc(db, 'users', user.uid, 'projects', projectId));
    if (!snapshot.exists()) throw new CloudSyncError('NOT_FOUND', 'No cloud copy exists for this project.');
    const value = snapshot.data() as Partial<CloudProjectDocument>;
    const record = migrateStoredProject(value.record);
    if (value.ownerId !== user.uid || value.projectId !== projectId || !Number.isInteger(value.remoteRevision) || !record) {
      throw new CloudSyncError('INVALID_REMOTE', 'The cloud project record is invalid or incompatible.');
    }
    return { ...value, record } as CloudProjectDocument;
  } catch (cause) {
    if (cause instanceof CloudSyncError) throw cause;
    throw new CloudSyncError('FIREBASE', 'Firebase could not download this project.', cause);
  }
}
