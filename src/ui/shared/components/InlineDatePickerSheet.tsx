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
 * Sheet content for the inline date picker. Confirm lives on the picker so
 * the already-selected day can still be chosen.
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
