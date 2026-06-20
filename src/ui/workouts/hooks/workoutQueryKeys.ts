export function workoutQueryKeys(userId: string) {
  return {
    all: ['workouts', userId] as const,
    week: (weekStartIso: string) => ['workouts', userId, weekStartIso] as const,
    today: (dateKey: string) => ['workouts', userId, 'today', dateKey] as const,
    detail: (workoutId: string) => ['workouts', userId, 'detail', workoutId] as const,
  };
}
