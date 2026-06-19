import '@testing-library/jest-native/extend-expect';

jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    GestureHandlerRootView: View,
    Swipeable: ({ children }: { children: React.ReactNode }) => children,
  };
});

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => undefined;
  return Reanimated;
});

jest.mock('react-native-worklets', () => ({
  runOnUI: (fn: () => void) => fn(),
  runOnJS: (fn: (...args: unknown[]) => unknown) => fn,
}));
