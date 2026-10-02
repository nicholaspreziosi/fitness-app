import { DatePicker } from '@/components/ui/date-picker';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { startOfDay } from '@/src/lib/dates/weekBounds';
import { useRefreshGuardFlag } from '@/src/ui/shared/providers/RefreshGuardProvider';
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
  const selectedDate = React.useMemo(() => startOfDay(value), [value]);
  const [showNativePicker, setShowNativePicker] = React.useState(false);

  useRefreshGuardFlag('inputFocused', showNativePicker);

  const openPicker = React.useCallback(() => {
    setShowNativePicker(true);
  }, []);

  return (
    <View className={cn('gap-2', className)}>
      {showLabel ? <Text className="text-sm font-medium text-foreground">{label}</Text> : null}

      {Platform.OS === 'web' ? (
        <DatePicker
          value={selectedDate}
          onConfirm={onChange}
          onCancel={() => undefined}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          disabled={disabled}
        />
      ) : (
        <View className="items-start gap-2">
          <Pressable
            accessibilityRole="button"
            disabled={disabled}
            className={cn(
              'h-12 flex-row items-center gap-2 rounded-lg border border-border bg-background px-3',
              disabled && 'opacity-40'
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
                  className="rounded-t-xl border border-border bg-surface p-4"
                  onPress={(event) => event.stopPropagation()}>
                  <View className="mb-4 flex-row items-center justify-between">
                    <Text className="text-lg font-semibold text-foreground">Select Date</Text>
                    <Button variant="ghost" size="sm" onPress={() => setShowNativePicker(false)}>
                      <Text>Close</Text>
                    </Button>
                  </View>
                  <DatePicker
                    value={selectedDate}
                    onCancel={() => setShowNativePicker(false)}
                    onConfirm={(date) => {
                      onChange(date);
                      setShowNativePicker(false);
                    }}
                    minimumDate={minimumDate}
                    maximumDate={maximumDate}
                    disabled={disabled}
                  />
                </Pressable>
              </View>
            </View>
          </Modal>
        </View>
      )}
    </View>
  );
}
