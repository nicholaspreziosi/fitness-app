import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { Pressable, View } from 'react-native';

type WorkoutStatus = 'draft' | 'planned' | 'completed' | 'skipped';

type WorkoutCardProps = {
  name: string;
  dateLabel: string;
  status: WorkoutStatus;
  exerciseCount: number;
  completedCount?: number;
  onPress?: () => void;
  className?: string;
};

const STATUS_CONFIG: Record<WorkoutStatus, { label: string; variant: 'muted' | 'default' | 'success' | 'warning' }> =
  {
    draft: { label: 'Draft', variant: 'muted' },
    planned: { label: 'Planned', variant: 'default' },
    completed: { label: 'Completed', variant: 'success' },
    skipped: { label: 'Skipped', variant: 'warning' },
  };

export function WorkoutCard({
  name,
  dateLabel,
  status,
  exerciseCount,
  completedCount = 0,
  onPress,
  className,
}: WorkoutCardProps) {
  const statusConfig = STATUS_CONFIG[status];
  const progress =
    status === 'completed' || status === 'planned'
      ? `${completedCount}/${exerciseCount} exercises`
      : `${exerciseCount} exercises`;

  return (
    <Pressable
      accessibilityRole="button"
      className={cn(
        'rounded-lg border border-border bg-card px-3 py-3 active:bg-muted/50',
        className
      )}
      onPress={onPress}>
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="font-medium text-foreground">{name}</Text>
          <Text className="mt-0.5 text-sm text-muted-foreground">{dateLabel}</Text>
        </View>
        <Badge variant={statusConfig.variant}>
          <Text>{statusConfig.label}</Text>
        </Badge>
      </View>

      <View className="mt-3 flex-row items-center justify-between">
        <Text className="text-xs text-muted-foreground">{progress}</Text>
        {(status === 'planned' || status === 'completed') && exerciseCount > 0 ? (
          <View className="ml-3 h-1.5 max-w-24 flex-1 overflow-hidden rounded-full bg-muted">
            <View
              className="h-full rounded-full bg-primary"
              style={{ width: `${Math.min(100, (completedCount / exerciseCount) * 100)}%` }}
            />
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
