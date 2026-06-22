import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { filterTemplateBlocks } from '@/src/contexts/templateBlocks/domain/templateBlock.filters';
import type { TemplateBlock } from '@/src/contexts/templateBlocks/domain/templateBlock.model';
import { isSelectableTemplateBlock } from '@/src/contexts/templateBlocks/domain/templateBlock.rules';
import { canAddTemplateBlocksToWorkout } from '@/src/contexts/workouts/domain/planner.rules';
import type { Workout } from '@/src/contexts/workouts/domain/workout.model';
import { useTemplateBlocks } from '@/src/ui/templateBlocks/hooks/useTemplateBlocks';
import { useWorkoutMutations } from '@/src/ui/workouts/hooks/useWorkoutMutations';
import { useKeyboardInset } from '@/src/ui/shared/hooks/useKeyboardInset';
import * as React from 'react';
import { Pressable, ScrollView, useWindowDimensions, View } from 'react-native';

type TemplateBlockPickerSheetProps = {
  workout: Workout;
  onClose: () => void;
};

function formatExerciseCount(count: number): string {
  return count === 1 ? '1 exercise' : `${count} exercises`;
}

function getEmptyMessage(availableCount: number, search: string): string {
  if (availableCount === 0) {
    return 'All template blocks are already in this workout.';
  }

  if (search.trim()) {
    return 'No template blocks match your search.';
  }

  return 'No template blocks available to add.';
}

const TEMPLATE_SHEET_CHROME_HEIGHT = 220;

export function TemplateBlockPickerSheet({ workout, onClose }: TemplateBlockPickerSheetProps) {
  const { height: windowHeight } = useWindowDimensions();
  const keyboardHeight = useKeyboardInset();
  const { templateBlocks, isLoading } = useTemplateBlocks();
  const { addTemplateBlocks } = useWorkoutMutations();
  const [search, setSearch] = React.useState('');
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(() => new Set());
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const availableBlocks = React.useMemo(
    () =>
      templateBlocks.filter(
        (block) =>
          isSelectableTemplateBlock(block.status) &&
          canAddTemplateBlocksToWorkout(workout, [block]).allowed
      ),
    [templateBlocks, workout]
  );

  const filteredBlocks = React.useMemo(
    () => filterTemplateBlocks(availableBlocks, { search }),
    [availableBlocks, search]
  );

  const blocksById = React.useMemo(
    () => new Map(availableBlocks.map((block) => [block.id, block])),
    [availableBlocks]
  );

  const selectedBlocks = React.useMemo(
    () =>
      [...selectedIds]
        .map((id) => blocksById.get(id))
        .filter((block): block is TemplateBlock => block !== undefined),
    [blocksById, selectedIds]
  );

  const toggleSelection = (block: TemplateBlock) => {
    setErrorMessage(null);

    if (selectedIds.has(block.id)) {
      setSelectedIds((current) => {
        const next = new Set(current);
        next.delete(block.id);
        return next;
      });
      return;
    }

    const rule = canAddTemplateBlocksToWorkout(workout, [...selectedBlocks, block]);

    if (!rule.allowed) {
      setErrorMessage(rule.message);
      return;
    }

    setSelectedIds((current) => new Set(current).add(block.id));
  };

  const handleAdd = async () => {
    const templateBlockIds = [...selectedIds];
    const blocks = templateBlockIds
      .map((id) => blocksById.get(id))
      .filter((block): block is TemplateBlock => block !== undefined);
    const rule = canAddTemplateBlocksToWorkout(workout, blocks);

    if (!rule.allowed) {
      setErrorMessage(rule.message);
      return;
    }

    await addTemplateBlocks.mutateAsync({ workoutId: workout.id, templateBlockIds });
    onClose();
  };

  const selectedCount = selectedIds.size;
  const { sheetMaxHeight, listMaxHeight } = React.useMemo(() => {
    const availableHeight =
      keyboardHeight > 0 ? windowHeight - keyboardHeight : windowHeight;
    const maxSheetHeight = Math.round(Math.min(windowHeight * 0.85, availableHeight));
    const maxListHeight = Math.max(96, maxSheetHeight - TEMPLATE_SHEET_CHROME_HEIGHT);
    const defaultListHeight = Math.round(windowHeight * 0.48);

    return {
      sheetMaxHeight: maxSheetHeight,
      listMaxHeight: Math.min(defaultListHeight, maxListHeight),
    };
  }, [keyboardHeight, windowHeight]);

  return (
    <View
      className="gap-3 rounded-t-xl border border-border bg-card p-4"
      style={{ maxHeight: sheetMaxHeight }}>
      <View className="gap-1">
        <Text className="text-lg font-semibold text-foreground">Add Template Blocks</Text>
        <Text className="text-sm text-muted-foreground">
          Select one or more template blocks to add.
        </Text>
      </View>
      {errorMessage ? <Text className="text-sm text-destructive">{errorMessage}</Text> : null}
      {isLoading ? (
        <Text className="text-sm text-muted-foreground">Loading template blocks...</Text>
      ) : (
        <>
          <Input
            className="h-11"
            placeholder="Search template blocks..."
            testID="template-picker-search"
            value={search}
            onChangeText={setSearch}
          />
          <ScrollView
            style={{ maxHeight: listMaxHeight }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}>
            {filteredBlocks.length === 0 ? (
              <Text className="py-4 text-center text-sm text-muted-foreground">
                {getEmptyMessage(availableBlocks.length, search)}
              </Text>
            ) : (
              <View className="gap-1">
                {filteredBlocks.map((block) => {
                  const isSelected = selectedIds.has(block.id);

                  return (
                    <Pressable
                      key={block.id}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: isSelected }}
                      testID={`template-picker-${block.id}`}
                      className={cn(
                        'flex-row items-center gap-3 rounded-lg border border-border px-3 py-3',
                        isSelected && 'border-brand bg-brand/5'
                      )}
                      onPress={() => toggleSelection(block)}>
                      <Checkbox checked={isSelected} pointerEvents="none" />
                      <View className="min-w-0 flex-1">
                        <Text className="text-sm text-foreground">{block.name}</Text>
                        <Text className="mt-0.5 text-xs text-muted-foreground">
                          {formatExerciseCount(block.exerciseIds.length)}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </ScrollView>
        </>
      )}
      <View className="flex-row justify-end gap-2">
        <Button variant="outline" onPress={onClose}>
          <Text>Cancel</Text>
        </Button>
        <Button
          testID="add-selected-templates"
          disabled={selectedCount === 0 || addTemplateBlocks.isPending}
          onPress={handleAdd}>
          <Text>
            {addTemplateBlocks.isPending
              ? 'Adding...'
              : selectedCount === 1
                ? 'Add 1 template'
                : `Add ${selectedCount} templates`}
          </Text>
        </Button>
      </View>
    </View>
  );
}
