import type { TemplateBlockStatus } from './templateBlock.model';

export function canHardDeleteTemplateBlock(hasBeenUsed: boolean): boolean {
  return !hasBeenUsed;
}

export function shouldArchiveTemplateBlockInsteadOfDelete(hasBeenUsed: boolean): boolean {
  return hasBeenUsed;
}

export function isSelectableTemplateBlock(status: TemplateBlockStatus): boolean {
  return status !== 'archived';
}
