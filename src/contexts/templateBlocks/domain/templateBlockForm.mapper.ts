import type { TemplateBlock } from '@/src/contexts/templateBlocks/domain/templateBlock.model';
import type {
  TemplateBlockFormOutput,
  TemplateBlockFormValues,
} from '@/src/contexts/templateBlocks/domain/templateBlockForm.schema';
import { defaultTemplateBlockFormValues } from '@/src/contexts/templateBlocks/domain/templateBlockForm.schema';

export function templateBlockToFormValues(block: TemplateBlock): TemplateBlockFormValues {
  return {
    name: block.name,
    status: block.status,
    exerciseIds: block.exerciseIds,
    notes: block.notes ?? '',
  };
}

export function formOutputToTemplateBlockFields(
  values: TemplateBlockFormOutput
): Omit<TemplateBlock, 'id' | 'createdAt' | 'updatedAt' | 'favorite'> {
  return {
    name: values.name,
    status: values.status,
    exerciseIds: values.exerciseIds,
    notes: values.notes,
  };
}

export function createEmptyTemplateBlockFormValues(
  overrides: Partial<TemplateBlockFormValues> = {}
): TemplateBlockFormValues {
  return {
    ...defaultTemplateBlockFormValues,
    ...overrides,
  };
}
