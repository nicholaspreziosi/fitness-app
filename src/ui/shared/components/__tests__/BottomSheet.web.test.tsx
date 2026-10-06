import { BottomSheet } from '@/src/ui/shared/components/BottomSheet.web';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

jest.mock('@expo/ui', () => ({
  BottomSheet: jest.fn(() => null),
  RNHostView: jest.fn(() => null),
}));

jest.mock('expo-router', () => ({
  DarkTheme: { colors: {} },
  DefaultTheme: { colors: {} },
}));

jest.mock('nativewind', () => ({
  useColorScheme: () => ({ colorScheme: 'light' }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 34, left: 0, right: 0 }),
}));

jest.mock('react-native-gesture-handler', () => {
  const { View } = require('react-native');
  const chain = () => gesture;
  const gesture = {
    onUpdate: chain,
    onEnd: chain,
  };

  return {
    GestureDetector: ({ children }: { children: React.ReactNode }) => children,
    Gesture: { Pan: () => gesture },
  };
});

jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');

  return {
    __esModule: true,
    default: {
      View,
      createAnimatedComponent: (component: unknown) => component,
    },
    useSharedValue: (initial: number) => ({ value: initial }),
    useAnimatedStyle: () => ({}),
    withTiming: (value: number, _config?: unknown, callback?: (finished: boolean) => void) => {
      callback?.(true);
      return value;
    },
    runOnJS: (fn: (...args: unknown[]) => unknown) => fn,
    Easing: {
      bezier: () => (value: number) => value,
    },
  };
});

import { BottomSheet as ExpoBottomSheet } from '@expo/ui';

describe('BottomSheet web', () => {
  it('slides children up in a custom sheet and does not use the native sheet', () => {
    render(
      <BottomSheet visible onClose={jest.fn()}>
        <Text>Sheet body</Text>
      </BottomSheet>
    );

    expect(screen.getByTestId('bottom-sheet')).toBeTruthy();
    expect(screen.getByText('Sheet body')).toBeTruthy();
    expect(ExpoBottomSheet).not.toHaveBeenCalled();
  });

  it('hides children when not visible', () => {
    render(
      <BottomSheet visible={false} onClose={jest.fn()}>
        <Text>Sheet body</Text>
      </BottomSheet>
    );

    expect(screen.queryByText('Sheet body')).toBeNull();
    expect(screen.queryByTestId('bottom-sheet')).toBeNull();
  });

  it('calls onClose when the backdrop is pressed', () => {
    const onClose = jest.fn();

    render(
      <BottomSheet visible onClose={onClose}>
        <Text>Sheet body</Text>
      </BottomSheet>
    );

    fireEvent.press(screen.getByLabelText('Close sheet'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
