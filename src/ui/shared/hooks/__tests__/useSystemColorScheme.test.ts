import { useSystemColorScheme } from '@/src/ui/shared/hooks/useSystemColorScheme';
import { act, renderHook } from '@testing-library/react-native';
import { Appearance, Platform } from 'react-native';

const setColorScheme = jest.fn();

jest.mock('nativewind', () => ({
  useColorScheme: jest.fn(),
}));

import { useColorScheme } from 'nativewind';

const useColorSchemeMock = useColorScheme as jest.MockedFunction<typeof useColorScheme>;

describe('useSystemColorScheme', () => {
  const originalPlatform = Platform.OS;

  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'ios';
    useColorSchemeMock.mockReturnValue({
      colorScheme: 'dark',
      setColorScheme,
      toggleColorScheme: jest.fn(),
    });
  });

  afterEach(() => {
    Platform.OS = originalPlatform;
  });

  it('clears a manual theme on native so the system scheme is used', () => {
    const { result } = renderHook(() => useSystemColorScheme());

    expect(setColorScheme).toHaveBeenCalledWith('system');
    expect(result.current).toBe('dark');
  });

  it('mirrors the system scheme on web and updates when it changes', () => {
    Platform.OS = 'web';
    const remove = jest.fn();
    let onChange: (() => void) | undefined;
    jest.spyOn(Appearance, 'getColorScheme').mockReturnValue('light');
    jest.spyOn(Appearance, 'addChangeListener').mockImplementation((listener) => {
      onChange = () => listener({ colorScheme: Appearance.getColorScheme() ?? 'light' });
      return { remove };
    });

    const { unmount } = renderHook(() => useSystemColorScheme());

    expect(setColorScheme).toHaveBeenCalledWith('light');

    jest.mocked(Appearance.getColorScheme).mockReturnValue('dark');
    act(() => {
      onChange?.();
    });

    expect(setColorScheme).toHaveBeenLastCalledWith('dark');

    unmount();
    expect(remove).toHaveBeenCalled();
  });
});
