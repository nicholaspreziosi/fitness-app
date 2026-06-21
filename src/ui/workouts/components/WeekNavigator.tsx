import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { formatWeekLabel, getWeekBounds } from '@/src/lib/dates/weekBounds';
import { useWeekStartDay } from '@/src/ui/profile/hooks/useWeekStartDay';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

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
  const weekStartDay = useWeekStartDay();
  const { weekStart, weekEnd } = getWeekBounds(weekAnchor, weekStartDay);
  const label = formatWeekLabel(weekStart, weekEnd);

  const swipeGesture = React.useMemo(() => {
    const goPrevious = () => onPreviousWeek();
    const goNext = () => onNextWeek();

    return Gesture.Pan()
      .activeOffsetX([-30, 30])
      .failOffsetY([-20, 20])
      .onEnd((event) => {
        'worklet';

        if (event.translationX > 50) {
          runOnJS(goPrevious)();
        } else if (event.translationX < -50) {
          runOnJS(goNext)();
        }
      });
  }, [onNextWeek, onPreviousWeek]);

  return (
    <GestureDetector gesture={swipeGesture}>
      <View className="flex-row items-center justify-between py-1">
        <Button
          variant="ghost"
          size="icon"
          accessibilityLabel="Previous week"
          onPress={onPreviousWeek}>
          <Icon as={ChevronLeftIcon} className="size-6 text-foreground" />
        </Button>

        <Button variant="outline" onPress={onOpenWeekPicker} className="rounded-lg px-3 py-1.5">
          <Text className="text-base font-semibold text-foreground">{label}</Text>
        </Button>

        <Button variant="ghost" size="icon" accessibilityLabel="Next week" onPress={onNextWeek}>
          <Icon as={ChevronRightIcon} className="size-6 text-foreground" />
        </Button>
      </View>
    </GestureDetector>
  );
}
