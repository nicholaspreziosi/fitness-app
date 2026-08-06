export function exerciseQueryKeys(userId: string) {
  return {
    all: ['exercises', userId] as const,
    detail: (exerciseId: string) => ['exercises', userId, exerciseId] as const,
    history: (exerciseId: string) => ['exercises', userId, exerciseId, 'history'] as const,
    usedIds: ['exercises', userId, 'used-ids'] as const,
  };
}
