import { DEFAULT_UI_PREFERENCES } from '@/src/lib/preferences/uiPreferences.defaults';
import { loadUiPreferences, saveUiPreferences } from '@/src/lib/preferences/uiPreferences.storage';
import type { UiPreferences } from '@/src/lib/preferences/uiPreferences.types';
import * as React from 'react';

export function useUiPreferences() {
  const [preferences, setPreferences] = React.useState<UiPreferences>(DEFAULT_UI_PREFERENCES);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;

    loadUiPreferences()
      .then((loaded) => {
        if (!cancelled) {
          setPreferences(loaded);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPreferences(DEFAULT_UI_PREFERENCES);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const updatePreferences = React.useCallback(async (next: UiPreferences) => {
    setPreferences(next);
    await saveUiPreferences(next);
  }, []);

  const setPreference = React.useCallback(
    async <K extends keyof UiPreferences>(key: K, value: UiPreferences[K]) => {
      const next = { ...preferences, [key]: value };
      await updatePreferences(next);
    },
    [preferences, updatePreferences]
  );

  return {
    preferences,
    isLoading,
    setPreference,
    updatePreferences,
  };
}
