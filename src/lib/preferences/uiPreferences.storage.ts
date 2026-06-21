import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import { DEFAULT_UI_PREFERENCES } from './uiPreferences.defaults';
import type { UiPreferences } from './uiPreferences.types';

const STORAGE_KEY = 'flow.uiPreferences';

export async function loadUiPreferences(): Promise<UiPreferences> {
  try {
    const raw = await readStorage();

    if (!raw) {
      return DEFAULT_UI_PREFERENCES;
    }

    const parsed = JSON.parse(raw) as Partial<UiPreferences>;

    return {
      showCompletedExercises:
        parsed.showCompletedExercises ?? DEFAULT_UI_PREFERENCES.showCompletedExercises,
    };
  } catch {
    return DEFAULT_UI_PREFERENCES;
  }
}

export async function saveUiPreferences(preferences: UiPreferences): Promise<void> {
  await writeStorage(JSON.stringify(preferences));
}

async function readStorage(): Promise<string | null> {
  if (Platform.OS === 'web') {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    return localStorage.getItem(STORAGE_KEY);
  }

  return AsyncStorage.getItem(STORAGE_KEY);
}

async function writeStorage(value: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, value);
    }

    return;
  }

  await AsyncStorage.setItem(STORAGE_KEY, value);
}
