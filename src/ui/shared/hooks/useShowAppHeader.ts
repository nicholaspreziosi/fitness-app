import { useSegments } from 'expo-router';
import { Platform, useWindowDimensions } from 'react-native';

const TAB_ROOT_SEGMENTS = new Set(['home', 'calendar', 'workout', 'library', 'settings']);
export const WEB_NAVBAR_MIN_WIDTH = 768;

export function shouldShowAppHeader(platform: string, width: number, segments: string[]) {
  if (platform !== 'web' || width < WEB_NAVBAR_MIN_WIDTH) {
    return false;
  }

  return isTabRootSegments(segments);
}

export function useShowAppHeader() {
  const segments = useSegments();
  const { width } = useWindowDimensions();

  return shouldShowAppHeader(Platform.OS, width, segments);
}

export function isTabRootSegments(segments: string[]) {
  const routeSegments = segments.filter((segment) => !segment.startsWith('('));

  if (routeSegments.length === 0) {
    return true;
  }

  if (routeSegments.length === 1) {
    return TAB_ROOT_SEGMENTS.has(routeSegments[0]);
  }

  return false;
}
