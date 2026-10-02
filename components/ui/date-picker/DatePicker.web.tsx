import { Button } from '@/components/ui/button';
import { fromDateInputValue, toDateInputValue } from '@/components/ui/date-picker/datePickerValue';
import type { DatePickerProps } from '@/components/ui/date-picker/types';
import { Text } from '@/components/ui/text';
import { useDatePickerDraft } from '@/components/ui/date-picker/useDatePickerDraft';
import { View } from 'react-native';

export function DatePicker({
  value,
  onConfirm,
  onCancel,
  minimumDate,
  maximumDate,
  confirmLabel = 'Confirm',
  disabled = false,
}: DatePickerProps) {
  const { selectedDate, selectDate, resetDraft } = useDatePickerDraft(value);

  const handleCancel = () => {
    resetDraft();
    onCancel();
  };

  return (
    <View className="gap-3">
      <input
        type="date"
        aria-label="Date"
        value={toDateInputValue(selectedDate)}
        min={minimumDate ? toDateInputValue(minimumDate) : undefined}
        max={maximumDate ? toDateInputValue(maximumDate) : undefined}
        disabled={disabled}
        onChange={(event) => {
          const nextValue = event.currentTarget.value;
          if (nextValue) {
            selectDate(fromDateInputValue(nextValue));
          }
        }}
        className="accent-brand h-12 w-full rounded-lg border border-border bg-background px-3 text-foreground disabled:opacity-40"
      />
      <View className="flex-row justify-end gap-2">
        <Button variant="outline" onPress={handleCancel} disabled={disabled}>
          <Text>Cancel</Text>
        </Button>
        <Button onPress={() => onConfirm(selectedDate)} disabled={disabled}>
          <Text>{confirmLabel}</Text>
        </Button>
      </View>
    </View>
  );
}
