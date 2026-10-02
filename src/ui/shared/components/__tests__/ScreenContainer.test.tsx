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
  useShowAppHeader: jest.fn(() => false),
}));

jest.mock('@/src/ui/shared/providers/AppHeaderScrollProvider', () => ({
  useOptionalAppHeaderScroll: () => null,
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 59, bottom: 34, left: 0, right: 0 }),
}));

jest.mock('expo-router', () => ({
  useFocusEffect: jest.fn(),
}));

jest.mock('nativewind', () => ({
  useColorScheme: () => ({ colorScheme: 'light' }),
}));

import { APP_HEADER_BAR_HEIGHT, TITLE_TOP_PADDING } from '@/src/ui/shared/constants/appHeader';
import { ScreenContainer } from '@/src/ui/shared/components/ScreenContainer';
import { useShowAppHeader } from '@/src/ui/shared/hooks/useShowAppHeader';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { ScrollView, Text, View } from 'react-native';

const STATUS_BAR_INSET = 59;

function contentPadding() {
  const scroll = screen.UNSAFE_getByType(ScrollView);
  const style = scroll.props.contentContainerStyle;
  return Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : style;
}

describe('ScreenContainer', () => {
  beforeEach(() => {
    (useShowAppHeader as jest.Mock).mockReturnValue(false);
  });
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

  it('clears the status bar and leaves space above titles when the navbar is hidden', () => {
    (useShowAppHeader as jest.Mock).mockReturnValue(false);

    render(
      <ScreenContainer>
        <Text>Settings</Text>
      </ScreenContainer>
    );

    expect(screen.UNSAFE_getByType(ScrollView).props.contentInsetAdjustmentBehavior).toBe(
      'automatic'
    );
    expect(contentPadding().paddingTop).toBe(TITLE_TOP_PADDING);
    expect(contentPadding().paddingBottom).toBe(16);
    expect(contentPadding().flexGrow).toBeUndefined();
  });

  it('keeps room for the navbar when it is visible', () => {
    (useShowAppHeader as jest.Mock).mockReturnValue(true);

    render(
      <ScreenContainer>
        <Text>Dashboard</Text>
      </ScreenContainer>
    );

    expect(contentPadding().paddingTop).toBe(STATUS_BAR_INSET + APP_HEADER_BAR_HEIGHT);
  });

  it('keeps pull-to-refresh content in place when the navbar is hidden', () => {
    (useShowAppHeader as jest.Mock).mockReturnValue(false);

    render(
      <ScreenContainer onRefresh={jest.fn()}>
        <Text>Calendar</Text>
      </ScreenContainer>
    );

    const scrollView = screen.UNSAFE_getByType(ScrollView);

    expect(scrollView.props.contentInset).toBeUndefined();
    expect(scrollView.props.contentInsetAdjustmentBehavior).toBe('automatic');
    expect(scrollView.props.alwaysBounceVertical).toBe(true);
    expect(scrollView.props.refreshControl.props.progressViewOffset).toBeUndefined();
    expect(contentPadding().flexGrow).toBeUndefined();
    expect(contentPadding().paddingTop).toBe(TITLE_TOP_PADDING);

    fireEvent(scrollView, 'layout', {
      nativeEvent: { layout: { height: 800, width: 390, x: 0, y: 0 } },
    });

    expect(contentPadding().minHeight).toBe(800 - STATUS_BAR_INSET - 34);
  });

  it('keeps the navbar offset out of pull-to-refresh when the navbar is visible', () => {
    (useShowAppHeader as jest.Mock).mockReturnValue(true);

    render(
      <ScreenContainer onRefresh={jest.fn()}>
        <Text>Dashboard</Text>
      </ScreenContainer>
    );

    const scrollView = screen.UNSAFE_getByType(ScrollView);

    expect(scrollView.props.contentInset).toBeUndefined();
    expect(scrollView.props.refreshControl.props.progressViewOffset).toBeUndefined();
    expect(contentPadding().paddingTop).toBe(STATUS_BAR_INSET + APP_HEADER_BAR_HEIGHT);
  });
});
