import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

jest.mock('@/src/ui/exercises/hooks/usePrefetchExerciseLibrary', () => ({
  usePrefetchExerciseLibrary: jest.fn(),
}));

jest.mock('@/src/ui/profile/hooks/usePrefetchUserProfile', () => ({
  usePrefetchUserProfile: jest.fn(),
}));

jest.mock('@/src/ui/profile/components/AccountPausedBanner', () => {
  const { Text: MockText } = require('react-native');

  return {
    AccountPausedBanner: () => <MockText>Account paused banner</MockText>,
  };
});

jest.mock('@/src/ui/shared/components/AppHeader', () => {
  const { Text: MockText } = require('react-native');

  return {
    AppHeader: () => <MockText>App header</MockText>,
  };
});

jest.mock('@/src/ui/shared/providers/AppHeaderScrollProvider', () => ({
  AppHeaderScrollProvider: ({ children }: { children: React.ReactNode }) => children,
}));

import { usePrefetchExerciseLibrary } from '@/src/ui/exercises/hooks/usePrefetchExerciseLibrary';
import { usePrefetchUserProfile } from '@/src/ui/profile/hooks/usePrefetchUserProfile';
import { TabShell } from '@/src/ui/shared/navigation/TabShell';

const usePrefetchExerciseLibraryMock = usePrefetchExerciseLibrary as jest.MockedFunction<
  typeof usePrefetchExerciseLibrary
>;
const usePrefetchUserProfileMock = usePrefetchUserProfile as jest.MockedFunction<
  typeof usePrefetchUserProfile
>;

describe('TabShell', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders tab content with the banner and prefetches library and profile data', () => {
    render(
      <TabShell>
        <Text>Tab content</Text>
      </TabShell>
    );

    expect(screen.getByText('Tab content')).toBeTruthy();
    expect(screen.getByText('Account paused banner')).toBeTruthy();
    expect(screen.getByText('App header')).toBeTruthy();
    expect(usePrefetchExerciseLibraryMock).toHaveBeenCalled();
    expect(usePrefetchUserProfileMock).toHaveBeenCalled();
  });
});
