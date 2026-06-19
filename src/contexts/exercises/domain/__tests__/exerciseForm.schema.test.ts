import { exerciseFormSchema } from '@/src/contexts/exercises/domain/exerciseForm.schema';

describe('exerciseFormSchema', () => {
  it('requires a name', () => {
    const result = exerciseFormSchema.safeParse({ name: '', status: 'draft' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Exercise name is required.');
    }
  });

  it('accepts a valid exercise form', () => {
    const result = exerciseFormSchema.safeParse({
      name: 'Pendulum Squat',
      status: 'active',
      bodyPart: 'Upper Legs',
      primaryMuscles: ['Quads'],
      defaultSets: '2',
      defaultReps: '8',
      defaultWeight: '100',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.defaultSets).toBe(2);
      expect(result.data.defaultReps).toBe(8);
      expect(result.data.defaultWeight).toBe(100);
    }
  });

  it('rejects invalid prescription numbers', () => {
    const result = exerciseFormSchema.safeParse({
      name: 'Wall Sit',
      status: 'active',
      defaultSets: 'abc',
    });

    expect(result.success).toBe(false);
  });
});
