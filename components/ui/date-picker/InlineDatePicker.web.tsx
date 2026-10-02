import { fromDateInputValue, toDateInputValue } from '@/components/ui/date-picker/datePickerValue';
import type { InlineDatePickerProps } from '@/components/ui/date-picker/types';

export function InlineDatePicker({
  value,
  onChange,
  minimumDate,
  maximumDate,
  disabled = false,
}: InlineDatePickerProps) {
  return (
    <input
      type="date"
      aria-label="Date"
      value={toDateInputValue(value)}
      min={minimumDate ? toDateInputValue(minimumDate) : undefined}
      max={maximumDate ? toDateInputValue(maximumDate) : undefined}
      disabled={disabled}
      onChange={(event) => {
        const nextValue = event.currentTarget.value;
        if (nextValue) {
          onChange(fromDateInputValue(nextValue));
        }
      }}
      className="h-12 w-full rounded-lg border border-border bg-background px-3 text-foreground accent-brand disabled:opacity-40"
    />
  );
}
