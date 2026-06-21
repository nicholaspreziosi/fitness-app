import { ConfirmDialog } from '@/src/ui/shared/components/ConfirmDialog';
import { FavoriteButton } from '@/src/ui/shared/components/FavoriteButton';
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
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
};

type PendingConfirmAction = 'archive' | 'delete';

export function TemplateBlockListItem({
  block,
  onPress,
  onArchive,
  onRestore,
  onDelete,
  onToggleFavorite,
}: TemplateBlockListItemProps) {
  const [pendingAction, setPendingAction] = React.useState<PendingConfirmAction | null>(null);
  const exerciseCount = block.exerciseIds.length;

  const closeConfirm = () => {
    setPendingAction(null);
  };

  const actions = React.useMemo<ListRowAction[]>(
    () =>
      block.status === 'archived'
        ? [
            {
              label: 'Restore',
              testID: `restore-template-${block.id}`,
              onPress: () => onRestore(block.id),
            },
            {
              label: 'Delete',
              destructive: true,
              testID: `delete-template-${block.id}`,
              onPress: () => setPendingAction('delete'),
            },
          ]
        : [
            {
              label: 'Archive',
              testID: `archive-template-${block.id}`,
              onPress: () => setPendingAction('archive'),
            },
            {
              label: 'Delete',
              destructive: true,
              testID: `delete-template-${block.id}`,
              onPress: () => setPendingAction('delete'),
            },
          ],
    [block.id, block.status, onRestore]
  );

  return (
    <>
      <SwipeableListRow
        actions={actions}
        testID={`template-row-${block.id}`}
        accessibilityLabel={block.name}
        onPress={onPress}>
        <View className="min-w-0 flex-1 flex-row items-start justify-between gap-2">
          <View className="min-w-0 flex-1">
            <Text
              className={cn(
                'font-medium',
                block.status === 'archived' ? 'text-muted-foreground' : 'text-foreground'
              )}>
              {block.name}
            </Text>
            <Text className="mt-0.5 text-sm text-muted-foreground">
              {exerciseCount} exercise{exerciseCount === 1 ? '' : 's'}
            </Text>
            {block.notes ? (
              <Text className="mt-1 text-sm text-muted-foreground" numberOfLines={2}>
                {block.notes}
              </Text>
            ) : null}
          </View>
          <FavoriteButton
            favorite={block.favorite ?? false}
            testID={`favorite-template-${block.id}`}
            onPress={() => onToggleFavorite(block.id, block.favorite ?? false)}
          />
        </View>
      </SwipeableListRow>

      <ConfirmDialog
        confirmLabel="Archive"
        description="Archived template blocks stay available in historical workouts but are hidden from normal selection."
        hideTrigger
        open={pendingAction === 'archive'}
        title="Archive this template block?"
        triggerLabel="Archive"
        onConfirm={() => {
          onArchive(block.id);
          closeConfirm();
        }}
        onOpenChange={(open) => {
          if (!open) {
            closeConfirm();
          }
        }}
      />

      <ConfirmDialog
        confirmLabel="Delete"
        description="Deleting a template block removes it permanently. Workouts already created from this block keep their exercise copies."
        destructive
        hideTrigger
        open={pendingAction === 'delete'}
        title="Delete this template block?"
        triggerLabel="Delete"
        onConfirm={() => {
          onDelete(block.id);
          closeConfirm();
        }}
        onOpenChange={(open) => {
          if (!open) {
            closeConfirm();
          }
        }}
      />
    </>
  );
}
