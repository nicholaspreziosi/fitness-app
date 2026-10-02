import { emptyUserProfileFormValues } from '@/src/contexts/profile/domain/userProfileForm.schema';
import { ProfileAccountSection } from '@/src/ui/profile/components/ProfileAccountSection';
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

jest.mock('@/src/ui/shared/components/ConfirmDialog', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');
  return {
    ConfirmDialog: ({
      confirmLabel,
      onConfirm,
    }: {
      confirmLabel: string;
      onConfirm?: () => void;
    }) => (
      <Pressable accessibilityRole="button" onPress={onConfirm}>
        <Text>{confirmLabel}</Text>
      </Pressable>
    ),
  };
});

describe('ProfileAccountSection', () => {
  it('signs out when the account confirmation is accepted', () => {
    const onSignOut = jest.fn();

    render(
      <ProfileAccountSection
        email="nick@example.com"
        values={emptyUserProfileFormValues()}
        onChange={jest.fn()}
        onSignOut={onSignOut}
      />
    );

    fireEvent.press(screen.getByRole('button', { name: 'Sign out' }));

    expect(onSignOut).toHaveBeenCalledTimes(1);
  });
});
