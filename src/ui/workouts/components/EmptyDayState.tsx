import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { View } from 'react-native';

type EmptyDayStateProps = {
  className?: string;
};

export function EmptyDayState({ className }: EmptyDayStateProps) {
  return (
    <View className={cn('rounded-lg border border-dashed border-border px-3 py-4', className)}>
      <Text className="text-sm text-muted-foreground md:text-center md:text-xs">
        No workouts planned.
      </Text>
    </View>
  );
}
