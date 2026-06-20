jest.mock('@/src/ui/workouts/hooks/useWeeklyWorkouts', () => ({
  useWeeklyWorkouts: jest.fn(),
}));

import { filterActiveWorkoutsForDate } from '@/src/contexts/workouts/domain/workoutSession.rules';
import { useTodayActiveWorkouts } from '@/src/ui/workouts/hooks/useTodayActiveWorkouts';
import { useWeeklyWorkouts } from '@/src/ui/workouts/hooks/useWeeklyWorkouts';
import { createMockWorkout } from '@/test-utils/mockData';
import { createTestDate } from '@/test-utils/testDates';
import { renderHook } from '@testing-library/react-native';

const useWeeklyWorkoutsMock = jest.mocked(useWeeklyWorkouts);

describe('useTodayActiveWorkouts', () => {
  const today = createTestDate();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns empty when there are no planned or in-progress workouts today', () => {
    useWeeklyWorkoutsMock.mockReturnValue({
      workouts: [
        createMockWorkout({ id: 'completed', status: 'completed', date: today }),
        createMockWorkout({ id: 'other-day', status: 'planned', date: createTestDate(1) }),
      ],
      weekStart: today,
      weekEnd: today,
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });

    const { result } = renderHook(() => useTodayActiveWorkouts(today));

    expect(result.current.workouts).toEqual([]);
  });

  it('returns planned and in-progress workouts for today', () => {
    const workouts = [
      createMockWorkout({ id: 'planned', status: 'planned', date: today }),
      createMockWorkout({ id: 'in-progress', status: 'inProgress', date: today }),
      createMockWorkout({ id: 'completed', status: 'completed', date: today }),
      createMockWorkout({ id: 'skipped', status: 'skipped', date: today }),
      createMockWorkout({ id: 'draft', status: 'draft', date: today }),
      createMockWorkout({ id: 'archived', status: 'archived', date: today }),
    ];

    useWeeklyWorkoutsMock.mockReturnValue({
      workouts,
      weekStart: today,
      weekEnd: today,
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });

    const { result } = renderHook(() => useTodayActiveWorkouts(today));

    expect(result.current.workouts).toEqual(filterActiveWorkoutsForDate(workouts, today));
    expect(result.current.workouts.map((workout) => workout.id)).toEqual([
      'planned',
      'in-progress',
    ]);
  });
});
