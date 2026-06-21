import '@testing-library/jest-native/extend-expect';

jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  const { ScrollView, View } = require('react-native');

  return {
    GestureHandlerRootView: View,
    Swipeable: ({ children }: { children: React.ReactNode }) => children,
    ScrollView,
  };
});

jest.mock('react-native-worklets', () => ({
  runOnUI: (fn: () => void) => fn(),
  runOnJS: (fn: (...args: unknown[]) => unknown) => fn,
  createSerializable: <T,>(value: T) => value,
  createSynchronizable: <T,>(value: T) => value,
}));

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => undefined;
  return Reanimated;
});

jest.mock('@/src/ui/profile/hooks/useMeasurementSystem', () => ({
  useMeasurementSystem: () => 'imperial',
}));

jest.mock('@/src/ui/profile/hooks/useWeekStartDay', () => ({
  useWeekStartDay: () => 1,
}));

jest.mock('@/src/ui/profile/hooks/useCanUseTrainingFeatures', () => ({
  useCanUseTrainingFeatures: () => true,
}));

jest.mock('@/src/ui/profile/hooks/useUserProfile', () => ({
  useUserProfile: () => ({
    profile: undefined,
    isLoading: false,
    isError: false,
    error: null,
    refetch: jest.fn(),
  }),
}));

jest.mock('@/src/contexts/profile/application/createUserProfileService', () => ({
  createUserProfileService: jest.fn(() => ({
    getOrCreateProfile: jest.fn(),
    createDefaultProfile: jest.fn(),
    updateProfile: jest.fn(),
  })),
}));

