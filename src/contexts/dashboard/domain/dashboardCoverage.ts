import type { Workout } from '@/src/contexts/workouts/domain/workout.model';

import type { CoverageItem } from './dashboard.types';

const UNKNOWN_BODY_PART = 'Unknown';

export function aggregateBodyPartCoverage(workouts: Workout[]): CoverageItem[] {
  const counts = new Map<string, number>();

  for (const workout of workouts) {
    if (workout.status !== 'completed') {
      continue;
    }

    for (const exercise of workout.exercises) {
      if (!exercise.completed) {
        continue;
      }

      const bodyPart = exercise.bodyPart ?? UNKNOWN_BODY_PART;
      counts.set(bodyPart, (counts.get(bodyPart) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([bodyPart, count]) => ({ bodyPart, count }))
    .sort((a, b) => b.count - a.count || a.bodyPart.localeCompare(b.bodyPart));
}
