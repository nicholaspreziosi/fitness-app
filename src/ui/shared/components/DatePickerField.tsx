import { InlineDatePicker } from '@/components/ui/date-picker';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { startOfDay } from '@/src/lib/dates/weekBounds';
import { BottomSheet } from '@/src/ui/shared/components/BottomSheet';
import { InlineDatePickerSheet } from '@/src/ui/shared/components/InlineDatePickerSheet';
import { useRefreshGuardFlag } from '@/src/ui/shared/providers/RefreshGuardProvider';
import { CalendarDaysIcon } from 'lucide-react-native';
import * as React from 'react';
import { Platform, Pressable, View } from 'react-native';

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
  const [sheetOpen, setSheetOpen] = React.useState(false);

  useRefreshGuardFlag('inputFocused', sheetOpen);

  return (
    <View className={cn('gap-2', className)}>
      {showLabel ? <Text className="text-sm font-medium text-foreground">{label}</Text> : null}

      {Platform.OS === 'web' ? (
        <InlineDatePicker
          value={selectedDate}
          onChange={onChange}
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
            onPress={() => setSheetOpen(true)}>
            <Icon as={CalendarDaysIcon} className="size-4 text-muted-foreground" />
            <Text className="text-sm text-foreground">
              {selectedDate.toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </Pressable>

          <BottomSheet visible={sheetOpen} onClose={() => setSheetOpen(false)}>
            <InlineDatePickerSheet
              value={selectedDate}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              onSelect={(date) => {
                onChange(date);
                setSheetOpen(false);
              }}
            />
          </BottomSheet>
        </View>
      )}
    </View>
  );
}
