import { InlineDatePicker } from '@/components/ui/date-picker';
import { cn } from '@/lib/utils';
import { View } from 'react-native';

type InlineDatePickerSheetProps = {
  value: Date;
  onSelect: (date: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  className?: string;
};

/**
 * Sheet content that applies a date the moment a day is tapped. The hosting
 * sheet provides dismissal (grabber, swipe, tap outside), so there is no
 * confirm or cancel row.
 */
export function InlineDatePickerSheet({
  value,
  onSelect,
  minimumDate,
  maximumDate,
  className,
}: InlineDatePickerSheetProps) {
  return (
    <View className={cn('p-4', className)}>
      <InlineDatePicker
        value={value}
        onChange={onSelect}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
      />
    </View>
  );
}
