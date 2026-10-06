import { Button } from '@/components/ui/button';
import type { DatePickerProps } from '@/components/ui/date-picker/types';
import { useDatePickerDraft } from '@/components/ui/date-picker/useDatePickerDraft';
import { WebDateCalendar } from '@/components/ui/date-picker/WebDateCalendar';
import { Text } from '@/components/ui/text';
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
      <WebDateCalendar
        selectedDate={selectedDate}
        onSelect={selectDate}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        disabled={disabled}
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
