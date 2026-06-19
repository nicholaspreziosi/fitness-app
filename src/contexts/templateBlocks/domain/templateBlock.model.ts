export const TEMPLATE_BLOCK_STATUSES = ['draft', 'active', 'archived'] as const;

export type TemplateBlockStatus = (typeof TEMPLATE_BLOCK_STATUSES)[number];

export interface TemplateBlock {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  status: TemplateBlockStatus;
  favorite?: boolean;
  exerciseIds: string[];
  notes?: string;
}
