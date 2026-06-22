import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import type { WorkoutStatus } from '@/src/contexts/workouts/domain/workout.model';
import * as React from 'react';
import { Pressable, View } from 'react-native';

type WorkoutCardProps = {
  name: string;
  status: WorkoutStatus;
  exerciseCount: number;
  completedCount?: number;
  estimatedMinutes?: number;
  headerActions?: React.ReactNode;
  onPress?: () => void;
  className?: string;
  children?: React.ReactNode;
};

const STATUS_CONFIG: Record<
  WorkoutStatus,
  { label: string; variant: 'muted' | 'default' | 'success' | 'warning' }
> = {
  draft: { label: 'Draft', variant: 'muted' },
  planned: { label: 'Planned', variant: 'default' },
  inProgress: { label: 'In Progress', variant: 'default' },
  completed: { label: 'Completed', variant: 'success' },
  skipped: { label: 'Skipped', variant: 'warning' },
  archived: { label: 'Archived', variant: 'muted' },
};

export function WorkoutCard({
  name,
  status,
  exerciseCount,
  completedCount = 0,
  estimatedMinutes,
  headerActions,
  onPress,
  className,
  children,
}: WorkoutCardProps) {
  const statusConfig = STATUS_CONFIG[status];

  const showProgress =
    status === 'planned' || status === 'completed' || status === 'inProgress';

  const progressPercent =
    exerciseCount > 0 ? Math.min(100, (completedCount / exerciseCount) * 100) : 0;

  const summary = (
    <View className="min-w-0 flex-1 gap-2">
      <View className="flex-row flex-wrap items-center gap-x-2 gap-y-2">
        <Text className="text-base font-semibold text-foreground" numberOfLines={2}>
          {name}
        </Text>
        <Badge variant={statusConfig.variant} className="shrink-0">
          <Text>{statusConfig.label}</Text>
        </Badge>
      </View>
      <Text className="text-xs text-muted-foreground">
        {completedCount}/{exerciseCount} exercise{exerciseCount === 1 ? '' : 's'}
        {estimatedMinutes !== undefined ? ` · ~${estimatedMinutes} min` : ''}
      </Text>
      {showProgress ? (
        <View className="h-2 w-24 overflow-hidden rounded-full bg-muted">
          <View
            className="h-full rounded-full bg-brand"
            style={{ width: `${progressPercent}%` }}
          />
        </View>
      ) : null}
    </View>
  );

  return (
    <View className={cn('rounded-lg border border-border bg-card px-3 py-3', className)}>
      <View className="flex-row items-center gap-2">
        {onPress ? (
          <Pressable
            accessibilityRole="button"
            className="min-w-0 flex-1 active:opacity-80"
            onPress={onPress}>
            {summary}
          </Pressable>
        ) : (
          summary
        )}
        {headerActions ? (
          <View className="shrink-0 flex-row items-center gap-0.5 self-center">{headerActions}</View>
        ) : null}
      </View>

      {children}
    </View>
  );
}
