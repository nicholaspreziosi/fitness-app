import { createDetailStackScreenOptions } from '@/src/ui/shared/navigation/stackScreenOptions';

jest.mock('expo-router', () => ({
  DarkTheme: { colors: {} },
  DefaultTheme: { colors: {} },
}));

describe('createDetailStackScreenOptions', () => {
  it('keeps the push header transparent', () => {
    const options = createDetailStackScreenOptions('light');
    const headerStyle = options.headerStyle as { backgroundColor?: string } | undefined;

    expect(options.headerShown).toBe(true);
    expect(headerStyle?.backgroundColor).toBe('transparent');
    expect(options.headerShadowVisible).toBe(false);
  });

  it('shows the back title next to the arrow on web', () => {
    const { Platform } = jest.requireActual('react-native');
    const originalOS = Platform.OS;
    Platform.OS = 'web';

    try {
      expect(createDetailStackScreenOptions('light').headerBackButtonDisplayMode).toBe('default');
    } finally {
      Platform.OS = originalOS;
    }

    expect(createDetailStackScreenOptions('light').headerBackButtonDisplayMode).toBeUndefined();
  });
});
