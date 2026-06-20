import {
  applyApprovedDefaultUpdates,
  buildDefaultUpdatesFromReviewItems,
  detectIncreasedHoldDuration,
  detectIncreasedReps,
  detectIncreasedSets,
  detectIncreasedWeight,
  detectPlannedVsActualIncreases,
  detectProgressionImprovements,
  getSuggestedDefaultUpdates,
  hasPlannedVsActualIncrease,
  hasProgressionImprovement,
  shouldAutoLowerDefaults,
} from '@/src/contexts/workouts/domain/progression';

describe('progression helpers', () => {
  const defaults = {
    defaultSets: 2,
    defaultReps: 8,
    defaultHoldSeconds: 30,
    defaultWeight: 75,
  };

  it('detects increased weight', () => {
    expect(detectIncreasedWeight(defaults, { actualWeight: 80 })).toBe(true);
  });

  it('detects increased reps', () => {
    expect(detectIncreasedReps(defaults, { actualReps: 10 })).toBe(true);
  });

  it('detects increased sets', () => {
    expect(detectIncreasedSets(defaults, { actualSets: 3 })).toBe(true);
  });

  it('detects increased hold duration', () => {
    expect(detectIncreasedHoldDuration(defaults, { actualHoldSeconds: 45 })).toBe(true);
  });

  it('does not detect decreases as progression', () => {
    const decreasedActuals = {
      actualSets: 1,
      actualReps: 6,
      actualHoldSeconds: 20,
      actualWeight: 60,
    };

    expect(detectProgressionImprovements(defaults, decreasedActuals)).toEqual([]);
    expect(hasProgressionImprovement(defaults, decreasedActuals)).toBe(false);
    expect(getSuggestedDefaultUpdates(defaults, decreasedActuals)).toBeNull();
  });

  it('does not auto-lower defaults', () => {
    expect(shouldAutoLowerDefaults()).toBe(false);

    const loweredActuals = {
      actualWeight: 60,
      actualReps: 6,
      actualSets: 1,
      actualHoldSeconds: 20,
    };

    expect(applyApprovedDefaultUpdates(defaults, loweredActuals)).toEqual(defaults);
  });

  it('handles missing actual values safely', () => {
    expect(detectIncreasedWeight(defaults, {})).toBe(false);
    expect(detectProgressionImprovements(defaults, {})).toEqual([]);
  });

  it('handles missing default values safely', () => {
    const emptyDefaults = {};

    expect(detectIncreasedWeight(emptyDefaults, { actualWeight: 100 })).toBe(false);
    expect(getSuggestedDefaultUpdates(emptyDefaults, { actualWeight: 100 })).toBeNull();
  });

  it('returns suggested increases only for improved metrics', () => {
    expect(getSuggestedDefaultUpdates(defaults, { actualWeight: 80 })).toEqual({
      defaultWeight: 80,
    });

    expect(
      detectProgressionImprovements(defaults, {
        actualWeight: 80,
        actualReps: 10,
        actualSets: 3,
        actualHoldSeconds: 45,
      })
    ).toEqual(['weight', 'reps', 'sets', 'holdSeconds']);
  });

  it('applies approved updates without lowering existing defaults', () => {
    const updated = applyApprovedDefaultUpdates(defaults, {
      actualWeight: 80,
      actualReps: 6,
    });

    expect(updated).toEqual({
      ...defaults,
      defaultWeight: 80,
    });
  });
});

describe('planned vs actual default update review', () => {
  it('detects increases when actual exceeds planned', () => {
    expect(
      detectPlannedVsActualIncreases(
        { plannedWeight: 100, plannedReps: 8 },
        { actualWeight: 110, actualReps: 10 }
      )
    ).toEqual([
      { field: 'defaultReps', plannedValue: 8, actualValue: 10 },
      { field: 'defaultWeight', plannedValue: 100, actualValue: 110 },
    ]);
  });

  it('ignores equal or lower actual values', () => {
    expect(
      detectPlannedVsActualIncreases(
        { plannedSets: 3, plannedHoldSeconds: 45 },
        { actualSets: 3, actualHoldSeconds: 40 }
      )
    ).toEqual([]);
    expect(
      hasPlannedVsActualIncrease({ plannedReps: 8 }, { actualReps: 8 })
    ).toBe(false);
  });

  it('builds library default updates from selected review items without lowering', () => {
    const updates = buildDefaultUpdatesFromReviewItems(
      { defaultWeight: 100, defaultReps: 12 },
      [
        { field: 'defaultWeight', plannedValue: 100, actualValue: 110 },
        { field: 'defaultReps', plannedValue: 8, actualValue: 10 },
      ]
    );

    expect(updates).toEqual({ defaultWeight: 110 });
  });
});
