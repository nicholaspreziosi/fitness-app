import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import { ComponentDemoSection } from '@/src/ui/shared/components/ComponentDemoSection';
import { EmptyState } from '@/src/ui/shared/components/EmptyState';
import { LoadingState } from '@/src/ui/shared/components/LoadingState';
import { PageHeader } from '@/src/ui/shared/components/PageHeader';
import { ScreenContainer } from '@/src/ui/shared/components/ScreenContainer';
import { SectionHeader } from '@/src/ui/shared/components/SectionHeader';
import { CalendarDaysIcon, PlusIcon } from 'lucide-react-native';
import { View } from 'react-native';

const COVERAGE_ITEMS = [
  { label: 'Shoulders', count: 3, warning: false },
  { label: 'Core', count: 2, warning: false },
  { label: 'Foot', count: 0, warning: true },
];

export function DashboardView() {
  return (
    <ScreenContainer>
      <PageHeader title="Flow" description="Weekly overview and training coverage insights." />

      <ComponentDemoSection
        title="This Week"
        description="Body part coverage from completed and planned workouts.">
        <View className="rounded-lg border border-border bg-card p-3">
          <SectionHeader title="Coverage" description="Exercises trained this week by area." />
          <View className="gap-1.5">
            {COVERAGE_ITEMS.map((item) => (
              <View
                key={item.label}
                className="flex-row items-center justify-between rounded-md px-2 py-2 active:bg-muted/50">
                <Text className="text-sm text-foreground">{item.label}</Text>
                <Badge variant={item.warning ? 'warning' : 'muted'}>
                  <Text>{item.warning ? `${item.count} ⚠` : item.count}</Text>
                </Badge>
              </View>
            ))}
          </View>
        </View>
      </ComponentDemoSection>

      <ComponentDemoSection title="Feedback States">
        <LoadingState message="Loading weekly summary..." />
        <EmptyState
          actionIcon={PlusIcon}
          icon={CalendarDaysIcon}
          title="No workouts this week"
          description="Plan your first session in the Calendar tab to start tracking coverage."
          actionLabel="Plan workout"
        />
      </ComponentDemoSection>
    </ScreenContainer>
  );
}
