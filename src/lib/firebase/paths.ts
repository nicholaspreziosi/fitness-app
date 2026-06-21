export type UserCollection = 'exercises' | 'templateBlocks' | 'workouts';

export function userCollectionPath(userId: string, collection: UserCollection): string {
  return `users/${userId}/${collection}`;
}

export function userProfilePath(userId: string): string {
  return `users/${userId}`;
}
