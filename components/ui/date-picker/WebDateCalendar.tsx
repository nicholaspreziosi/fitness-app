import { formatMonthLabel } from '@/src/lib/dates/monthBounds';
import { startOfDay } from '@/src/lib/dates/weekBounds';
import * as React from 'react';
import { DayPicker, type Matcher } from 'react-day-picker';

type WebDateCalendarProps = {
  selectedDate: Date;
  onSelect: (date: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  disabled?: boolean;
};

type CalendarMode = 'days' | 'wheels';

const WHEEL_ITEM_HEIGHT = 36;
const WHEEL_HEIGHT = 216;
const WHEEL_PAD = (WHEEL_HEIGHT - WHEEL_ITEM_HEIGHT) / 2;
const YEAR_RADIUS = 5;

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function isMonthOutOfRange(monthDate: Date, minimumDate?: Date, maximumDate?: Date) {
  const start = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const end = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
  if (minimumDate && end < startOfDay(minimumDate)) {
    return true;
  }
  if (maximumDate && start > startOfDay(maximumDate)) {
    return true;
  }
  return false;
}

function nearestEnabledMonth(
  year: number,
  monthIndex: number,
  minimumDate?: Date,
  maximumDate?: Date
) {
  if (!isMonthOutOfRange(new Date(year, monthIndex, 1), minimumDate, maximumDate)) {
    return monthIndex;
  }

  for (let distance = 1; distance < 12; distance += 1) {
    const before = monthIndex - distance;
    const after = monthIndex + distance;
    if (before >= 0 && !isMonthOutOfRange(new Date(year, before, 1), minimumDate, maximumDate)) {
      return before;
    }
    if (after <= 11 && !isMonthOutOfRange(new Date(year, after, 1), minimumDate, maximumDate)) {
      return after;
    }
  }

  return monthIndex;
}

function visibleDateBounds(minimumDate?: Date, maximumDate?: Date) {
  const thisYear = new Date().getFullYear();
  const windowStart = startOfDay(new Date(thisYear - YEAR_RADIUS, 0, 1));
  const windowEnd = startOfDay(new Date(thisYear + YEAR_RADIUS, 11, 31));
  const minimum = !minimumDate || minimumDate < windowStart ? windowStart : minimumDate;
  const maximum = !maximumDate || maximumDate > windowEnd ? windowEnd : maximumDate;
  return { minimum, maximum };
}

function yearRange(minimumDate?: Date, maximumDate?: Date) {
  const { minimum, maximum } = visibleDateBounds(minimumDate, maximumDate);
  const start = minimum.getFullYear();
  const end = maximum.getFullYear();
  const years: number[] = [];
  for (let year = start; year <= end; year += 1) {
    years.push(year);
  }
  return years;
}

type WheelOption = {
  id: string;
  label: string;
  disabled?: boolean;
};

function IosWheelColumn({
  label,
  options,
  value,
  onChange,
  className,
}: {
  label: string;
  options: WheelOption[];
  value: string;
  onChange: (id: string) => void;
  className: string;
}) {
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const valueRef = React.useRef(value);
  valueRef.current = value;
  const optionsRef = React.useRef(options);
  optionsRef.current = options;

  React.useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || typeof scroller.scrollTo !== 'function') {
      return;
    }

    const index = options.findIndex((option) => option.id === value);
    if (index < 0) {
      return;
    }

    const top = index * WHEEL_ITEM_HEIGHT;
    if (Math.abs(scroller.scrollTop - top) <= 1) {
      return;
    }

    scroller.scrollTo({ top, behavior: 'auto' });
  }, [options, value]);

  React.useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }

    let timer = 0;
    const settle = () => {
      const index = Math.round(scroller.scrollTop / WHEEL_ITEM_HEIGHT);
      const option = optionsRef.current[index];
      if (!option || option.disabled || option.id === valueRef.current) {
        return;
      }
      onChange(option.id);
    };

    const onScroll = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(settle, 80);
    };

    scroller.addEventListener('scroll', onScroll, { passive: true });
    scroller.addEventListener('scrollend', settle);
    return () => {
      window.clearTimeout(timer);
      scroller.removeEventListener('scroll', onScroll);
      scroller.removeEventListener('scrollend', settle);
    };
  }, [onChange]);

  return (
    <div
      ref={scrollerRef}
      className={className}
      role="listbox"
      aria-label={label}
      onWheel={(event) => event.stopPropagation()}>
      <div className="ios-wheel-pad" style={{ height: WHEEL_PAD }} />
      {options.map((option) => {
        const selected = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            role="option"
            className="ios-wheel-item"
            aria-label={option.label}
            aria-selected={selected}
            data-selected={selected ? 'true' : undefined}
            disabled={option.disabled}
            onClick={() => {
              if (!option.disabled) {
                onChange(option.id);
              }
            }}>
            {option.label}
          </button>
        );
      })}
      <div className="ios-wheel-pad" style={{ height: WHEEL_PAD }} />
    </div>
  );
}

