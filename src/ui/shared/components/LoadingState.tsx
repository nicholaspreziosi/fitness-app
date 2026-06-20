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
        'flex-1 h-full items-center justify-center px-6 py-10',
        className
      )}>
      <ActivityIndicator size="large" />
    </View>
  );
}
