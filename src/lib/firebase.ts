import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import firebaseConfigData from '../../firebase-applet-config.json';
import { BookProject } from '../types';

const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId
};

// Initialize App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with Multi-Tab Persistent Local Cache for Offline-First Architecture
let db: ReturnType<typeof getFirestore>;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  }, firebaseConfigData.firestoreDatabaseId || '(default)');
} catch (e) {
  // If already initialized
  db = getFirestore(app, firebaseConfigData.firestoreDatabaseId || '(default)');
}

// Initialize Auth
export const auth = getAuth(app);

// Sign in anonymously on launch for persistent sync identity
let currentUser: User | null = null;

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (!user) {
    signInAnonymously(auth).catch((err) => {
      console.warn('[Firebase Auth] Anonymous sign-in notice:', err);
    });
  }
});

export function getCurrentUserId(): string {
  return currentUser?.uid || 'offline-local-user';
}

/**
 * Syncs a single book project to Firestore cloud
 */
export async function syncProjectToCloud(project: BookProject): Promise<boolean> {
  try {
    const userId = getCurrentUserId();
    const docRef = doc(db, 'projects', project.id);
    
    // Clean undefined fields or invalid symbols before pushing to firestore
    const cleanProject = JSON.parse(JSON.stringify({
      ...project,
      userId,
      updatedAt: new Date().toISOString()
    }));

    await setDoc(docRef, cleanProject, { merge: true });
    return true;
  } catch (err) {
    console.warn('[Firebase Cloud Sync] Offline or save deferred:', err);
    return false;
  }
}

/**
 * Fetch all cloud projects saved under user session
 */
export async function fetchUserCloudProjects(): Promise<BookProject[]> {
  try {
    const userId = getCurrentUserId();
    const q = query(collection(db, 'projects'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    
    const projects: BookProject[] = [];
    snapshot.forEach((doc) => {
      projects.push(doc.data() as BookProject);
    });
    return projects;
  } catch (err) {
    console.warn('[Firebase Cloud Sync] Failed fetching cloud projects (offline?):', err);
    return [];
  }
}

/**
 * Subscribe to real-time changes on active project
 */
export function subscribeToProject(
  projectId: string, 
  onUpdate: (project: BookProject) => void
) {
  const docRef = doc(db, 'projects', projectId);
  return onSnapshot(
    docRef, 
    (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data() as BookProject);
      }
    },
    (error) => {
      console.warn('[Firebase Realtime] Listener error (offline):', error);
    }
  );
}

/**
 * Delete project from Cloud
 */
export async function deleteCloudProject(projectId: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'projects', projectId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.warn('[Firebase Cloud Sync] Failed deleting cloud project:', err);
    return false;
  }
}

export { db };
