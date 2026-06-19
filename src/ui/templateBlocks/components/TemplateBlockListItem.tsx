import { ConfirmDialog } from '@/src/ui/shared/components/ConfirmDialog';
import { Text } from '@/components/ui/text';
import type { TemplateBlock } from '@/src/contexts/templateBlocks/domain/templateBlock.model';
import {
  SwipeableListRow,
  type ListRowAction,
} from '@/src/ui/shared/components/SwipeableListRow';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { View } from 'react-native';

type TemplateBlockListItemProps = {
  block: TemplateBlock;
  onPress: () => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
};

export function TemplateBlockListItem({
  block,
  onPress,
  onArchive,
  onRestore,
}: TemplateBlockListItemProps) {
  const [pendingArchive, setPendingArchive] = React.useState(false);
  const exerciseCount = block.exerciseIds.length;

  const actions: ListRowAction[] =
    block.status === 'archived'
      ? [
          {
            label: 'Restore',
            testID: `restore-template-${block.id}`,
            onPress: () => onRestore(block.id),
          },
        ]
      : [
          {
            label: 'Archive',
            testID: `archive-template-${block.id}`,
            onPress: () => setPendingArchive(true),
          },
        ];

  return (
    <>
      <SwipeableListRow
        actions={actions}
        testID={`template-row-${block.id}`}
        accessibilityLabel={block.name}
        className={cn(block.status === 'archived' && 'opacity-80')}
        onPress={onPress}>
        <View className="min-w-0 flex-1">
          <Text className="font-medium text-foreground">{block.name}</Text>
          <Text className="mt-0.5 text-sm text-muted-foreground">
            {exerciseCount} exercise{exerciseCount === 1 ? '' : 's'}
          </Text>
          {block.notes ? (
            <Text className="mt-1 text-sm text-muted-foreground" numberOfLines={2}>
              {block.notes}
            </Text>
          ) : null}
        </View>
      </SwipeableListRow>

      <ConfirmDialog
        confirmLabel="Archive"
        description="Archived template blocks stay available in historical workouts but are hidden from normal selection."
        hideTrigger
        open={pendingArchive}
        title="Archive this template block?"
        triggerLabel="Archive"
        onConfirm={() => {
          onArchive(block.id);
          setPendingArchive(false);
        }}
        onOpenChange={(open) => {
          if (!open) {
            setPendingArchive(false);
          }
        }}
      />
    </>
  );
}
