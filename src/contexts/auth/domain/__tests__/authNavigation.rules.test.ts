import type { AuthUser } from '@/src/contexts/auth/domain/auth.model';
import {
  canAccessAppRoutes,
  canAccessAuthRoutes,
  shouldShowAuthLoading,
} from '@/src/contexts/auth/domain/authNavigation.rules';

describe('authNavigation.rules', () => {
  const user: AuthUser = { id: 'user-123', email: 'you@example.com' };

  it('shows loading while auth state is resolving', () => {
    expect(shouldShowAuthLoading(true)).toBe(true);
    expect(shouldShowAuthLoading(false)).toBe(false);
  });

  it('allows authenticated users to access protected app routes', () => {
    expect(canAccessAppRoutes(user)).toBe(true);
    expect(canAccessAuthRoutes(user)).toBe(false);
  });

  it('redirects unauthenticated users to auth routes', () => {
    expect(canAccessAppRoutes(null)).toBe(false);
    expect(canAccessAuthRoutes(null)).toBe(true);
  });
});
