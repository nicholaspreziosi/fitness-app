import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { formatDayLabel, isBeforeDay } from '@/src/lib/dates/weekBounds';
import { createId } from '@/src/lib/id/createId';
import { SegmentedControl } from '@/src/ui/shared/components/SegmentedControl';
import { useWorkoutMutations } from '@/src/ui/workouts/hooks/useWorkoutMutations';
import * as React from 'react';
import { View } from 'react-native';

type PastWorkoutStatus = 'completed' | 'skipped';

type WorkoutCreateSheetProps = {
  date: Date;
  onClose: () => void;
  onCreated?: (date: Date) => void;
};

export function WorkoutCreateSheet({ date, onClose, onCreated }: WorkoutCreateSheetProps) {
  const [name, setName] = React.useState('');
  const [pastStatus, setPastStatus] = React.useState<PastWorkoutStatus>('completed');
  const { createWorkout } = useWorkoutMutations();
  const isPastDate = isBeforeDay(date, new Date());

  const handleCreate = async () => {
    if (!name.trim()) {
      return;
    }

    await createWorkout.mutateAsync({
      id: createId('workout'),
      name: name.trim(),
      date,
      status: isPastDate ? pastStatus : 'planned',
    });
    onCreated?.(date);
    onClose();
  };

  return (
    <View className="gap-4 rounded-t-2xl border border-border bg-card p-4">
      <Text className="text-lg font-semibold text-foreground">Create Workout</Text>
      <Text className="text-sm text-muted-foreground">{formatDayLabel(date)}</Text>
      <View className="gap-2">
        <Label>Name</Label>
        <Input value={name} onChangeText={setName} placeholder="Wednesday Lower Body" />
      </View>
      {isPastDate ? (
        <View className="gap-2">
          <Label>Status</Label>
          <Text className="text-sm text-muted-foreground">
            Past workouts are recorded as completed or skipped.
          </Text>
          <SegmentedControl
            testID="past-workout-status"
            value={pastStatus}
            onChange={setPastStatus}
            options={[
              { label: 'Completed', value: 'completed' },
              { label: 'Skipped', value: 'skipped' },
            ]}
          />
        </View>
      ) : null}
      <View className="flex-row justify-end gap-2">
        <Button variant="outline" onPress={onClose}>
          <Text>Cancel</Text>
        </Button>
        <Button onPress={handleCreate} disabled={!name.trim() || createWorkout.isPending}>
          <Text>Create</Text>
        </Button>
      </View>
    </View>
  );
}
