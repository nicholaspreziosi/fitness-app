import { DatePicker } from '@/components/ui/date-picker';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { View } from 'react-native';

type DatePickerSheetProps = {
  title: string;
  value?: Date;
  onConfirm: (date: Date) => void;
  onClose: () => void;
  confirmLabel?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  className?: string;
};

export function DatePickerSheet({
  title,
  value,
  onConfirm,
  onClose,
  confirmLabel = 'Confirm',
  minimumDate,
  maximumDate,
  className,
}: DatePickerSheetProps) {
  return (
    <View className={cn('p-4', className)}>
      <Text className="mb-4 text-lg font-semibold text-foreground">{title}</Text>
      <DatePicker
        value={value}
        onConfirm={onConfirm}
        onCancel={onClose}
        confirmLabel={confirmLabel}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
      />
    </View>
  );
}
