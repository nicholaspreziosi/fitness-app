export const USER_PROFILE_STALE_TIME_MS = 5 * 60 * 1000;

export function userProfileQueryKeys(userId: string) {
  return {
    all: ['userProfile', userId] as const,
  };
}
