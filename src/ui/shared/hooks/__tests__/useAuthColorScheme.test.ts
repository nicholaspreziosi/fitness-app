import { useAuthColorScheme } from '@/src/ui/shared/hooks/useAuthColorScheme';
import { act, renderHook } from '@testing-library/react-native';

const setColorScheme = jest.fn();

jest.mock('nativewind', () => ({
  useColorScheme: jest.fn(),
}));

import { useColorScheme } from 'nativewind';

const useColorSchemeMock = useColorScheme as jest.MockedFunction<typeof useColorScheme>;

describe('useAuthColorScheme', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useColorSchemeMock.mockReturnValue({
      colorScheme: 'dark',
      setColorScheme,
      toggleColorScheme: jest.fn(),
    });
  });

  it('forces light theme while unauthenticated', () => {
    const { result } = renderHook(() => useAuthColorScheme(null));

    expect(setColorScheme).toHaveBeenCalledWith('light');
    expect(result.current).toBe('light');
  });

  it('restores the preferred theme after sign-in', () => {
    const { rerender } = renderHook(({ user }) => useAuthColorScheme(user), {
      initialProps: { user: null as { id: string; email: string } | null },
    });

    expect(setColorScheme).toHaveBeenCalledWith('light');

    act(() => {
      rerender({ user: { id: 'user-1', email: 'you@example.com' } });
    });

    expect(setColorScheme).toHaveBeenLastCalledWith('dark');
  });

  it('uses the active theme while authenticated', () => {
    useColorSchemeMock.mockReturnValue({
      colorScheme: 'dark',
      setColorScheme,
      toggleColorScheme: jest.fn(),
    });

    const { result } = renderHook(() =>
      useAuthColorScheme({ id: 'user-1', email: 'you@example.com' })
    );

    expect(result.current).toBe('dark');
    expect(setColorScheme).not.toHaveBeenCalled();
  });
});
