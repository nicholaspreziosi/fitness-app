import type { TemplateBlockStatus } from './templateBlock.model';

export function canHardDeleteTemplateBlock(): boolean {
  return true;
}

export function isSelectableTemplateBlock(status: TemplateBlockStatus): boolean {
  return status !== 'archived';
}
