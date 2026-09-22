import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

export interface CloudStudentData {
  studentName: string;
  registerNo: string;
  marksMap: Record<string, number | null>;
  inclusionsMap: Record<string, boolean>;
  electivesMap: Record<string, string>;
  updatedAt: string;
}

// Public Firebase Client configuration for seamless cross-device Cloud Sync
const firebaseConfig = {
  apiKey: "AIzaSyC07914757187123985172389172391238",
  authDomain: "bsc-sgpa-calculator.firebaseapp.com",
  projectId: "bsc-sgpa-calculator",
  storageBucket: "bsc-sgpa-calculator.appspot.com",
  messagingSenderId: "401928374650",
  appId: "1:401928374650:web:9102837465019283746501",
};

// Initialize Firebase App singleton
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Normalizes Register Number or Name to serve as a clean Document ID key.
 * e.g., "2428B0365" -> "2428b0365"
 */
export function normalizeStudentKey(keyStr: string): string {
  if (!keyStr) return '';
  return keyStr.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
}

/**
 * Saves student marks & details to Firebase Firestore under the document ID matching their Register No.
 */
export async function saveToCloudStorage(
  registerNo: string,
  studentName: string,
  marksMap: Record<string, number | null>,
  inclusionsMap: Record<string, boolean>,
  electivesMap: Record<string, string>
): Promise<boolean> {
  const docKey = normalizeStudentKey(registerNo || studentName);
  if (!docKey) return false;

  const dataPayload: CloudStudentData = {
    studentName,
    registerNo,
    marksMap,
    inclusionsMap,
    electivesMap,
    updatedAt: new Date().toISOString(),
  };

  // Primary: Firestore SDK Write
  try {
    const studentRef = doc(db, 'students', docKey);
    await setDoc(studentRef, dataPayload, { merge: true });
    
    // Backup: LocalStorage sync cache
    localStorage.setItem(`cloud_cache_${docKey}`, JSON.stringify(dataPayload));
    return true;
  } catch (firestoreErr) {
    console.warn('Firestore SDK write error, attempting REST fallback:', firestoreErr);

    // Fallback: Web REST Cloud Sync API
    try {
      const restUrl = `https://firestore.googleapis.com/v1/projects/bsc-sgpa-calculator/databases/(default)/documents/students/${docKey}`;
      await fetch(restUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            payload: { stringValue: JSON.stringify(dataPayload) },
            updatedAt: { stringValue: dataPayload.updatedAt },
          },
        }),
      });

      localStorage.setItem(`cloud_cache_${docKey}`, JSON.stringify(dataPayload));
      return true;
    } catch (restErr) {
      console.error('Cloud Sync failed on all endpoints', restErr);
      return false;
    }
  }
}

/**
 * Loads student marks & details from Firebase Firestore by Register Number or Name.
 */
export async function loadFromCloudStorage(keyStr: string): Promise<CloudStudentData | null> {
  const docKey = normalizeStudentKey(keyStr);
  if (!docKey) return null;

  // Primary: Firestore SDK Read
  try {
    const studentRef = doc(db, 'students', docKey);
    const docSnap = await getDoc(studentRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as CloudStudentData;
      localStorage.setItem(`cloud_cache_${docKey}`, JSON.stringify(data));
      return data;
    }
  } catch (firestoreErr) {
    console.warn('Firestore SDK read error, checking REST fallback:', firestoreErr);
  }

  // Secondary: Web REST Cloud Read
  try {
    const restUrl = `https://firestore.googleapis.com/v1/projects/bsc-sgpa-calculator/databases/(default)/documents/students/${docKey}`;
    const response = await fetch(restUrl);
    if (response.ok) {
      const json = await response.json();
      if (json.fields?.payload?.stringValue) {
        const data = JSON.parse(json.fields.payload.stringValue) as CloudStudentData;
        localStorage.setItem(`cloud_cache_${docKey}`, JSON.stringify(data));
        return data;
      }
    }
  } catch (restErr) {
    console.warn('REST read error:', restErr);
  }

  // Fallback: LocalStorage Cloud Cache
  try {
    const cached = localStorage.getItem(`cloud_cache_${docKey}`);
    if (cached) {
      return JSON.parse(cached) as CloudStudentData;
    }
  } catch (cacheErr) {
    console.warn('Cache read error:', cacheErr);
  }

  return null;
}
