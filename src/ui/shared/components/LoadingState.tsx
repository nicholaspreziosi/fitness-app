import { cn } from '@/lib/utils';
import { ActivityIndicator, View } from 'react-native';

type LoadingStateProps = {
  className?: string;
};

export function LoadingState({ className }: LoadingStateProps) {
  return (
    <View className={cn('items-center py-6', className)} testID="loading-state">
      <ActivityIndicator accessibilityLabel="loading" size="large" />
    </View>
  );
}
