import { Button } from '@/components/ui/button';
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
    <View className={cn('rounded-t-xl border border-border bg-surface p-4', className)}>
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-foreground">{title}</Text>
        <Button variant="ghost" size="sm" onPress={onClose}>
          <Text>Close</Text>
        </Button>
      </View>
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
