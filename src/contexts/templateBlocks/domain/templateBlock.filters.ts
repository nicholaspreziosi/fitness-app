import type { TemplateBlock, TemplateBlockStatus } from './templateBlock.model';

export type TemplateBlockListFilters = {
  search?: string;
  status?: TemplateBlockStatus | 'all';
  favoritesOnly?: boolean;
};

export function countActiveTemplateBlockFilters(filters: TemplateBlockListFilters): number {
  let count = 0;

  if (filters.status && filters.status !== 'all') {
    count += 1;
  }

  if (filters.favoritesOnly) {
    count += 1;
  }

  return count;
}

export function filterTemplateBlocks(
  blocks: TemplateBlock[],
  filters: TemplateBlockListFilters
): TemplateBlock[] {
  return blocks.filter((block) => {
    if (filters.status && filters.status !== 'all' && block.status !== filters.status) {
      return false;
    }

    if (filters.favoritesOnly && !block.favorite) {
      return false;
    }

    if (filters.search?.trim()) {
      const query = filters.search.trim().toLowerCase();
      if (!block.name.toLowerCase().includes(query)) {
        return false;
      }
    }

    return true;
  });
}
