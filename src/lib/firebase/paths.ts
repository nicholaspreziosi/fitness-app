export type UserCollection = 'exercises' | 'templateBlocks' | 'workouts';

export function userCollectionPath(userId: string, collection: UserCollection): string {
  return `users/${userId}/${collection}`;
}
