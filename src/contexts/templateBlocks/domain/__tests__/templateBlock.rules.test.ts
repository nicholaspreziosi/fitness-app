import {
  canHardDeleteTemplateBlock,
  isSelectableTemplateBlock,
  shouldArchiveTemplateBlockInsteadOfDelete,
} from '@/src/contexts/templateBlocks/domain/templateBlock.rules';

describe('templateBlock rules', () => {
  it('should be archived instead of hard deleted once used', () => {
    expect(shouldArchiveTemplateBlockInsteadOfDelete(true)).toBe(true);
    expect(canHardDeleteTemplateBlock(true)).toBe(false);
  });

  it('can be hard deleted when never used', () => {
    expect(canHardDeleteTemplateBlock(false)).toBe(true);
    expect(shouldArchiveTemplateBlockInsteadOfDelete(false)).toBe(false);
  });

  it('archived template blocks should not appear in normal selection', () => {
    expect(isSelectableTemplateBlock('active')).toBe(true);
    expect(isSelectableTemplateBlock('draft')).toBe(true);
    expect(isSelectableTemplateBlock('archived')).toBe(false);
  });
});
