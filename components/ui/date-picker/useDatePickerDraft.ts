import { startOfDay } from '@/src/lib/dates/weekBounds';
import * as React from 'react';

export function useDatePickerDraft(value?: Date) {
  const valueTime = value?.getTime();
  const valueRef = React.useRef(value);
  valueRef.current = value;

  const [selectedDate, setSelectedDate] = React.useState(() => startOfDay(value ?? new Date()));

  React.useEffect(() => {
    setSelectedDate(startOfDay(valueRef.current ?? new Date()));
  }, [valueTime]);

  const selectDate = React.useCallback((date: Date) => {
    setSelectedDate(startOfDay(date));
  }, []);

  const resetDraft = React.useCallback(() => {
    setSelectedDate(startOfDay(valueRef.current ?? new Date()));
  }, []);

  return { selectedDate, selectDate, resetDraft };
}
