import { Text } from '@/components/ui/text';
import * as React from 'react';
import { View } from 'react-native';

type EmptyDayStateProps = {
  className?: string;
};

export function EmptyDayState(_props: EmptyDayStateProps) {
  return (
    <View className="rounded-lg border border-dashed border-border px-3 py-4">
      <Text className="text-sm text-muted-foreground">No workouts planned.</Text>
    </View>
  );
}
