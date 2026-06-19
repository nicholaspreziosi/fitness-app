import { getFirebaseAuth } from '@/src/lib/firebase/app';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';

import type { AuthRepository } from '../domain/auth.repository';
import { AuthError } from '../domain/auth.model';
import { mapFirebaseAuthError, mapFirebaseUser } from './auth.mapper';

export class FirebaseAuthRepository implements AuthRepository {
  onAuthStateChanged(callback: (user: ReturnType<typeof mapFirebaseUser> | null) => void): () => void {
    const auth = getFirebaseAuth();

    if (!auth) {
      callback(null);
      return () => undefined;
    }

    return onAuthStateChanged(auth, (user) => {
      callback(user ? mapFirebaseUser(user) : null);
    });
  }

  async signInWithEmail(email: string, password: string) {
    const auth = getFirebaseAuth();

    if (!auth) {
      throw new AuthError('Firebase is not configured.', 'missing_config');
    }

    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      return mapFirebaseUser(credential.user);
    } catch (error) {
      throw mapFirebaseAuthError(error);
    }
  }

  async signUpWithEmail(email: string, password: string) {
    const auth = getFirebaseAuth();

    if (!auth) {
      throw new AuthError('Firebase is not configured.', 'missing_config');
    }

    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      return mapFirebaseUser(credential.user);
    } catch (error) {
      throw mapFirebaseAuthError(error);
    }
  }

  async signOut(): Promise<void> {
    const auth = getFirebaseAuth();

    if (!auth) {
      throw new AuthError('Firebase is not configured.', 'missing_config');
    }

    try {
      await firebaseSignOut(auth);
    } catch (error) {
      throw mapFirebaseAuthError(error);
    }
  }
}

export const firebaseAuthRepository = new FirebaseAuthRepository();
