import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { startOfDay } from '@/src/lib/dates/weekBounds';
import { useRefreshGuardFlag } from '@/src/ui/shared/providers/RefreshGuardProvider';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { CalendarDaysIcon, ChevronDownIcon } from 'lucide-react-native';
import * as React from 'react';
import { Modal, Platform, Pressable, View } from 'react-native';

type DatePickerFieldProps = {
  label?: string;
  showLabel?: boolean;
  value: Date;
  onChange: (date: Date) => void;
  disabled?: boolean;
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

export function DatePickerField({
  label = 'Date',
  showLabel = true,
  value,
  onChange,
  disabled = false,
  minimumDate,
  maximumDate,
  className,
}: DatePickerFieldProps) {
  const selectedDate = React.useMemo(() => startOfDay(value), [value.getTime()]);
  const [showNativePicker, setShowNativePicker] = React.useState(false);
  const [draftDate, setDraftDate] = React.useState(selectedDate);

  useRefreshGuardFlag('inputFocused', showNativePicker);

  const openPicker = React.useCallback(() => {
    setDraftDate(selectedDate);
    setShowNativePicker(true);
  }, [selectedDate]);

  const handleChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (date) {
      setDraftDate(startOfDay(date));
    }
  };

  const handleWebChange = (nextValue: string) => {
    if (nextValue && !disabled) {
      onChange(fromDateInputValue(nextValue));
    }
  };

  return (
    <View className={cn('gap-2', className)}>
      {showLabel ? <Text className="text-sm font-medium text-foreground">{label}</Text> : null}

      {Platform.OS === 'web' ? (
        <input
          type="date"
          value={toDateInputValue(selectedDate)}
          min={minimumDate ? toDateInputValue(minimumDate) : undefined}
          max={maximumDate ? toDateInputValue(maximumDate) : undefined}
          disabled={disabled}
          onChange={(event) => handleWebChange(event.currentTarget.value)}
          className="inline-flex min-w-44 rounded-lg border border-border bg-background px-3 py-2 text-foreground disabled:opacity-50"
        />
      ) : (
        <View className="items-start gap-2">
          <Pressable
            accessibilityRole="button"
            disabled={disabled}
            className={cn(
              'flex-row items-center gap-2 rounded-lg border border-border bg-background px-3 py-2',
              disabled && 'opacity-50'
            )}
            onPress={openPicker}>
            <Icon as={CalendarDaysIcon} className="size-4 text-muted-foreground" />
            <Text className="text-sm text-foreground">
              {selectedDate.toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
            <Icon as={ChevronDownIcon} className="size-4 text-muted-foreground" />
          </Pressable>

          <Modal
            visible={showNativePicker}
            transparent
            animationType="none"
            onRequestClose={() => setShowNativePicker(false)}>
            <View className="flex-1">
              <Pressable
                className="absolute inset-0 bg-black/40"
                onPress={() => setShowNativePicker(false)}
              />
              <View className="flex-1 justify-end" pointerEvents="box-none">
                <Pressable
                  className="rounded-t-xl border border-border bg-card p-4"
                  onPress={(event) => event.stopPropagation()}>
                <View className="mb-4 flex-row items-center justify-between">
                  <Text className="text-lg font-semibold text-foreground">Select Date</Text>
                  <Button variant="ghost" size="sm" onPress={() => setShowNativePicker(false)}>
                    <Text>Close</Text>
                  </Button>
                </View>

                <View className="items-center">
                  <DateTimePicker
                    mode="date"
                    display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
                    value={draftDate}
                    minimumDate={minimumDate}
                    maximumDate={maximumDate}
                    disabled={disabled}
                    onChange={handleChange}
                  />
                </View>

                <View className="mt-4 flex-row justify-end gap-2">
                  <Button variant="outline" onPress={() => setShowNativePicker(false)}>
                    <Text>Cancel</Text>
                  </Button>
                  <Button
                    onPress={() => {
                      onChange(draftDate);
                      setShowNativePicker(false);
                    }}>
                    <Text>Confirm</Text>
                  </Button>
                </View>
              </Pressable>
            </View>
          </View>
          </Modal>
        </View>
      )}
    </View>
  );
}
