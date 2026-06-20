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

