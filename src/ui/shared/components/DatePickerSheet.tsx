import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { startOfDay } from '@/src/lib/dates/weekBounds';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import * as React from 'react';
import { Platform, View } from 'react-native';

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

function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function fromDateInputValue(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return startOfDay(new Date(year!, month! - 1, day));
}

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
  const [selectedDate, setSelectedDate] = React.useState(() => startOfDay(value ?? new Date()));

  React.useEffect(() => {
    if (value) {
      setSelectedDate(startOfDay(value));
    }
  }, [value]);

  const handleChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (date) {
      setSelectedDate(startOfDay(date));
    }
  };

  const handleWebChange = (nextValue: string) => {
    if (nextValue) {
      setSelectedDate(fromDateInputValue(nextValue));
    }
  };

  const handleConfirm = () => {
    onConfirm(selectedDate);
  };

  return (
    <View className={cn('rounded-t-2xl border border-border bg-card p-4', className)}>
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-foreground">{title}</Text>
        <Button variant="ghost" size="sm" onPress={onClose}>
          <Text>Close</Text>
        </Button>
      </View>

      <Text className="mb-3 text-sm text-muted-foreground">
        {selectedDate.toLocaleDateString(undefined, {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })}
      </Text>

      {Platform.OS === 'web' ? (
        <input
          type="date"
          value={toDateInputValue(selectedDate)}
          min={minimumDate ? toDateInputValue(minimumDate) : undefined}
          max={maximumDate ? toDateInputValue(maximumDate) : undefined}
          onChange={(event) => handleWebChange(event.currentTarget.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-3 text-foreground"
        />
      ) : (
        <View className="items-center">
          <DateTimePicker
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
            value={selectedDate}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            onChange={handleChange}
          />
        </View>
      )}

      <View className="mt-4 flex-row justify-end gap-2">
        <Button variant="outline" onPress={onClose}>
          <Text>Cancel</Text>
        </Button>
        <Button onPress={handleConfirm}>
          <Text>{confirmLabel}</Text>
        </Button>
      </View>
    </View>
  );
}
