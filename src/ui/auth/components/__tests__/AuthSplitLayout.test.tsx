jest.mock('@/src/ui/shared/hooks/useKeyboardInset', () => ({
  useKeyboardInset: jest.fn(() => 0),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

import { useKeyboardInset } from '@/src/ui/shared/hooks/useKeyboardInset';
import { AuthSplitLayout } from '@/src/ui/auth/components/AuthSplitLayout';
import { render, screen } from '@testing-library/react-native';
import * as ReactNative from 'react-native';
import { Text } from 'react-native';

const useKeyboardInsetMock = useKeyboardInset as jest.MockedFunction<typeof useKeyboardInset>;

describe('AuthSplitLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(ReactNative, 'useWindowDimensions').mockReturnValue({
      width: 390,
      height: 844,
      scale: 2,
      fontScale: 1,
    });
    useKeyboardInsetMock.mockReturnValue(0);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders a compact mobile logo section', () => {
    render(
      <AuthSplitLayout formTitle="Welcome back" formDescription="Sign in to continue.">
        <Text>Form</Text>
      </AuthSplitLayout>
    );

    expect(screen.getByTestId('auth-mobile-logo')).toBeTruthy();
    expect(screen.getByText('Flow')).toBeTruthy();
    expect(screen.getByText('Welcome back')).toBeTruthy();
  });

  it('keeps the logo visible while the keyboard is open', () => {
    useKeyboardInsetMock.mockReturnValue(320);

    render(
      <AuthSplitLayout formTitle="Welcome back" formDescription="Sign in to continue.">
        <Text>Form</Text>
      </AuthSplitLayout>
    );

    expect(screen.getByTestId('auth-mobile-logo')).toBeTruthy();
    expect(screen.getByText('Flow')).toBeTruthy();
  });
});
