import type { AuthUser } from '@/src/contexts/auth/domain/auth.model';
import { authService } from '@/src/contexts/auth/application/auth.service';
import { createUserProfileService } from '@/src/contexts/profile/application/createUserProfileService';
import * as React from 'react';

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = React.useCallback(async (email: string, password: string) => {
    const nextUser = await authService.signIn(email, password);
    setUser(nextUser);
  }, []);

  const signUp = React.useCallback(async (email: string, password: string) => {
    const nextUser = await authService.signUp(email, password);
    setUser(nextUser);

    try {
      await createUserProfileService(nextUser.id).createDefaultProfile(nextUser.id);
    } catch {
      // Profile creation can recover on next load via getOrCreateProfile.
    }
  }, []);

  const signOut = React.useCallback(async () => {
    await authService.signOut();
    setUser(null);
  }, []);

  const value = React.useMemo(
    () => ({
      user,
      loading,
      signIn,
      signUp,
      signOut,
    }),
    [user, loading, signIn, signUp, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = React.useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }

  return context;
}
