import { isTabRootSegments, shouldShowAppHeader } from '@/src/ui/shared/hooks/useShowAppHeader';

jest.mock('expo-router', () => ({
  useSegments: () => [],
}));

describe('useShowAppHeader route detection', () => {
  it('shows on dashboard root', () => {
    expect(isTabRootSegments(['(tabs)'])).toBe(true);
  });

  it('shows on tab index routes without the index segment', () => {
    expect(isTabRootSegments(['(tabs)', 'library'])).toBe(true);
    expect(isTabRootSegments(['(tabs)', 'settings'])).toBe(true);
  });

  it('shows on dashboard tab', () => {
    expect(isTabRootSegments(['(tabs)', 'home'])).toBe(true);
  });

  it('hides on nested stack screens', () => {
    expect(isTabRootSegments(['(tabs)', 'library', 'exercises', 'new'])).toBe(false);
    expect(isTabRootSegments(['(tabs)', 'library', 'exercises', '123'])).toBe(false);
  });
});

describe('shouldShowAppHeader', () => {
  it('hides the navbar on native and on narrow web', () => {
    expect(shouldShowAppHeader('ios', 390, ['(tabs)', 'settings'])).toBe(false);
    expect(shouldShowAppHeader('android', 800, ['(tabs)', 'home'])).toBe(false);
    expect(shouldShowAppHeader('web', 390, ['(tabs)', 'settings'])).toBe(false);
  });

  it('shows the navbar on wide web tab roots', () => {
    expect(shouldShowAppHeader('web', 1024, ['(tabs)', 'settings'])).toBe(true);
    expect(shouldShowAppHeader('web', 1024, ['(tabs)', 'library', 'exercises', 'new'])).toBe(
      false
    );
  });
});
