import { Text } from '@/components/ui/text';
import type { Exercise } from '@/src/contexts/exercises/domain/exercise.model';
import { formatExercisePrescription } from '@/src/contexts/exercises/domain/exercisePresentation';
import { ConfirmDialog } from '@/src/ui/shared/components/ConfirmDialog';
import { FavoriteButton } from '@/src/ui/shared/components/FavoriteButton';
import {
  SwipeableListRow,
  type ListRowAction,
} from '@/src/ui/shared/components/SwipeableListRow';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { View } from 'react-native';

type ExerciseListItemProps = {
  exercise: Exercise;
  onPress: () => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
};

type PendingConfirmAction = 'archive' | 'delete';

export function ExerciseListItem({
  exercise,
  onPress,
  onArchive,
  onRestore,
  onDelete,
  onToggleFavorite,
}: ExerciseListItemProps) {
  const [pendingAction, setPendingAction] = React.useState<PendingConfirmAction | null>(null);

  const closeConfirm = () => {
    setPendingAction(null);
  };

  const actions: ListRowAction[] =
    exercise.status === 'archived'
      ? [
          {
            label: 'Restore',
            testID: `restore-exercise-${exercise.id}`,
            onPress: () => onRestore(exercise.id),
          },
          {
            label: 'Delete',
            destructive: true,
            testID: `delete-exercise-${exercise.id}`,
            onPress: () => setPendingAction('delete'),
          },
        ]
      : [
          {
            label: 'Archive',
            testID: `archive-exercise-${exercise.id}`,
            onPress: () => setPendingAction('archive'),
          },
          {
            label: 'Delete',
            destructive: true,
            testID: `delete-exercise-${exercise.id}`,
            onPress: () => setPendingAction('delete'),
          },
        ];

  const prescription = formatExercisePrescription(exercise);

  return (
    <>
      <SwipeableListRow
        actions={actions}
        testID={`exercise-row-${exercise.id}`}
        accessibilityLabel={exercise.name}
        className={cn(exercise.status === 'archived' && 'opacity-80')}
        onPress={onPress}>
        <View className="min-w-0 flex-1 flex-row items-center justify-between gap-2">
          <View className="min-w-0 flex-1">
            <Text className="font-medium text-foreground">{exercise.name}</Text>
            {prescription ? (
              <Text className="mt-0.5 text-xs text-muted-foreground">{prescription}</Text>
            ) : null}
          </View>
          <FavoriteButton
            favorite={exercise.favorite ?? false}
            testID={`favorite-exercise-${exercise.id}`}
            onPress={() => onToggleFavorite(exercise.id, exercise.favorite ?? false)}
          />
        </View>
      </SwipeableListRow>

      <ConfirmDialog
        confirmLabel="Archive"
        description="Archived exercises stay available in historical workouts but are hidden from normal selection."
        hideTrigger
        open={pendingAction === 'archive'}
        title="Archive this exercise?"
        triggerLabel="Archive"
        onConfirm={() => {
          onArchive(exercise.id);
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
        description="Only unused exercises can be deleted. Exercises used in workouts or template blocks must be archived instead."
        destructive
        hideTrigger
        open={pendingAction === 'delete'}
        title="Delete this exercise?"
        triggerLabel="Delete"
        onConfirm={() => {
          onDelete(exercise.id);
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
