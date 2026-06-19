import { useSegments } from 'expo-router';

const TAB_ROOT_SEGMENTS = new Set(['home', 'planner', 'workout', 'library', 'settings']);

export function useShowAppHeader() {
  const segments = useSegments();
  const routeSegments = segments.filter((segment) => !segment.startsWith('('));

  if (routeSegments.length === 0) {
    return true;
  }

  if (routeSegments.length === 1) {
    return TAB_ROOT_SEGMENTS.has(routeSegments[0]);
  }

  return false;
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
