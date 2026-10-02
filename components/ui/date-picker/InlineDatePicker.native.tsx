import { DatePicker as NativeDatePicker } from '@/components/nativewindui/DatePicker';
import type { InlineDatePickerProps } from '@/components/ui/date-picker/types';
import { THEME } from '@/lib/theme';
import { startOfDay } from '@/src/lib/dates/weekBounds';
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

  const handleChange = (event: DateTimePickerEvent, date?: Date) => {
    if (event.type === 'set' && date) {
      onChange(startOfDay(date));
    }
  };

  return (
    <View className="items-center">
      <NativeDatePicker
        mode="date"
        display="inline"
        value={value}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        disabled={disabled}
        accentColor={THEME[scheme].brand}
        themeVariant={scheme}
        onChange={handleChange}
      />
    </View>
  );
}
