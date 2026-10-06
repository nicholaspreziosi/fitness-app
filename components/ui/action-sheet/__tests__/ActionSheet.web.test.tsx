import { ActionSheet } from '@/components/ui/action-sheet/ActionSheet.web';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { fireEvent, render, screen } from '@testing-library/react-native';

jest.mock('expo-router', () => ({
  DarkTheme: { colors: {} },
  DefaultTheme: { colors: {} },
}));

jest.mock('nativewind', () => ({
  useColorScheme: () => ({ colorScheme: 'light' }),
}));

jest.mock('react-native-reanimated', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');

  return {
    __esModule: true,
    default: { View },
    useSharedValue: (initial: number) => ({ value: initial }),
    useAnimatedStyle: () => ({}),
    withTiming: (value: number, _config?: unknown, callback?: (finished: boolean) => void) => {
      callback?.(true);
      return value;
    },
    runOnJS: (fn: (...args: unknown[]) => unknown) => fn,
    Easing: { bezier: () => (value: number) => value },
  };
});

const duplicate = jest.fn();
const remove = jest.fn();

describe('ActionSheet web', () => {
  beforeEach(() => {
    duplicate.mockClear();
    remove.mockClear();
  });

  it('renders the iOS action card with title, message and pill actions, not the native sheet', () => {
    render(
      <ActionSheet
        open
        onClose={jest.fn()}
        title="Sign out of Flow?"
        message="You can sign back in anytime."
        actions={[
          { label: 'Duplicate', onPress: duplicate },
          { label: 'Delete', onPress: remove, destructive: true },
        ]}
      />
    );

    expect(screen.getByTestId('action-sheet')).toBeTruthy();
    expect(screen.getByText('Sign out of Flow?')).toBeTruthy();
    expect(screen.getByText('You can sign back in anytime.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Duplicate' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeTruthy();
    expect(screen.queryByText('Cancel')).toBeNull();
    expect(useActionSheet().showActionSheetWithOptions).not.toHaveBeenCalled();
  });

  it('colors destructive actions red', () => {
    render(
      <ActionSheet
        open
        onClose={jest.fn()}
        actions={[{ label: 'Delete', onPress: remove, destructive: true }]}
      />
    );

    expect(screen.getByText('Delete')).toHaveStyle({ color: '#FF3B30' });
  });

  it('closes then runs the selected action', () => {
    const calls: string[] = [];
    const onClose = jest.fn(() => calls.push('close'));
    duplicate.mockImplementation(() => calls.push('duplicate'));

    render(
      <ActionSheet open onClose={onClose} actions={[{ label: 'Duplicate', onPress: duplicate }]} />
    );

    fireEvent.press(screen.getByRole('button', { name: 'Duplicate' }));

    expect(calls).toEqual(['close', 'duplicate']);
  });

  it('tapping outside the card cancels without running an action', () => {
    const onClose = jest.fn();

    render(
      <ActionSheet open onClose={onClose} actions={[{ label: 'Duplicate', onPress: duplicate }]} />
    );

    fireEvent.press(screen.getByTestId('action-sheet-backdrop'));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(duplicate).not.toHaveBeenCalled();
  });

  it('renders nothing when closed', () => {
    render(
      <ActionSheet
        open={false}
        onClose={jest.fn()}
        actions={[{ label: 'Duplicate', onPress: duplicate }]}
      />
    );

    expect(screen.queryByTestId('action-sheet')).toBeNull();
  });
});
