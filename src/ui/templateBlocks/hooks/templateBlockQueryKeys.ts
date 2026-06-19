export function templateBlockQueryKeys(userId: string) {
  return {
    all: ['templateBlocks', userId] as const,
    detail: (blockId: string) => ['templateBlocks', userId, blockId] as const,
  };
}
