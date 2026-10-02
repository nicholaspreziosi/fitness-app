import { DatePicker as NativeDatePicker } from '@/components/nativewindui/DatePicker';
import { Button } from '@/components/ui/button';
import type { InlineDatePickerProps } from '@/components/ui/date-picker/types';
import { useDatePickerDraft } from '@/components/ui/date-picker/useDatePickerDraft';
import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';
import { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useColorScheme } from 'nativewind';
import { View } from 'react-native';

export function InlineDatePicker({
  value,
  onChange,
  minimumDate,
  maximumDate,
  disabled = false,
}: InlineDatePickerProps) {
  const { colorScheme } = useColorScheme();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';
  const { selectedDate, selectDate } = useDatePickerDraft(value);

  const handleChange = (event: DateTimePickerEvent, date?: Date) => {
    if (event.type === 'set' && date) {
      selectDate(date);
    }
  };

  return (
    <View className="items-center">
      <NativeDatePicker
        mode="date"
        display="inline"
        value={selectedDate}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        disabled={disabled}
        accentColor={THEME[scheme].brand}
        themeVariant={scheme}
        onChange={handleChange}
      />
      <View className="mt-4 w-full">
        <Button disabled={disabled} onPress={() => onChange(selectedDate)}>
          <Text>Confirm</Text>
        </Button>
      </View>
    </View>
  );
}
