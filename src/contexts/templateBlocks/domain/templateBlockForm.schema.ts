import { z } from 'zod';

import { TEMPLATE_BLOCK_STATUSES } from './templateBlock.model';

const optionalTrimmedString = z
  .string()
  .optional()
  .transform((value) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
  });

export const templateBlockFormSchema = z
  .object({
    name: z.string().trim().min(1, 'Template name is required.'),
    status: z.enum(TEMPLATE_BLOCK_STATUSES),
    exerciseIds: z.array(z.string()),
    notes: optionalTrimmedString,
  })
  .superRefine((data, ctx) => {
    if (data.status === 'active' && data.exerciseIds.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Active template blocks must include at least one exercise.',
        path: ['exerciseIds'],
      });
    }
  });

export type TemplateBlockFormValues = z.input<typeof templateBlockFormSchema>;
export type TemplateBlockFormOutput = z.output<typeof templateBlockFormSchema>;

export const defaultTemplateBlockFormValues: TemplateBlockFormValues = {
  name: '',
  status: 'draft',
  exerciseIds: [],
  notes: '',
};
