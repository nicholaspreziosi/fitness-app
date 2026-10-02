import { Button } from '@/components/ui/button';
import { DatePicker as NativeDatePicker } from '@/components/nativewindui/DatePicker';
import type { DatePickerProps } from '@/components/ui/date-picker/types';
import { useDatePickerDraft } from '@/components/ui/date-picker/useDatePickerDraft';
import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';
import { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useColorScheme } from 'nativewind';
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
  const { colorScheme } = useColorScheme();
  const { selectedDate, selectDate, resetDraft } = useDatePickerDraft(value);

  const handleChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (date) {
      selectDate(date);
    }
  };

  const handleCancel = () => {
    resetDraft();
    onCancel();
  };

  return (
    <View>
      <NativeDatePicker
        accentColor={THEME[colorScheme === 'dark' ? 'dark' : 'light'].brand}
        mode="date"
        value={selectedDate}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        disabled={disabled}
        onChange={handleChange}
      />
      <View className="mt-4 flex-row justify-end gap-2">
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
