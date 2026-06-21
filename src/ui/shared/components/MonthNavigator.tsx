import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { formatMonthLabel } from '@/src/lib/dates/monthBounds';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

type MonthNavigatorProps = {
  monthAnchor: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onOpenMonthPicker: () => void;
};

export function MonthNavigator({
  monthAnchor,
  onPreviousMonth,
  onNextMonth,
  onOpenMonthPicker,
}: MonthNavigatorProps) {
  const label = formatMonthLabel(monthAnchor);

  const swipeGesture = React.useMemo(() => {
    const goPrevious = () => onPreviousMonth();
    const goNext = () => onNextMonth();

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
  }, [onNextMonth, onPreviousMonth]);

  return (
    <GestureDetector gesture={swipeGesture}>
      <View testID="month-navigator" className="flex-row items-center justify-between py-1">
        <Button
          variant="ghost"
          size="icon"
          accessibilityLabel="Previous month"
          testID="month-navigator-previous"
          onPress={onPreviousMonth}>
          <Icon as={ChevronLeftIcon} className="size-6 text-foreground" />
        </Button>

        <Button
          variant="outline"
          testID="month-navigator-label"
          onPress={onOpenMonthPicker}
          className="rounded-lg px-3 py-1.5">
          <Text className="text-base font-semibold text-foreground">{label}</Text>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          accessibilityLabel="Next month"
          testID="month-navigator-next"
          onPress={onNextMonth}>
          <Icon as={ChevronRightIcon} className="size-6 text-foreground" />
        </Button>
      </View>
    </GestureDetector>
  );
}
