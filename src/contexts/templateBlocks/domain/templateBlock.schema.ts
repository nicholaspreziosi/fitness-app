import { z } from 'zod';

import { TEMPLATE_BLOCK_STATUSES } from './templateBlock.model';

const templateBlockStatusSchema = z.enum(TEMPLATE_BLOCK_STATUSES);

export const templateBlockSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    createdAt: z.date(),
    updatedAt: z.date(),
    status: templateBlockStatusSchema,
    favorite: z.boolean().optional(),
    exerciseIds: z.array(z.string()),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.status === 'active' && data.exerciseIds.length === 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'Active template blocks must include at least one exercise.',
        path: ['exerciseIds'],
      });
    }
  });

export type TemplateBlockInput = z.infer<typeof templateBlockSchema>;
