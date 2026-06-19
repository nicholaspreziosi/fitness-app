import { Platform } from 'react-native';
import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  type Firestore,
} from 'firebase/firestore';

import { getFirebaseConfig } from './config';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

function createFirestoreInstance(firebaseApp: FirebaseApp): Firestore {
  if (Platform.OS === 'web') {
    try {
      return initializeFirestore(firebaseApp, {
        experimentalForceLongPolling: true,
      });
    } catch {
      return getFirestore(firebaseApp);
    }
  }

  return getFirestore(firebaseApp);
}

export function getFirebaseApp(): FirebaseApp | null {
  const config = getFirebaseConfig();
  if (!config) {
    return null;
  }

  if (!app) {
    app = getApps().length > 0 ? getApps()[0]! : initializeApp(config);
  }

  return app;
}

export function getFirebaseAuth(): Auth | null {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) {
    return null;
  }

  if (!auth) {
    auth = getAuth(firebaseApp);
  }

  return auth;
}

export function getFirestoreDb(): Firestore | null {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) {
    return null;
  }

  if (!db) {
    db = createFirestoreInstance(firebaseApp);
  }

  return db;
}
