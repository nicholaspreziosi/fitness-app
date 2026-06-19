import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  type Option,
} from '@/components/ui/select';
import { WorkoutCard } from '@/src/ui/workouts/components/WorkoutCard';
import { ComponentDemoSection } from '@/src/ui/shared/components/ComponentDemoSection';
import { PageHeader } from '@/src/ui/shared/components/PageHeader';
import { ScreenContainer } from '@/src/ui/shared/components/ScreenContainer';
import * as React from 'react';
import { View } from 'react-native';

export function WeeklyPlannerView() {
  const [weekOffset, setWeekOffset] = React.useState<Option | undefined>({
    value: '0',
    label: 'This week',
  });

  return (
    <ScreenContainer>
      <PageHeader
        title="Planner"
        description="Plan workouts for the week from template blocks."
      />

      <ComponentDemoSection title="Week Selector">
        <View className="gap-2">
          <Label>View week</Label>
          <Select value={weekOffset} onValueChange={setWeekOffset}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select week" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem label="This week" value="0" />
              <SelectItem label="Next week" value="1" />
              <SelectItem label="Last week" value="-1" />
            </SelectContent>
          </Select>
        </View>
      </ComponentDemoSection>

      <ComponentDemoSection
        title="Planned Workouts"
        description="WorkoutCard previews for the weekly schedule.">
        <WorkoutCard
          name="Wednesday Lower Body"
          dateLabel="Wed, Jun 18"
          status="planned"
          exerciseCount={6}
          completedCount={0}
        />
        <WorkoutCard
          name="Friday Shoulder Rehab"
          dateLabel="Fri, Jun 20"
          status="draft"
          exerciseCount={4}
        />
        <WorkoutCard
          name="Saturday Upper Body"
          dateLabel="Sat, Jun 14"
          status="completed"
          exerciseCount={5}
          completedCount={5}
        />
      </ComponentDemoSection>
    </ScreenContainer>
  );
}
