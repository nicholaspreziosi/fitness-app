import { MinimizingWebTabBar } from '@/src/ui/shared/navigation/MinimizingWebTabBar';
import {
  TabBarMinimizeProvider,
  useTabBarMinimize,
} from '@/src/ui/shared/navigation/TabBarMinimizeProvider';
import { fireEvent, render, screen } from '@testing-library/react-native';
import type { BottomTabBarProps } from 'expo-router/tabs';
import { Pressable, Text, type NativeSyntheticEvent, type NativeScrollEvent } from 'react-native';

jest.mock('expo-router', () => ({
  DarkTheme: { colors: {} },
  DefaultTheme: { colors: {} },
}));

jest.mock('nativewind', () => ({
  useColorScheme: () => ({ colorScheme: 'light' }),
}));

function scrollEvent(y: number) {
  return {
    nativeEvent: { contentOffset: { y, x: 0 } },
  } as NativeSyntheticEvent<NativeScrollEvent>;
}

function ScrollProbe() {
  const { handleScroll } = useTabBarMinimize();

  return (
    <Pressable
      testID="scroll-down"
      onPress={() => {
        handleScroll(scrollEvent(0));
        handleScroll(scrollEvent(80));
      }}
    />
  );
}

function createProps(): BottomTabBarProps {
  return {
    state: {
      index: 0,
      routes: [
        { key: 'home', name: 'home' },
        { key: 'library', name: 'library' },
      ],
    },
    descriptors: {
      home: {
        options: {
          title: 'Dashboard',
          tabBarIcon: () => <Text>dashboard-icon</Text>,
        },
      },
      library: {
        options: {
          title: 'Library',
          tabBarIcon: () => <Text>library-icon</Text>,
        },
      },
    },
    navigation: {
      emit: jest.fn(() => ({ defaultPrevented: false })),
      navigate: jest.fn(),
    },
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  } as unknown as BottomTabBarProps;
}

describe('MinimizingWebTabBar', () => {
  it('navigates when an unselected tab is pressed', () => {
    const props = createProps();

    render(
      <TabBarMinimizeProvider>
        <MinimizingWebTabBar {...props} />
      </TabBarMinimizeProvider>
    );

    fireEvent.press(screen.getByRole('tab', { name: 'Library' }));

    expect(props.navigation.navigate).toHaveBeenCalledWith('library');
  });

  it('collapses to a left button on scroll down and expands when that button is pressed', () => {
    const props = createProps();

    render(
      <TabBarMinimizeProvider>
        <ScrollProbe />
        <MinimizingWebTabBar {...props} />
      </TabBarMinimizeProvider>
    );

    const overlay = screen.getByTestId('web-tab-bar-overlay');
    const bar = screen.getByTestId('web-tab-bar-expanded');

    expect(overlay.props.style).toEqual(
      expect.objectContaining({
        position: 'fixed',
        backgroundColor: 'transparent',
        bottom: 16,
      })
    );
    expect(bar.props.className).toContain('rounded-lg');

    fireEvent.press(screen.getByTestId('scroll-down'));

    expect(screen.getByTestId('web-tab-bar-collapsed')).toBeTruthy();

    fireEvent.press(screen.getByRole('button', { name: 'Show tabs' }));

    expect(screen.getByTestId('web-tab-bar-expanded')).toBeTruthy();
    expect(props.navigation.navigate).not.toHaveBeenCalled();
  });
});
