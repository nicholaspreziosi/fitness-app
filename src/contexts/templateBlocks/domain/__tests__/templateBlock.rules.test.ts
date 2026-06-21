import {
  canHardDeleteTemplateBlock,
  isSelectableTemplateBlock,
} from '@/src/contexts/templateBlocks/domain/templateBlock.rules';

describe('templateBlock rules', () => {
  it('can always be hard deleted because workouts store exercise copies', () => {
    expect(canHardDeleteTemplateBlock()).toBe(true);
  });

  it('archived template blocks should not appear in normal selection', () => {
    expect(isSelectableTemplateBlock('active')).toBe(true);
    expect(isSelectableTemplateBlock('draft')).toBe(true);
    expect(isSelectableTemplateBlock('archived')).toBe(false);
  });
});
