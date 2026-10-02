import { ActionSheet } from '@/components/ui/action-sheet';
import { presentedActionSheet } from '@/test-utils/actionSheet';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { render } from '@testing-library/react-native';

const duplicate = jest.fn();
const remove = jest.fn();

describe('ActionSheet', () => {
  beforeEach(() => {
    duplicate.mockClear();
    remove.mockClear();
    (useActionSheet().showActionSheetWithOptions as jest.Mock).mockClear();
  });

  it('presents native options and marks destructive actions', () => {
    render(
      <ActionSheet
        open
        onClose={jest.fn()}
        actions={[
          { label: 'Duplicate', onPress: duplicate },
          { label: 'Delete', onPress: remove, destructive: true },
        ]}
      />
    );

    const sheet = presentedActionSheet();

    expect(sheet.options).toEqual(['Duplicate', 'Delete', 'Cancel']);
    expect(sheet.destructiveButtonIndex).toBe(1);
    expect(sheet.cancelButtonIndex).toBe(2);
  });

  it('does not present when closed', () => {
    render(
      <ActionSheet
        open={false}
        onClose={jest.fn()}
        actions={[{ label: 'Duplicate', onPress: duplicate }]}
      />
    );

    expect(useActionSheet().showActionSheetWithOptions).not.toHaveBeenCalled();
  });

  it('runs the selected action', () => {
    const onClose = jest.fn();

    render(
      <ActionSheet open onClose={onClose} actions={[{ label: 'Duplicate', onPress: duplicate }]} />
    );

    presentedActionSheet().selectLabel('Duplicate');

    expect(duplicate).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('dismisses without running an action', () => {
    const onClose = jest.fn();

    render(
      <ActionSheet open onClose={onClose} actions={[{ label: 'Duplicate', onPress: duplicate }]} />
    );

    presentedActionSheet().cancel();

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(duplicate).not.toHaveBeenCalled();
  });
});
