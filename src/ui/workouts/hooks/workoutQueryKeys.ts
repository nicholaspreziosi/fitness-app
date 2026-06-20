export function workoutQueryKeys(userId: string) {
  return {
    all: ['workouts', userId] as const,
    week: (weekStartIso: string) => ['workouts', userId, weekStartIso] as const,
    detail: (workoutId: string) => ['workouts', userId, 'detail', workoutId] as const,
  };
}
