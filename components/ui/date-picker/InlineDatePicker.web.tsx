import { WebDateCalendar } from '@/components/ui/date-picker/WebDateCalendar';
import type { InlineDatePickerProps } from '@/components/ui/date-picker/types';
import { useDatePickerDraft } from '@/components/ui/date-picker/useDatePickerDraft';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { View } from 'react-native';

export function InlineDatePicker({
  value,
  onChange,
  minimumDate,
  maximumDate,
  disabled = false,
}: InlineDatePickerProps) {
  const { selectedDate, selectDate } = useDatePickerDraft(value);

  return (
    <View className="items-center">
      <WebDateCalendar
        selectedDate={selectedDate}
        onSelect={selectDate}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        disabled={disabled}
      />
      <View className="mt-4 w-full">
        <Button disabled={disabled} onPress={() => onChange(selectedDate)}>
          <Text>Confirm</Text>
        </Button>
      </View>
    </View>
  );
}
