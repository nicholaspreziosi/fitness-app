jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  const { ScrollView, View } = require('react-native');

  return {
    GestureHandlerRootView: View,
    GestureDetector: ({ children }: { children: React.ReactNode }) => children,
    ScrollView,
  };
});

jest.mock('react-native-reanimated', () => {
  const { ScrollView } = require('react-native');

  const Animated = {
    createAnimatedComponent: (Component: typeof ScrollView) => Component,
    ScrollView,
  };

  return {
    __esModule: true,
    default: Animated,
    createAnimatedComponent: Animated.createAnimatedComponent,
  };
});

jest.mock('@/src/ui/shared/hooks/useShowAppHeader', () => ({
  useShowAppHeader: () => false,
}));

jest.mock('@/src/ui/shared/providers/AppHeaderScrollProvider', () => ({
  useOptionalAppHeaderScroll: () => null,
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('expo-router', () => ({
  useFocusEffect: jest.fn(),
}));

jest.mock('nativewind', () => ({
  useColorScheme: () => ({ colorScheme: 'light' }),
}));

import { ScreenContainer } from '@/src/ui/shared/components/ScreenContainer';
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

describe('ScreenContainer', () => {
  it('keeps hook order stable when scrollable changes between renders', () => {
    const { rerender } = render(
      <ScreenContainer scrollable={false}>
        <Text>Loading</Text>
      </ScreenContainer>
    );

    expect(screen.getByText('Loading')).toBeTruthy();

    rerender(
      <ScreenContainer>
        <Text>Loaded</Text>
      </ScreenContainer>
    );

    expect(screen.getByText('Loaded')).toBeTruthy();
  });
});