function buildDisabledMatchers(
  disabled: boolean,
  minimumDate?: Date,
  maximumDate?: Date
): Matcher | Matcher[] {
  if (disabled) {
    return true;
  }

  const matchers: Matcher[] = [];
  if (minimumDate) {
    matchers.push({ before: startOfDay(minimumDate) });
  }
  if (maximumDate) {
    matchers.push({ after: startOfDay(maximumDate) });
  }
  return matchers;
}

function Chevron({
  direction,
  size = 13,
}: {
  direction: 'left' | 'right' | 'up' | 'down';
  size?: number;
}) {
  const paths = {
    left: 'M14.5 5.5 8 12l6.5 6.5',
    right: 'M9.5 5.5 16 12l-6.5 6.5',
    down: 'M6.5 9.5 12 15l5.5-5.5',
    up: 'M6.5 14.5 12 9l5.5 5.5',
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{ display: 'block', pointerEvents: 'none' }}>
      <path
        d={paths[direction]}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function WebDateCalendar({
  selectedDate,
  onSelect,
  minimumDate,
  maximumDate,
  disabled = false,
}: WebDateCalendarProps) {
  const selectedDayTime = startOfDay(selectedDate).getTime();
  const [month, setMonth] = React.useState(() => startOfMonth(selectedDate));
  const [mode, setMode] = React.useState<CalendarMode>('days');

  React.useEffect(() => {
    const selected = new Date(selectedDayTime);
    setMonth(startOfMonth(selected));
    setMode('days');
  }, [selectedDayTime]);

  const { minimum: earliestDate, maximum: latestDate } = visibleDateBounds(
    minimumDate,
    maximumDate
  );
  const previousDisabled =
    disabled ||
    isMonthOutOfRange(
      new Date(month.getFullYear(), month.getMonth() - 1, 1),
      earliestDate,
      latestDate
    );
  const nextDisabled =
    disabled ||
    isMonthOutOfRange(
      new Date(month.getFullYear(), month.getMonth() + 1, 1),
      earliestDate,
      latestDate
    );

  const monthOptions = MONTH_NAMES.map((label, index) => ({
    id: String(index),
    label,
    disabled:
      disabled ||
      isMonthOutOfRange(new Date(month.getFullYear(), index, 1), earliestDate, latestDate),
  }));
  const years = yearRange(minimumDate, maximumDate).map((year) => ({
    id: String(year),
    label: String(year),
  }));

  const showWheels = () => {
    setMode('wheels');
  };

  const showDayGrid = () => {
    setMode('days');
  };

  const goPrevious = () => {
    if (previousDisabled) {
      return;
    }
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1));
  };

  const goNext = () => {
    if (nextDisabled) {
      return;
    }
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1));
  };

  const chooseMonth = (monthId: string) => {
    const monthIndex = Number(monthId);
    if (isMonthOutOfRange(new Date(month.getFullYear(), monthIndex, 1), earliestDate, latestDate)) {
      return;
    }
    setMonth(new Date(month.getFullYear(), monthIndex, 1));
  };

  const chooseYear = (yearId: string) => {
    const year = Number(yearId);
    const monthIndex = nearestEnabledMonth(year, month.getMonth(), earliestDate, latestDate);
    setMonth(new Date(year, monthIndex, 1));
  };

  return (
    <div className="ios-date-picker">
      <div className="ios-date-picker-header">
        <button
          type="button"
          className="ios-date-picker-title"
          aria-expanded={mode === 'wheels'}
          aria-label={mode === 'wheels' ? 'Show days' : 'Choose month and year'}
          onClick={mode === 'wheels' ? showDayGrid : showWheels}>
          {formatMonthLabel(month)}
          <Chevron direction={mode === 'wheels' ? 'up' : 'down'} size={11} />
        </button>
        {mode === 'days' ? (
          <div className="ios-date-picker-nav">
            <button
              type="button"
              className="ios-date-picker-nav-button"
              aria-label="Previous month"
              disabled={previousDisabled}
              onClick={goPrevious}>
              <Chevron direction="left" />
            </button>
            <button
              type="button"
              className="ios-date-picker-nav-button"
              aria-label="Next month"
              disabled={nextDisabled}
              onClick={goNext}>
              <Chevron direction="right" />
            </button>
          </div>
        ) : null}
      </div>
      {mode === 'wheels' ? (
        <div className="ios-wheel-picker" style={{ height: WHEEL_HEIGHT }}>
          <div className="ios-wheel-highlight" aria-hidden="true" />
          <IosWheelColumn
            label="Month"
            className="ios-wheel ios-wheel-month"
            options={monthOptions}
            value={String(month.getMonth())}
            onChange={chooseMonth}
          />
          <IosWheelColumn
            label="Year"
            className="ios-wheel ios-wheel-year"
            options={years}
            value={String(month.getFullYear())}
            onChange={chooseYear}
          />
        </div>
      ) : (
        <DayPicker
          mode="single"
          required
          animate={false}
          hideNavigation
          showOutsideDays
          month={month}
          onMonthChange={setMonth}
          selected={selectedDate}
          disabled={buildDisabledMatchers(disabled, earliestDate, latestDate)}
          onSelect={onSelect}
          formatters={{
            formatWeekdayName: (date) => date.toLocaleDateString(undefined, { weekday: 'narrow' }),
          }}
        />
      )}
    </div>
  );
}
