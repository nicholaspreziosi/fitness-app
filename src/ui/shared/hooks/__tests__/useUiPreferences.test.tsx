import { loadUiPreferences, saveUiPreferences } from '@/src/lib/preferences/uiPreferences.storage';
import { useUiPreferences } from '@/src/ui/shared/hooks/useUiPreferences';
import { act, renderHook, waitFor } from '@testing-library/react-native';

jest.mock('@/src/lib/preferences/uiPreferences.storage');

describe('useUiPreferences', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (loadUiPreferences as jest.Mock).mockResolvedValue({ showCompletedExercises: false });
    (saveUiPreferences as jest.Mock).mockResolvedValue(undefined);
  });

  it('loads preferences on mount', async () => {
    const { result } = renderHook(() => useUiPreferences());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.preferences.showCompletedExercises).toBe(false);
  });

  it('persists preference updates', async () => {
    const { result } = renderHook(() => useUiPreferences());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.setPreference('showCompletedExercises', true);
    });

    expect(saveUiPreferences).toHaveBeenCalledWith({ showCompletedExercises: true });
    expect(result.current.preferences.showCompletedExercises).toBe(true);
  });
});
