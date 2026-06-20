import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { formatWeekLabel, getWeekBounds } from '@/src/lib/dates/weekBounds';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, View } from 'react-native';

type WeekNavigatorProps = {
  weekAnchor: Date;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onOpenWeekPicker: () => void;
};

export function WeekNavigator({
  weekAnchor,
  onPreviousWeek,
  onNextWeek,
  onOpenWeekPicker,
}: WeekNavigatorProps) {
  const { weekStart, weekEnd } = getWeekBounds(weekAnchor);
  const label = formatWeekLabel(weekStart, weekEnd);

  return (
    <View className="flex-row items-center justify-between py-1">
      <Button variant="ghost" size="icon" accessibilityLabel="Previous week" onPress={onPreviousWeek}>
        <Icon as={ChevronLeftIcon} className="size-6 text-foreground" />
      </Button>

      <Button
        variant="outline"
        onPress={onOpenWeekPicker}
        className="rounded-lg px-3 py-1.5">
        <Text className="text-base font-semibold text-foreground">{label}</Text>
      </Button>

      <Button variant="ghost" size="icon" accessibilityLabel="Next week" onPress={onNextWeek}>
        <Icon as={ChevronRightIcon} className="size-6 text-foreground" />
      </Button>
    </View>
  );
}
