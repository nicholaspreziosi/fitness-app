jest.mock('@expo/ui', () => {
  const React = require('react');
  const { Pressable, Text, View } = require('react-native');

  return {
    RNHostView: jest.fn(({ children }: { children: React.ReactNode }) => (
      <View testID="rn-host-view">{children}</View>
    )),
    BottomSheet: jest.fn(
      ({
        isPresented,
        onDismiss,
        children,
      }: {
        isPresented: boolean;
        onDismiss: () => void;
        children: React.ReactNode;
      }) =>
        isPresented ? (
          <View>
            <Pressable accessibilityRole="button" onPress={onDismiss}>
              <Text>Dismiss sheet</Text>
            </Pressable>
            {children}
          </View>
        ) : null
    ),
  };
});

jest.mock('expo-router', () => ({
  DarkTheme: { colors: {} },
  DefaultTheme: { colors: {} },
}));

jest.mock('nativewind', () => ({
  useColorScheme: () => ({ colorScheme: 'light' }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 59, bottom: 34, left: 0, right: 0 }),
}));

import { THEME } from '@/lib/theme';
import { BottomSheet } from '@/src/ui/shared/components/BottomSheet';
import { BottomSheet as ExpoBottomSheet, RNHostView } from '@expo/ui';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Dimensions, Text } from 'react-native';

describe('BottomSheet', () => {
  beforeEach(() => {
    (ExpoBottomSheet as unknown as jest.Mock).mockClear();
    (RNHostView as unknown as jest.Mock).mockClear();
  });

  it('presents children through the Expo UI sheet when visible', () => {
    render(
      <BottomSheet visible onClose={jest.fn()}>
        <Text>Sheet body</Text>
      </BottomSheet>
    );

    expect(screen.getByText('Sheet body')).toBeTruthy();

    const props = (ExpoBottomSheet as unknown as jest.Mock).mock.calls.at(-1)?.[0];
    expect(props.isPresented).toBe(true);
    expect(props.contentPadding).toBe(0);
    expect(props.containerColor).toBe(THEME.light.card);
  });

  it('hosts children in an RNHostView sized to the screen width so taps reach React Native', () => {
    render(
      <BottomSheet visible onClose={jest.fn()}>
        <Text>Sheet body</Text>
      </BottomSheet>
    );

    const hostProps = (RNHostView as unknown as jest.Mock).mock.calls.at(-1)?.[0];
    expect(hostProps.matchContents).toBe(true);

    const host = screen.getByTestId('rn-host-view');
    const [content] = host.children;
    expect(typeof content).not.toBe('string');
    const style = (content as unknown as { props: { style: { width: number; paddingBottom?: number } } })
      .props.style;
    expect(style.width).toBe(Dimensions.get('window').width);
    expect(style.paddingBottom).toBeUndefined();
    expect(screen.getByText('Sheet body')).toBeTruthy();
  });

  it('hides children when not visible', () => {
    render(
      <BottomSheet visible={false} onClose={jest.fn()}>
        <Text>Sheet body</Text>
      </BottomSheet>
    );

    expect(screen.queryByText('Sheet body')).toBeNull();
  });

  it('calls onClose when the native sheet is dismissed', () => {
    const onClose = jest.fn();

    render(
      <BottomSheet visible onClose={onClose}>
        <Text>Sheet body</Text>
      </BottomSheet>
    );

    fireEvent.press(screen.getByText('Dismiss sheet'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
