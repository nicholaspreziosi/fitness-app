import { AuthError, type AuthUser } from '../domain/auth.model';
import type { AuthRepository } from '../domain/auth.repository';
import { firebaseAuthRepository } from '../infrastructure/firebaseAuth.repository';

export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    return this.authRepository.onAuthStateChanged(callback);
  }

  async signIn(email: string, password: string): Promise<AuthUser> {
    return this.authRepository.signInWithEmail(email, password);
  }

  async signUp(email: string, password: string): Promise<AuthUser> {
    return this.authRepository.signUpWithEmail(email, password);
  }

  async signOut(): Promise<void> {
    return this.authRepository.signOut();
  }
}

export const authService = new AuthService(firebaseAuthRepository);

export { AuthError };
