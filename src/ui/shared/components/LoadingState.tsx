import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { ActivityIndicator, View } from 'react-native';

type LoadingStateProps = {
  message?: string;
  className?: string;
};

export function LoadingState({ message = 'Loading...', className }: LoadingStateProps) {
  return (
    <View
      className={cn(
        'items-center justify-center rounded-lg border border-border bg-card px-6 py-10',
        className
      )}>
      <ActivityIndicator size="large" />
      <Text className="mt-3 text-sm text-muted-foreground">{message}</Text>
    </View>
  );
}
