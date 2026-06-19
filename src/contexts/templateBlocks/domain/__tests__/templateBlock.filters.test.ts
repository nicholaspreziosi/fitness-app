import { createMockTemplateBlock } from '@/test-utils/mockData';
import {
  countActiveTemplateBlockFilters,
  filterTemplateBlocks,
} from '@/src/contexts/templateBlocks/domain/templateBlock.filters';

describe('templateBlock.filters', () => {
  it('filters by search', () => {
    const blocks = [
      createMockTemplateBlock({ id: '1', name: 'Shoulder Rehab' }),
      createMockTemplateBlock({ id: '2', name: 'Quad Strength' }),
    ];

    const result = filterTemplateBlocks(blocks, { search: 'shoulder' });

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Shoulder Rehab');
  });

  it('counts active filters', () => {
    expect(
      countActiveTemplateBlockFilters({
        status: 'archived',
        favoritesOnly: true,
      })
    ).toBe(2);
  });
});
