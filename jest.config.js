/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testMatch: ['**/__tests__/**/*.(test|spec).(ts|tsx)', '**/*.(test|spec).(ts|tsx)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^firebase/firestore$': '<rootDir>/test-utils/firestoreManualMock.ts',
    '^firebase/auth$': '<rootDir>/test-utils/firebaseAuthManualMock.ts',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@rn-primitives/.*|nativewind|lucide-react-native|firebase)',
  ],
  collectCoverageFrom: [
    'src/contexts/**/*.{ts,tsx}',
    '!src/contexts/**/__tests__/**',
    '!**/*.test.{ts,tsx}',
  ],
};
