import { Text } from '@/components/ui/text';
import { TEMPLATE_BLOCK_STATUSES } from '@/src/contexts/templateBlocks/domain/templateBlock.model';
import {
  countActiveTemplateBlockFilters,
  type TemplateBlockListFilters,
} from '@/src/contexts/templateBlocks/domain/templateBlock.filters';
import { Accordion } from '@/src/ui/shared/components/Accordion';
import { cn } from '@/lib/utils';
import { Pressable, View } from 'react-native';

const STATUS_OPTIONS: Array<{ label: string; value: TemplateBlockListFilters['status'] }> = [
  { label: 'All', value: 'all' },
  ...TEMPLATE_BLOCK_STATUSES.map((status) => ({
    label: status.charAt(0).toUpperCase() + status.slice(1),
    value: status,
  })),
];

type TemplateBlockFiltersPanelProps = {
  filters: TemplateBlockListFilters;
  onChange: (filters: TemplateBlockListFilters) => void;
};

export function TemplateBlockFiltersPanel({ filters, onChange }: TemplateBlockFiltersPanelProps) {
  const activeFilterCount = countActiveTemplateBlockFilters(filters);
  const favoritesOnly = filters.favoritesOnly ?? false;

  return (
    <Accordion
      compact
      title="Filters"
      badge={activeFilterCount}
      defaultOpen={activeFilterCount > 0}
      testID="template-block-filters">
      <View className="flex-row flex-wrap gap-1.5">
        {STATUS_OPTIONS.map((option) => {
          const selected = (filters.status ?? 'all') === option.value;

          return (
            <Pressable
              key={option.label}
              accessibilityRole="button"
              testID={`template-status-filter-${option.value}`}
              className={cn(
                'rounded-full border px-2.5 py-1',
                selected ? 'border-primary bg-primary/10' : 'border-border bg-background'
              )}
              onPress={() => onChange({ ...filters, status: option.value })}>
              <Text className={cn('text-xs', selected ? 'text-primary' : 'text-muted-foreground')}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}

        <Pressable
          accessibilityRole="button"
          testID="template-favorites-only-checkbox"
          className={cn(
            'rounded-full border px-2.5 py-1',
            favoritesOnly ? 'border-primary bg-primary/10' : 'border-border bg-background'
          )}
          onPress={() => onChange({ ...filters, favoritesOnly: !favoritesOnly })}>
          <Text
            className={cn('text-xs', favoritesOnly ? 'text-primary' : 'text-muted-foreground')}>
            Favorites
          </Text>
        </Pressable>
      </View>
    </Accordion>
  );
}
