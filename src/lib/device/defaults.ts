import * as Localization from 'expo-localization';

export type DeviceDefaults = {
  language?: string;
  country?: string;
  timeZone?: string;
};

export function getDeviceDefaults(): DeviceDefaults {
  const locales = Localization.getLocales();
  const primaryLocale = locales[0];
  const calendars = Localization.getCalendars();
  const primaryCalendar = calendars[0];

  return {
    language: primaryLocale?.languageTag,
    country: primaryLocale?.regionCode ?? undefined,
    timeZone: primaryCalendar?.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}
