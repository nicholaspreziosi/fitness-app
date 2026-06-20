import { Text } from '@/components/ui/text';
import { EmptyState } from '@/src/ui/shared/components/EmptyState';
import { View } from 'react-native';

type DashboardEmptyStateProps = {
  message: string;
  testID?: string;
};

export function DashboardEmptyState({ message, testID }: DashboardEmptyStateProps) {
  return (
    <View testID={testID} className="rounded-lg border border-border bg-card p-4">
      <EmptyState title={message} description="" />
    </View>
  );
}

export function DashboardChartEmptyState({ message, testID }: DashboardEmptyStateProps) {
  return (
    <View
      testID={testID}
      className="min-h-[180px] items-center justify-center rounded-lg border border-border bg-card p-6">
      <Text className="text-center text-sm text-muted-foreground">{message}</Text>
    </View>
  );
}
