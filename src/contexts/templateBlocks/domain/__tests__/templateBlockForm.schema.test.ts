import { templateBlockFormSchema } from '@/src/contexts/templateBlocks/domain/templateBlockForm.schema';

describe('templateBlockFormSchema', () => {
  it('requires a name', () => {
    const result = templateBlockFormSchema.safeParse({
      name: '',
      status: 'draft',
      exerciseIds: [],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Template name is required.');
    }
  });

  it('accepts a valid draft template block form', () => {
    const result = templateBlockFormSchema.safeParse({
      name: 'Quad Strength',
      status: 'draft',
      exerciseIds: [],
      notes: 'Lower body focus',
    });

    expect(result.success).toBe(true);
  });

  it('requires at least one exercise for active template blocks', () => {
    const result = templateBlockFormSchema.safeParse({
      name: 'Quad Strength',
      status: 'active',
      exerciseIds: [],
    });

    expect(result.success).toBe(false);
  });

  it('accepts active template block with exercises', () => {
    const result = templateBlockFormSchema.safeParse({
      name: 'Quad Strength',
      status: 'active',
      exerciseIds: ['exercise-1', 'exercise-2'],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.exerciseIds).toEqual(['exercise-1', 'exercise-2']);
    }
  });
});
