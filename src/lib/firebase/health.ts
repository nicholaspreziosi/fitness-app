import { collection, getDocs, limit, query } from 'firebase/firestore';

import { getFirebaseConfig } from './config';
import { getFirebaseApp, getFirestoreDb } from './app';
import { mapFirestoreError } from '@/src/contexts/shared/infrastructure/firestore.request';

export type FirebaseHealthResult =
  | { status: 'missing_config' }
  | { status: 'connected'; projectId: string }
  | { status: 'error'; message: string };

export async function checkFirebaseConnection(userId?: string): Promise<FirebaseHealthResult> {
  const config = getFirebaseConfig();
  if (!config) {
    return { status: 'missing_config' };
  }

  const app = getFirebaseApp();
  const db = getFirestoreDb();

  if (!app || !db) {
    return { status: 'error', message: 'Firebase failed to initialize.' };
  }

  try {
    if (userId) {
      await getDocs(query(collection(db, 'users', userId, 'exercises'), limit(1)));
    }

    return { status: 'connected', projectId: config.projectId };
  } catch (error) {
    const mapped = mapFirestoreError(error, 'Unable to reach Firestore.');
    return { status: 'error', message: mapped.message };
  }
}
