import {
  createEmptyTemplateBlockFormValues,
  formOutputToTemplateBlockFields,
  templateBlockToFormValues,
} from '@/src/contexts/templateBlocks/domain/templateBlockForm.mapper';
import { createMockTemplateBlock } from '@/test-utils/mockData';

describe('templateBlockForm.mapper', () => {
  it('maps template block to form values', () => {
    const block = createMockTemplateBlock({
      name: 'Shoulder Rehab',
      status: 'active',
      exerciseIds: ['exercise-1', 'exercise-2'],
      notes: 'Post-surf recovery',
    });

    expect(templateBlockToFormValues(block)).toEqual({
      name: 'Shoulder Rehab',
      status: 'active',
      exerciseIds: ['exercise-1', 'exercise-2'],
      notes: 'Post-surf recovery',
    });
  });

  it('maps form output to template block fields', () => {
    expect(
      formOutputToTemplateBlockFields({
        name: 'Core',
        status: 'active',
        exerciseIds: ['exercise-3'],
        notes: undefined,
      })
    ).toEqual({
      name: 'Core',
      status: 'active',
      exerciseIds: ['exercise-3'],
      notes: undefined,
    });
  });

  it('creates empty form values', () => {
    expect(createEmptyTemplateBlockFormValues()).toEqual({
      name: '',
      status: 'draft',
      exerciseIds: [],
      notes: '',
    });
  });
});
