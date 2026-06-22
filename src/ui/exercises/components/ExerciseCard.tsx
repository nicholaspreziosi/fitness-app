import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import type { ExerciseStatus } from '@/src/contexts/exercises/domain/exercise.model';
import { cn } from '@/lib/utils';
import { StarIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

type ExerciseCardProps = {
  name: string;
  bodyPart?: string;
  primaryMuscles?: string[];
  status?: ExerciseStatus;
  completed?: boolean;
  favorite?: boolean;
  prescription?: string;
  showCheckbox?: boolean;
  favoriteTestID?: string;
  onToggleComplete?: () => void;
  onPress?: () => void;
  onFavoritePress?: () => void;
  actions?: React.ReactNode;
  className?: string;
};

export function ExerciseCard({
  name,
  bodyPart,
  primaryMuscles = [],
  status,
  completed = false,
  favorite = false,
  prescription,
  showCheckbox = false,
  favoriteTestID,
  onToggleComplete,
  onPress,
  onFavoritePress,
  actions,
  className,
}: ExerciseCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className={cn(
        'flex-row items-start gap-3 rounded-lg border border-border bg-card px-3 py-3.5 active:bg-muted/50',
        completed && 'border-success/20 bg-success/[0.03]',
        status === 'archived' && 'opacity-80',
        className
      )}
      onPress={onPress}>
      {showCheckbox ? (
        <View className="pt-0.5">
          <Checkbox checked={completed} onCheckedChange={() => onToggleComplete?.()} />
        </View>
      ) : null}

      <View className="min-w-0 flex-1">
        <View className="flex-row items-start justify-between gap-2">
          <View className="flex-1">
            <Text
              className={cn(
                'font-medium text-foreground',
                completed && 'text-muted-foreground line-through'
              )}>
              {name}
            </Text>
            {prescription ? (
              <Text className="mt-0.5 text-sm tabular-nums text-muted-foreground">
                {prescription}
              </Text>
            ) : null}
          </View>

          <View className="flex-row items-center gap-0.5">
            {onFavoritePress ? (
              <Pressable
                accessibilityRole="button"
                hitSlop={8}
                testID={favoriteTestID}
                onPress={(event) => {
                  event?.stopPropagation?.();
                  onFavoritePress();
                }}>
                <Icon
                  as={StarIcon}
                  className={cn('size-4', favorite ? 'text-warning' : 'text-muted-foreground')}
                  fill={favorite ? 'currentColor' : 'none'}
                />
              </Pressable>
            ) : favorite ? (
              <Icon as={StarIcon} className="size-3.5 text-warning" fill="currentColor" />
            ) : null}
            {actions}
          </View>
        </View>

        {(bodyPart || primaryMuscles.length > 0 || completed || status) && (
          <View className="mt-2.5 flex-row flex-wrap gap-1.5">
            {status && status !== 'active' ? (
              <Badge variant={status === 'archived' ? 'outline' : 'muted'}>
                <Text>{status.charAt(0).toUpperCase() + status.slice(1)}</Text>
              </Badge>
            ) : null}
            {bodyPart ? (
              <Badge variant="muted">
                <Text>{bodyPart}</Text>
              </Badge>
            ) : null}
            {primaryMuscles.map((muscle) => (
              <Badge key={muscle} variant="outline">
                <Text>{muscle}</Text>
              </Badge>
            ))}
            {completed ? (
              <Badge variant="success">
                <Text>Done</Text>
              </Badge>
            ) : null}
          </View>
        )}
      </View>
    </Pressable>
  );
}
