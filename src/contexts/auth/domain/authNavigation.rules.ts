import type { AuthUser } from '@/src/contexts/auth/domain/auth.model';

export function canAccessAppRoutes(user: AuthUser | null): boolean {
  return user !== null;
}

export function canAccessAuthRoutes(user: AuthUser | null): boolean {
  return user === null;
}

export function shouldShowAuthLoading(loading: boolean): boolean {
  return loading;
}
