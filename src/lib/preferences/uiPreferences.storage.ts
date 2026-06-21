import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import { DEFAULT_UI_PREFERENCES } from './uiPreferences.defaults';
import type { UiPreferences } from './uiPreferences.types';

const STORAGE_KEY = 'flow.uiPreferences';

function canUseLocalStorage(): boolean {
  return typeof localStorage !== 'undefined';
}

function shouldUseLocalStorage(): boolean {
  return Platform.OS === 'web' || canUseLocalStorage();
}

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
  try {
    await writeStorage(JSON.stringify(preferences));
  } catch {
    // Ignore persistence failures and keep in-memory preferences.
  }
}

async function readStorage(): Promise<string | null> {
  if (shouldUseLocalStorage()) {
    return canUseLocalStorage() ? localStorage.getItem(STORAGE_KEY) : null;
  }

  try {
    return await AsyncStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

async function writeStorage(value: string): Promise<void> {
  if (shouldUseLocalStorage()) {
    if (canUseLocalStorage()) {
      localStorage.setItem(STORAGE_KEY, value);
    }

    return;
  }

  await AsyncStorage.setItem(STORAGE_KEY, value);
}
