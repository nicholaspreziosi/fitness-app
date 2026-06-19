import type { AuthUser } from './auth.model';

export interface AuthRepository {
  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void;
  signInWithEmail(email: string, password: string): Promise<AuthUser>;
  signUpWithEmail(email: string, password: string): Promise<AuthUser>;
  signOut(): Promise<void>;
}
