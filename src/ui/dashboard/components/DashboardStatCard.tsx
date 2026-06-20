import { Text } from '@/components/ui/text';
import { View } from 'react-native';

type DashboardStatCardProps = {
  completed: number;
  total: number;
  label: string;
  testID?: string;
};

export function DashboardStatCard({
  completed,
  total,
  label,
  testID,
}: DashboardStatCardProps) {
  return (
    <View
      testID={testID}
      className="flex-1 rounded-lg border border-border bg-card p-4">
      <Text className="text-2xl font-semibold text-foreground">
        {completed} / {total}
      </Text>
      <Text className="mt-1 text-sm text-muted-foreground">{label}</Text>
      <Text className="mt-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Completed
      </Text>
    </View>
  );
}
