import { SwipeableListRow } from '@/src/ui/shared/components/SwipeableListRow';
import { presentedActionSheet } from '@/test-utils/actionSheet';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

jest.mock('expo-router', () => ({
  DarkTheme: { colors: {} },
  DefaultTheme: { colors: {} },
}));

describe('SwipeableListRow overflow actions', () => {
  it('opens a native action sheet on long press and does not run an action when dismissed', () => {
    const onArchive = jest.fn();

    render(
      <SwipeableListRow
        accessibilityLabel="Pendulum Squat"
        actions={[{ label: 'Archive', onPress: onArchive, testID: 'archive-row' }]}
        onPress={jest.fn()}>
        <Text>Pendulum Squat</Text>
      </SwipeableListRow>
    );

    fireEvent(screen.getByLabelText('Pendulum Squat'), 'longPress');

    const sheet = presentedActionSheet();
    expect(sheet.options).toEqual(['Archive', 'Cancel']);

    sheet.cancel();

    expect(onArchive).not.toHaveBeenCalled();
  });
});
