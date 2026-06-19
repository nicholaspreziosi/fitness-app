import { isTabRootSegments } from '@/src/ui/shared/hooks/useShowAppHeader';

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
