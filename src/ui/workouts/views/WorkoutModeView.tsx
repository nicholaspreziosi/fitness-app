import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ExerciseCard } from '@/src/ui/exercises/components/ExerciseCard';
import { WorkoutCard } from '@/src/ui/workouts/components/WorkoutCard';
import { ComponentDemoSection } from '@/src/ui/shared/components/ComponentDemoSection';
import { PageHeader } from '@/src/ui/shared/components/PageHeader';
import { ScreenContainer } from '@/src/ui/shared/components/ScreenContainer';
import { SectionHeader } from '@/src/ui/shared/components/SectionHeader';
import * as React from 'react';
import { View } from 'react-native';

export function WorkoutModeView() {
  const [showCompleted, setShowCompleted] = React.useState(true);
  const [exercises, setExercises] = React.useState([
    { id: '1', name: 'Pendulum Squat', completed: true },
    { id: '2', name: 'Leg Press', completed: false },
    { id: '3', name: 'Tib Raise', completed: false },
  ]);

  const toggleExercise = (id: string) => {
    setExercises((current) =>
      current.map((exercise) =>
        exercise.id === id ? { ...exercise, completed: !exercise.completed } : exercise
      )
    );
  };

  const completedCount = exercises.filter((exercise) => exercise.completed).length;

  return (
    <ScreenContainer>
      <PageHeader
        title="Workout"
        description="Execute today's workout with a fast checklist experience."
      />

      <WorkoutCard
        name="Wednesday Lower Body"
        dateLabel="Today"
        status="planned"
        exerciseCount={exercises.length}
        completedCount={completedCount}
      />

      <ComponentDemoSection
        title="Exercise Checklist"
        description="Linear-style rows with circular checkmarks and compact metadata.">
        <View className="flex-row items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5">
          <Label nativeID="show-completed">Show completed</Label>
          <Switch
            checked={showCompleted}
            onCheckedChange={setShowCompleted}
            nativeID="show-completed"
          />
        </View>

        {exercises.map((exercise) => {
          if (!showCompleted && exercise.completed) {
            return null;
          }

          return (
            <ExerciseCard
              key={exercise.id}
              name={exercise.name}
              bodyPart={exercise.id === '3' ? 'Lower Legs' : 'Upper Legs'}
              primaryMuscles={exercise.id === '3' ? ['Tibialis'] : ['Quads']}
              prescription="2 × 8 @ 75 lbs"
              completed={exercise.completed}
              showCheckbox
              onPress={() => toggleExercise(exercise.id)}
              onToggleComplete={() => toggleExercise(exercise.id)}
            />
          );
        })}
      </ComponentDemoSection>

      <ComponentDemoSection title="Progress">
        <View className="rounded-lg border border-border bg-muted/40 px-3 py-3">
          <SectionHeader
            title={`${completedCount} of ${exercises.length} complete`}
            description="Keep moving — checklist interaction stays fast and minimal."
          />
          <View className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <View
              className="h-full rounded-full bg-primary"
              style={{
                width: `${exercises.length === 0 ? 0 : (completedCount / exercises.length) * 100}%`,
              }}
            />
          </View>
        </View>
      </ComponentDemoSection>
    </ScreenContainer>
  );
}
