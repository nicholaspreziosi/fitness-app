jest.mock('expo-router', () => ({
  DarkTheme: { colors: {} },
  DefaultTheme: { colors: {} },
}));

import { THEME } from '@/lib/theme';

const SEMANTIC_KEYS = [
  'background',
  'foreground',
  'surface',
  'surfaceElevated',
  'muted',
  'mutedForeground',
  'border',
  'primary',
  'primaryForeground',
  'accent',
  'accentForeground',
  'destructive',
  'success',
  'warning',
] as const;

describe('THEME', () => {
  it.each(['light', 'dark'] as const)('exposes semantic color keys for the %s scheme', (scheme) => {
    for (const key of SEMANTIC_KEYS) {
      expect(typeof THEME[scheme][key]).toBe('string');
      expect(THEME[scheme][key].length).toBeGreaterThan(0);
    }
  });

  it.each(['light', 'dark'] as const)(
    'aliases surface tokens to existing card and popover colors in %s',
    (scheme) => {
      expect(THEME[scheme].surface).toBe(THEME[scheme].card);
      expect(THEME[scheme].surfaceElevated).toBe(THEME[scheme].popover);
      expect(THEME[scheme].card.length).toBeGreaterThan(0);
      expect(THEME[scheme].brandInk.length).toBeGreaterThan(0);
    }
  );
});
