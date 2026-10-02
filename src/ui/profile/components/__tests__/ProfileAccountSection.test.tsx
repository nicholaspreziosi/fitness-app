import { emptyUserProfileFormValues } from '@/src/contexts/profile/domain/userProfileForm.schema';
import { ProfileAccountSection } from '@/src/ui/profile/components/ProfileAccountSection';
import { presentedActionSheet } from '@/test-utils/actionSheet';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { fireEvent, render, screen } from '@testing-library/react-native';

jest.mock('@/components/ui/select', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Select: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
    SelectContent: () => null,
    SelectItem: () => null,
    SelectTrigger: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
    SelectValue: () => null,
  };
});

function renderSection(onSignOut = jest.fn()) {
  render(
    <ProfileAccountSection
      email="nick@example.com"
      values={emptyUserProfileFormValues()}
      onChange={jest.fn()}
      onSignOut={onSignOut}
    />
  );
  return onSignOut;
}

describe('ProfileAccountSection', () => {
  beforeEach(() => {
    (useActionSheet().showActionSheetWithOptions as jest.Mock).mockClear();
  });

  it('presents a native action sheet to confirm signing out', () => {
    renderSection();

    fireEvent.press(screen.getByRole('button', { name: 'Sign out' }));

    const sheet = presentedActionSheet();
    expect(sheet.title).toBe('Sign out of Flow?');
    expect(sheet.message).toBe(
      'You can sign back in anytime to access your workouts and library.'
    );
    expect(sheet.options).toEqual(['Sign out', 'Cancel']);
    expect(sheet.destructiveButtonIndex).toBe(0);
  });

  it('signs out when the destructive option is chosen', () => {
    const onSignOut = renderSection();

    fireEvent.press(screen.getByRole('button', { name: 'Sign out' }));
    presentedActionSheet().selectLabel('Sign out');

    expect(onSignOut).toHaveBeenCalledTimes(1);
  });

  it('keeps the session when the sheet is cancelled', () => {
    const onSignOut = renderSection();

    fireEvent.press(screen.getByRole('button', { name: 'Sign out' }));
    presentedActionSheet().cancel();

    expect(onSignOut).not.toHaveBeenCalled();
  });
});
