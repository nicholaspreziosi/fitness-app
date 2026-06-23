import type { AuthUser } from '@/src/contexts/auth/domain/auth.model';
import { useColorScheme } from 'nativewind';
import { useLayoutEffect, useRef } from 'react';

type AppColorScheme = 'light' | 'dark';

export function useAuthColorScheme(user: AuthUser | null): AppColorScheme {
  const { colorScheme, setColorScheme } = useColorScheme();
  const preferredSchemeRef = useRef<AppColorScheme>('light');

  useLayoutEffect(() => {
    if (user) {
      return;
    }

    preferredSchemeRef.current = colorScheme === 'dark' ? 'dark' : 'light';
    setColorScheme('light');

    return () => {
      setColorScheme(preferredSchemeRef.current);
    };
  }, [user, setColorScheme]);

  return user ? (colorScheme === 'dark' ? 'dark' : 'light') : 'light';
}
