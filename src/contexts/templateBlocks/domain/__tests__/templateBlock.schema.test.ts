import { templateBlockSchema } from '@/src/contexts/templateBlocks/domain/templateBlock.schema';
import { createMockTemplateBlock } from '@/test-utils/mockData';

describe('templateBlockSchema', () => {
  const baseBlock = createMockTemplateBlock();

  it('validates required fields', () => {
    const result = templateBlockSchema.safeParse(baseBlock);

    expect(result.success).toBe(true);
  });

  it.each(['draft', 'active', 'archived'] as const)(
    'supports status: %s',
    (status) => {
      const exerciseIds = status === 'active' ? ['exercise-1'] : [];
      const result = templateBlockSchema.safeParse({
        ...baseBlock,
        status,
        exerciseIds,
      });

      expect(result.success).toBe(true);
    }
  );

  it('supports favorite', () => {
    const result = templateBlockSchema.safeParse({ ...baseBlock, favorite: true });

    expect(result.success).toBe(true);
  });

  it('stores exerciseIds', () => {
    const result = templateBlockSchema.safeParse({
      ...baseBlock,
      exerciseIds: ['exercise-1', 'exercise-2'],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.exerciseIds).toEqual(['exercise-1', 'exercise-2']);
    }
  });

  it('rejects invalid status values', () => {
    const result = templateBlockSchema.safeParse({
      ...baseBlock,
      status: 'published',
    });

    expect(result.success).toBe(false);
  });

  it('allows empty exerciseIds for draft TemplateBlocks', () => {
    const result = templateBlockSchema.safeParse({
      ...baseBlock,
      status: 'draft',
      exerciseIds: [],
    });

    expect(result.success).toBe(true);
  });

  it('requires at least one exerciseId for active TemplateBlocks', () => {
    const result = templateBlockSchema.safeParse({
      ...baseBlock,
      status: 'active',
      exerciseIds: [],
    });

    expect(result.success).toBe(false);
  });

  it('stores exercise references only (no nested template blocks in MVP)', () => {
    const result = templateBlockSchema.safeParse({
      ...baseBlock,
      exerciseIds: ['exercise-1', 'exercise-2'],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.exerciseIds.every((id) => typeof id === 'string')).toBe(true);
    }
  });
});
