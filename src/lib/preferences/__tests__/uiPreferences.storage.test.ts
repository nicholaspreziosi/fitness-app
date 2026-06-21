import { DEFAULT_UI_PREFERENCES } from '../uiPreferences.defaults';
import { loadUiPreferences, saveUiPreferences } from '../uiPreferences.storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';

describe('uiPreferences.storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns defaults when storage is empty', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    await expect(loadUiPreferences()).resolves.toEqual(DEFAULT_UI_PREFERENCES);
  });

  it('persists and loads preferences', async () => {
    const preferences = { showCompletedExercises: true };
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(preferences));

    await saveUiPreferences(preferences);
    await expect(loadUiPreferences()).resolves.toEqual(preferences);
    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });

  it('returns defaults when native storage is unavailable', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValue(
      new Error('Native module is null, cannot access legacy storage')
    );

    await expect(loadUiPreferences()).resolves.toEqual(DEFAULT_UI_PREFERENCES);
  });
});
