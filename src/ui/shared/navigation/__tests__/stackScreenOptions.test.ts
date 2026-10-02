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
});
